const { getDeck, shuffleDeck } = require("./cards");
const { redisClient } = require("../server");


const startGame = () => {
  //get deck and shuffle
  let deck = shuffleDeck(getDeck());
  //push deck to redis
  pushToRedis("DECK", deck);
};

const pushToRedis = (key, arr) => {
  arr.forEach((a) => {
    redisClient.lpush(key, a);
  });
};

module.exports = { startGame };
