const models = require("../models");
const { redisClient } = require("../server");

const suits = ["S", "D", "C", "H"];
const values = [
  "A",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
];

const setupDeck = async () => {
  //grab deck and shuffle
  const _deck = shuffleDeck(createDeck());
  //create deck record in db
  const deck = await models.Deck.create({});
  //pushes deck to redis
  pushToRedis(deck.id, _deck);

  //return deckId
  return deck.id;
};

//create deck
const createDeck = () => {
  let deck = [];
  suits.forEach((suit) => {
    values.forEach((val) => {
      deck.push(`${val} ${suit}`);
    });
  });

  return deck;
};
const cardValue = (card) => {
  const value = card.split(" ")[0];
  if (value === "A") {
    return -1;
  }
  if (value === "K" || value === "Q" || value === "J") {
    return 10;
  }
  return parseInt(value);
};

//perform fisher yates shuffle
const shuffleDeck = (deck) => {
  for (let i = deck.length - 1; i > 0; i--) {
    const swapIndex = Math.floor(Math.random() * (i + 1));
    const currentCard = deck[i];
    const cardToSwap = deck[swapIndex];
    deck[i] = cardToSwap;
    deck[swapIndex] = currentCard;
  }
  return deck;
};

const pushToRedis = (key, arr) => {
  arr.forEach((a) => {
    redisClient.lpush(key, a);
  });
};

module.exports = { createDeck, shuffleDeck, cardValue, setupDeck, pushToRedis };
