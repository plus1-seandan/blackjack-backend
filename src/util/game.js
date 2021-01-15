const { getDeck, shuffleDeck } = require("./cards");
const { redisClient } = require("../server");

const setupGame = (gameId) => {
  //create deck and shuffle
  let deck = shuffleDeck(getDeck());
  //push deck to redis
  pushToRedis(gameId, deck);
};

const pushToRedis = (key, arr) => {
  arr.forEach((a) => {
    redisClient.lpush(key, a);
  });
};

module.exports = { setupGame };
