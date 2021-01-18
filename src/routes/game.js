const express = require("express");

const {
  setupGame,
  deal,
  hit,
  stand,
  bet,
  doubleDown,
} = require("../util/game");
const { redisClient } = require("../server");
const models = require("../models");
const { setPlayerId } = require("../util/misc");

const router = express.Router();
require("dotenv").config();

//create game /games
router.post("/", async (req, res) => {
  try {
    const userId = req.query.user;
    const deckId = req.query.deck;
    // const game = await models.Game.create({
    //   userId: req.query.user || "8472f167-b80e-43ff-baf1-4d891b74d38a",
    // });
    //create deck and push deck to redis with game id as the key
    const game = await setupGame(userId, deckId);
    // formatGameData(game.id, 1);
    //player id will be provided by passport once a user is authenticated
    res.send(game);
  } catch (error) {
    res.status(400).send({
      message: error.message,
    });
  }
});

//deal cards
router.patch("/deal", async (req, res) => {
  try {
    const gameId = req.query.game;
    const playerId = setPlayerId(req.query.player);
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
    res.send(data);
  } catch (error) {
    res.status(400).send({
      message: error.message,
    });
  }
});

//player stands, run dealer logic
router.patch("/double", async (req, res) => {
  try {
    const gameId = req.query.game;
    const playerId = req.query.player;
    const bet = req.query.bet;
    const data = await doubleDown(gameId, playerId, bet);
    res.send(data);
  } catch (error) {
    res.status(400).send({
      message: error.message,
    });
  }
});

//player stands, run dealer logic
// router.patch("/split", async (req, res) => {
//   try {
//     const gameId = req.query.game;
//     const playerId = req.query.player;
//     const data = await split(gameId, playerId);
//     res.send(data);
//   } catch (error) {
//     res.status(400).send({
//       message: error.message,
//     });
//   }
// });

//player bet
router.patch("/bet", async (req, res) => {
  try {
    const gameId = req.query.game;
    const _bet = parseInt(req.query.bet);
    const data = await bet(gameId, _bet);
    res.send(data);
  } catch (error) {
    res.status(400).send({
      message: error.message,
    });
  }
});

module.exports = router;
