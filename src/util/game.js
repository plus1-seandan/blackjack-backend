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

const settle = async (gameId, playerId) => {
  const dealerGame = await getPlayerGameData(gameId, process.env.DEALER);

  const _hands = await getMyHands(gameId, playerId);

  const promises = _hands.map(async (hand) => {
    //calculate win/lose status, and payout
    return await settleHand(hand.id, dealerGame.points);
  });
  const hands = await Promise.all(promises);
  return hands;
};

const settleHand = async (handId, dealerPoints) => {
  let hand = await getHandInfo(handId);
  const handCardsInfo = await getPlayerHandData(handId);
  await setGameStatus(hand, handCardsInfo, dealerPoints);
  hand = await getHandInfo(handId);
  return hand;
};

const deal = async (gameId, playerId) => {
  //get the handId
  const hands = await getMyHands(gameId, playerId);
  const handId = hands[0].id;
  const cards = await drawCards(await getDeckId(gameId), 2);
  await addCardsToHand("deal", handId, gameId, cards);
  const result = await getPlayerGameData(gameId, playerId);
  return result;
};

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

const hit = async (gameId, playerId) => {
  const hands = await getMyHands(gameId, playerId);
  const handId = hands[0].id;
  const cards = await drawCards(await getDeckId(gameId), 1);
  await addCardsToHand("hit", handId, gameId, cards);
  return await getPlayerGameData(gameId, playerId);
};

const doubleDown = async (gameId, playerId, _bet) => {
  const data = await bet(gameId, playerId, _bet);

  const _hit = await hit(gameId, playerId);
  return await getPlayerGameData(gameId, playerId);
};

const split = async (gameId, playerId) => {
  //get original hand id
  let hands = await getMyHands(gameId, playerId);
  const oldHandId = hands[0].id;
  const bet = hands[0].bet;
  //add a new hand record with the same player id
  const newHand = await addPlayer(gameId, playerId);
  //copy the old bet to the new split hand
  await setBet(newHand.id, bet);
  //split the hand
  await splitMoves(oldHandId, newHand.id);
  //return data
  return await getPlayerGameData(gameId, playerId);
};
const splitMoves = async (oldHandId, newHandId) => {
  const cards = await getHandCards(oldHandId);
  //get one of the two cards that are dealt.
  const cardOneId = cards[0].id;
  const res = await models.HandCard.update(
    {
      handId: newHandId,
    },
    {
      where: { id: cardOneId },
      returning: true, // needed for affectedRows to be populated
      plain: true, // makes sure that the returned instances are just plain objects
    }
  );
};

const createGameCopy = async (gameId) => {
  //findOne Game where gameId
  const _game = await getGame(gameId);
  delete _game.id;
  return await models.Game.create(_game);
};

const stand = async (gameId, playerId) => {
  //get player points
  const playerGame = await getPlayerGameData(gameId, playerId);
  let dealerGame = await getPlayerGameData(gameId, process.env.DEALER);

  await dealerPlay(gameId, playerId);

  dealerGame = await getPlayerGameData(gameId, process.env.DEALER);
  return dealerGame;
  // await setGameStatus(gameId, dealerGame.points, playerGame.points);
  // await setPayout(gameId, playerId);
  // const data = await getPlayerGameData(gameId, process.env.DEALER);
  // const game = await getGame(gameId);

  // return { ...data, game };
};

const setPayout = async (gameId, playerId) => {
  //later gotta handle payout for blackjack
  let payout;
  let { bet, status } = await getGame(gameId);
  const playerGame = await getPlayerGameData(gameId, playerId);
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

const isBlackjack = (hand) => {
  //if first 2 hands equal 2 hands, it's a blackjack
  if (hand.cards.length === 2 && hand.points === 21) {
    return true;
  }
  return false;
};

const bet = async (gameId, playerId, bet) => {
  const hands = await getMyHands(gameId, playerId);
  const handId = hands[0].id;
  return await setBet(handId, bet);
};

const setBet = async (handId, bet) => {
  const res = await models.Hand.update(
    {
      bet: bet,
    },
    {
      where: { id: handId },
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
  const playerGame = await getPlayerGameData(game, player);
  const dealerGame = await getPlayerGameData(game, process.env.DEALER);
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

const setGameStatus = async (hand, handCardsInfo, dealerPoints) => {
  let status;
  let payout;
  if (handCardsInfo.points > 21) {
    status = "lose";
  } else if (dealerPoints > 21) {
    status = "win";
  } else if (dealerPoints === handCardsInfo.points) {
    status = "draw";
  } else if (dealerPoints > handCardsInfo.points) {
    status = "lose";
  } else {
    status = "win";
  }

  const blackjack = isBlackjack(handCardsInfo);

  if (status === "lose") {
    payout = -1 * hand.bet;
  } else if (status === "draw") {
    payout = 0;
  } else {
    if (blackjack) {
      payout = 1.5 * hand.bet;
    } else {
      payout = hand.bet;
    }
  }
  await models.Hand.update(
    {
      payout: payout,
      status: status,
    },
    {
      where: { id: hand.id },
      returning: true, // needed for affectedRows to be populated
      plain: true, // makes sure that the returned instances are just plain objects
    }
  );
};

const setupGame = async (playerId, deckId) => {
  if (!deckId) {
    //if no deck specified, create a new deck, return deckId which is the redis key
    deckId = await setupDeck();
  }
  //create game
  const game = await creategame(deckId, playerId);
  //add dealer and the player to the game
  await addPlayers(game.id, [process.env.DEALER, playerId]);
  return game.id;
};

const creategame = async (deckId, userId) => {
  return await models.Game.create({
    userId: userId || "6b0e7926-de71-4f26-81bd-23af2431194f",
    deckId: deckId,
  });
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
const getCards = (moves) => {
  const cards = moves.map(function (move) {
    return move["card"];
  });
  return cards;
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

const getGameStatus = async (gameId) => {
  const game = await models.Game.findOne({
    where: { id: gameId },
    raw: true,
  });
  return game.status;
};

module.exports = {
  setupGame,
  deal,
  hit,
  stand,
  bet,
  doubleDown,
  split,
  settle,
};
