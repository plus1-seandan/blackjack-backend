const { getDeck, shuffleDeck, cardValue } = require("./cards");
const { redisClient } = require("../server");
const models = require("../models");

const deal = async (game, player) => {
  const cards = await drawCards(game, 2);
  await logMoves("deal", player, game, cards);
  const data = await formatGameData(game, player);
  return data;
};

const setupGame = (gameId) => {
  //create deck and shuffle
  let deck = shuffleDeck(getDeck());
  //push deck to redis
  pushToRedis(gameId, deck);
};

const drawCards = async (gameId, count) => {
  let cards = [];
  for (let i = 0; i < count; i++) {
    const card = await redisClient.lpop([gameId]);
    cards.push(card);
  }
  return cards;
};

const logMoves = async (action, user, game, data) => {
  const promises = data.map(async (card) => {
    const move = await models.Move.create({
      action: action,
      card: card,
      value: cardValue(card),
      userId: user,
      gameId: game,
    });
    return move;
  });
  const moves = await Promise.all(promises);
  return moves;
};

const getMoves = async (game, player) => {
  const moves = await models.Move.findAll({
    where: { gameId: game, userId: player },
    raw: true,
  });
  return moves;
};

const getCards = (moves) => {
  const cards = moves.map(function (move) {
    return move["card"];
  });
  return cards;
};

const calculatePoints = (moves) => {
  //sum all values minus aces
  let result = [];
  let sum = moves.reduce((tot, move) => {
    if (move.value !== -1) {
      return tot + move.value;
    }
    return tot;
  }, 0);

  //get all aces
  const aces = moves.filter((move) => move.value === -1);
  //if no  aces
  if (aces.length === 0) {
    result.push(sum);
  } else {
    //so if there is more than 1 ace, then only 1 of them can be 1 or 11. The rest will have to be 1s.
    //because two aces with higher value will result in 22, leading to a bust
    //first ace, can be 1 or 11
    //all other aces are 1s
    const a = sum + 1 + (aces.length - 1);
    const b = sum + 11 + (aces.length - 1);
    result.push(a);
    result.push(b);
  }
  // result.points = result.filter((value) => value <= 21 && value > 0);
  return result;
};
const formatGameData = async (game, player) => {
  const moves = await getMoves(game, player);
  const cards = getCards(moves);
  const points = calculatePoints(moves);
  return { game, player, cards, points };
};

const pushToRedis = (key, arr) => {
  arr.forEach((a) => {
    redisClient.lpush(key, a);
  });
};

module.exports = { setupGame, logMoves, formatGameData, drawCards, deal };
