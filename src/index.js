const express = require("express");
const redis = require("redis");

const { getDeck, shuffleDeck } = require("./util/cards");
const router = require("./routes");
const { redisClient, app } = require("./server");
const db = require("./db");
const models = require("./models");

const main = async () => {
  const PORT = 8081;

  //add middleware
  app.use(router);

  //sync database
  await db.sync({
    models,
    // force: true
  }); //force syncs database for development

  //connect to reddis
  redisClient.on("connect", function () {
    console.log("connected to redis");
  });

  //server listening on port 8081
  app.listen(PORT, (err) => {
    if (!err) {
      console.log(`Server is running on ${PORT}`);
    } else {
      console.log(err);
    }
  });

  //testing
  // let deck = getDeck();
  // deck = shuffleDeck(deck);
  // console.log(deck);
};

try {
  main();
} catch (e) {
  console.log(e);
}
