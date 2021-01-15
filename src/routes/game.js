const express = require("express");

const { setupGame } = require("../util/game");
const { redisClient } = require("../server");
const models = require("../models");

const router = express.Router();

//create game
router.post("/", async (req, res) => {
  try {
    const game = await models.Game.create({ userId: req.query.user });
    //create deck and push deck to redis with game id as the key
    setupGame(game.id);

    res.send({ gameId: game.id });
  } catch (error) {
    res.status(400).send({
      message: error.message,
    });
  }
});

//deal cards
router.patch("/deal", async (req, res) => {
  try {
    const gameId = req.query.id;
    //get the first 2 cards from the deck
    const cards = await redisClient.lrange(gameId, 0, 1);

    //pop the first 2 cards from the deck
    for (let i = 0; i < 2; i++) {
      redisClient.lpop([gameId], function (err, reply) {
        if (err) return cb(err);
        console.log("Popped item", reply);
      });
    }
    //updated db with the actions
    cards.map((card) => {
      console.log(card);
      models.Move.create({
        action: "deal",
        details: card,
        userId: 1,
        gameId,
      });
    });

    res.send(cards);
  } catch (error) {
    res.status(400).send({
      message: error.message,
    });
  }
});

module.exports = router;
