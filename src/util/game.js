require("dotenv").config();

const { createDeck, shuffleDeck, cardValue, pushToRedis } = require("./cards");
const { redisClient } = require("../server");
const models = require("../models");

const getMyHands = async (gameId, playerId) => {
  try {
    const hands = await models.Hand.findAll({
      where: { gameId: gameId, playerId: playerId },
      raw: true,
    });
    return hands;
  } catch (e) {
    console.log(e);
  }
};

const isBlackjack = (hand) => {
  //if first 2 hands equal 2 hands, it's a blackjack
  if (hand.cards.length === 2 && hand.points === 21) {
    return true;
  }
  return false;
};

const getDeckId = async (gameId) => {
  const game = await models.Game.findOne({ where: { id: gameId } });
  return game.deckId;
};

const addPlayers = async (gameId, players) => {
  try {
    const promises = players.map(async (playerId) => {
      return await addPlayer(gameId, playerId);
    });
    const hands = await Promise.all(promises);
    return hands;
  } catch (e) {
    console.log(e);
  }
};

const addPlayer = async (gameId, playerId) => {
  try {
    const hand = await models.Hand.create({
      playerId: playerId,
      gameId: gameId,
    });
    return hand;
  } catch (e) {
    console.log(e);
  }
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

const addCardsToHand = async (action, handId, gameId, data) => {
  const promises = data.map(async (card) => {
    const handCard = await models.HandCard.create({
      action: action,
      card: card,
      value: cardValue(card),
      handId: handId,
      gameId: gameId,
    });
    return handCard;
  });
  const handCards = await Promise.all(promises);

  return handCards;
};

const getHandCards = async (handId) => {
  const handCards = await models.HandCard.findAll({
    where: { handId: handId },
    raw: true,
  });
  return handCards;
};
const getHandInfo = async (handId) => {
  return await models.Hand.findOne({
    where: { id: handId },
    raw: true,
  });
};

const calculatePoints = (cards) => {
  //sum all values minus aces
  let result = [];
  let sum = cards.reduce((tot, card) => {
    if (card.value !== -1) {
      return tot + card.value;
    }
    return tot;
  }, 0);
  //get all aces
  const aces = cards.filter((card) => card.value === -1);
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
  const filteredRes = result.filter((val) => val <= 21);
  if (filteredRes.length > 0) {
    result = filteredRes;
  }
  return Math.max(...result);
};

const getPlayerHandData = async (handId, playerId) => {
  const cards = await getHandCards(handId);
  const points = calculatePoints(cards);
  return { cards, points };
};

const getPlayerGameData = async (gameId, playerId) => {
  const hands = await getMyHands(gameId, playerId);
  const handId = hands[0].id;
  const cards = await getHandCards(handId);
  // const cards = getCards(moves);
  const points = calculatePoints(cards);
  // const game = await getGame(gameId);
  return { cards, points };
};

module.exports = {
  getPlayerHandData,
  getPlayerGameData,
  getMyHands,
  getHandInfo,
  getDeckId,
  addPlayers,
  drawCards,
  addCardsToHand,
  isBlackjack,
  getHandCards,
  addPlayer,
};
