require("dotenv").config();

const {
  createDeck,
  shuffleDeck,
  cardValue,
  setupDeck,
  pushToRedis,
} = require("./cards");
const { redisClient } = require("../server");
const models = require("../models");

const deal = async (gameId, playerId) => {
  console.log("start deal");
  const cards = await drawCards(await getDeckId(gameId), 2);
  console.log(cards);

  await logMoves("deal", playerId, gameId, cards);
  return await getPlayerMoves(gameId, playerId);
};

const hit = async (gameId, playerId) => {
  const cards = await drawCards(await getDeckId(gameId), 1);
  await logMoves("hit", playerId, gameId, cards);
  return await getPlayerMoves(gameId, playerId);
};

const doubleDown = async (gameId, playerId, _bet) => {
  console.log({ gameId, playerId, _bet });
  const _hit = await hit(gameId, playerId);
  const data = await bet(gameId, _bet);
  const playerGame = await getPlayerMoves(gameId, playerId);
  return playerGame;
  // const data2 = await stand(gameId, playerId);
  // console.log({ data2 });
};

const stand = async (gameId, playerId) => {
  //get player points
  const playerGame = await getPlayerMoves(gameId, playerId);
  let dealerGame = await getPlayerMoves(gameId, process.env.DEALER);

  await dealerPlay(gameId, playerId);

  dealerGame = await getPlayerMoves(gameId, process.env.DEALER);
  await setGameStatus(gameId, dealerGame.points, playerGame.points);
  await setPayout(gameId, playerId);
  const data = await getPlayerMoves(gameId, process.env.DEALER);
  const game = await getGame(gameId);

  return { ...data, game };
};

const setPayout = async (gameId, playerId) => {
  //later gotta handle payout for blackjack
  let payout;
  let { bet, status } = await getGame(gameId);
  const playerGame = await getPlayerMoves(gameId, playerId);
  const blackjack = isBlackjack(playerGame);
  if (blackjack) {
    //3:2 payout
    payout = 1.5 * bet;
  } else if (status === "win") {
    payout = bet;
  } else if (status === "draw") {
    payout = 0;
  } else {
    payout = -1 * bet;
  }
  const res = await models.Game.update(
    {
      payout: payout,
    },
    {
      where: { id: gameId },
      returning: true, // needed for affectedRows to be populated
      plain: true, // makes sure that the returned instances are just plain objects
    }
  );
  return res;
};

const isBlackjack = (playerGame) => {
  //if first 2 hands equal 2 hands, it's a blackjack
  if (playerGame.cards.length === 2 && playerGame.points === 21) {
    return true;
  }
  return false;
};

const bet = async (gameId, bet) => {
  const res = await models.Game.update(
    {
      bet: bet,
    },
    {
      where: { id: gameId },
      returning: true, // needed for affectedRows to be populated
      plain: true, // makes sure that the returned instances are just plain objects
    }
  );
  return res;
};

const getDeckId = async (gameId) => {
  const game = await models.Game.findOne({ where: { id: gameId } });
  return game.deckId;
};

const dealerPlay = async (game, player) => {
  console.log(
    "*******************************Run DEALER PLAY LOGIC***************************"
  );
  //recursive method to hit until dealer wins or busts
  const playerGame = await getPlayerMoves(game, player);
  const dealerGame = await getPlayerMoves(game, process.env.DEALER);
  if (dealerGame.points >= playerGame.points) {
    console.log(
      "*******************************END DEALER PLAY LOGIC***************************"
    );
    return;
  }
  await hit(game, process.env.DEALER);
  await dealerPlay(game, player);
};

const getGame = async (gameId) => {
  const game = await models.Game.findOne({
    where: { id: gameId },
    raw: true,
  });
  return game;
};

const setGameStatus = async (game, dealerPoints, playerPoints) => {
  let status;
  if (playerPoints > 21) {
    status = "lose";
  } else if (dealerPoints > 21) {
    status = "win";
  } else if (dealerPoints === playerPoints) {
    status = "draw";
  } else if (dealerPoints > playerPoints) {
    status = "lose";
  } else {
    status = "win";
  }

  const res = await models.Game.update(
    {
      status: status,
    },
    {
      where: { id: game },
      returning: true, // needed for affectedRows to be populated
      plain: true, // makes sure that the returned instances are just plain objects
    }
  );
  return res;
};

const setupGame = async (userId, deckId) => {
  if (!deckId) {
    //if no deck specified, create a new deck, return deckId which is the redis key
    deckId = await setupDeck();
  }
  //create game
  const game = await models.Game.create({
    userId: userId || "8472f167-b80e-43ff-baf1-4d891b74d38a",
    deckId: deckId,
  });
  return game;
};

const drawCards = async (deckId, count) => {
  // async function asyncRedisLPop(gameId) {
  //   return new Promise((resolve, reject) => {
  //     redisClient.lpop([gameId], (err, value) => {
  //       cards.push(value);
  //       console.log({ value, cards });
  //       resolve();
  //     });
  //   });
  // }

  //reshuffle cards everytime for now
  const _deck = shuffleDeck(createDeck());
  //pushes deck to redis
  pushToRedis(deckId, _deck);

  let cards = [];
  for (let i = 0; i < count; i++) {
    const card = await redisClient.lpop([deckId]);
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

  return Math.max(...result);
};

const getPlayerMoves = async (gameId, playerId) => {
  const moves = await getMoves(gameId, playerId);
  const cards = getCards(moves);
  const points = calculatePoints(moves);
  const game = await getGame(gameId);
  return { gameId, playerId, cards, points, game };
};

const getGameStatus = async (gameId) => {
  const game = await models.Game.findOne({
    where: { id: gameId },
    raw: true,
  });
  return game.status;
};

module.exports = { setupGame, deal, hit, stand, bet, doubleDown };
