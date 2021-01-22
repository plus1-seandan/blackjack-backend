const express = require("express");

const { settle } = require("../util/settle");
const { setupGame } = require("../util/setup");
const { deal } = require("../util/deal");
const { hit } = require("../util/hit");
const { stand } = require("../util/stand");
const { doubleDown } = require("../util/double");
const { split } = require("../util/split");
const { bet } = require("../util/bet");

const { setPlayerId } = require("../util/misc");
const passport = require("passport");

const router = express.Router();
require("dotenv").config();

router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  async function (req, res) {
    try {
      const playerId = req.user.id;
      const deckId = req.query.deck;

      //create deck and push deck to redis with game id as the key
      const gameId = await setupGame(playerId, deckId);
      //player id will be provided by passport once a user is authenticated
      res.send(gameId);
    } catch (error) {
      res.status(400).send({
        message: error.message,
      });
    }
  }
);

//deal cards
router.patch("/deal", async (req, res) => {
  try {
    const gameId = req.query.game;
    if (gameId == -1) {
      return;
    }
    const playerId = await setPlayerId(req.query.player);
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

//player double down
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

//split hand
router.patch("/split", async (req, res) => {
  try {
    const gameId = req.query.game;
    const playerId = req.query.player;
    const data = await split(gameId, playerId);
    res.send(data);
  } catch (error) {
    res.status(400).send({
      message: error.message,
    });
  }
});

//player bet
router.patch("/bet", async (req, res) => {
  try {
    const gameId = req.query.game;
    const playerId = req.query.player;

    const _bet = parseInt(req.query.bet);
    const data = await bet(gameId, playerId, _bet);
    res.send(data);
  } catch (error) {
    res.status(400).send({
      message: error.message,
    });
  }
});

//player bet
router.patch("/settle", async (req, res) => {
  try {
    const gameId = req.query.game;
    const playerId = req.query.player;
    const data = await settle(gameId, playerId);
    res.send(data);
  } catch (error) {
    res.status(400).send({
      message: error.message,
    });
  }
});

module.exports = router;
