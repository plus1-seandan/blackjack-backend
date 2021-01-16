const express = require("express");

const { setupGame, deal } = require("../util/game");
const { redisClient } = require("../server");
const models = require("../models");
const { cardValue } = require("../util/cards");

const router = express.Router();

//create game /games/
router.post("/", async (req, res) => {
  try {
    const game = await models.Game.create({ userId: req.query.user || 1 });
    //create deck and push deck to redis with game id as the key
    setupGame(game.id);
    // formatGameData(game.id, 1);
    //player id will be provided by passport once a user is authenticated
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
    const gameId = parseInt(req.query.game);
    const playerId = parseInt(req.query.player);

    const data = await deal(gameId, playerId);

    res.send(data);
  } catch (error) {
    res.status(400).send({
      message: error.message,
    });
  }
});

//deal cards
router.patch("/hit", async (req, res) => {
  try {
    const gameId = req.query.id;

    //pop the first  card from the deck
    const card = await redisClient.lpop([gameId]);
    console.log(card);
    //updated db with the actions
    await models.Move.create({
      action: "hit",
      card: card,
      userId: 1,
      gameId,
    });
    // calculatePoints(gameId, playerId);
    res.send(card);
  } catch (error) {
    res.status(400).send({
      message: error.message,
    });
  }
});

module.exports = router;
