const express = require("express");

const { setupGame, deal, hit, stand } = require("../util/game");
const { redisClient } = require("../server");
const models = require("../models");

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

//player hits
router.patch("/hit", async (req, res) => {
  try {
    const gameId = req.query.game;
    const playerId = req.query.player;
    const data = await hit(gameId, playerId);
    res.send(data);
  } catch (error) {
    res.status(400).send({
      message: error.message,
    });
  }
});

//player stands, run dealer logic
router.patch("/stand", async (req, res) => {
  try {
    const gameId = req.query.game;
    const playerId = req.query.player;
    const data = await stand(gameId, playerId);
    // res.send(data);
  } catch (error) {
    res.status(400).send({
      message: error.message,
    });
  }
});

module.exports = router;
