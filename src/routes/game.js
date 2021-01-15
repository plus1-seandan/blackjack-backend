const express = require("express");
const { startGame } = require("../util/game");
const { redisClient } = require("../server");

const router = express.Router();

// route /game
router.post("/", async (req, res) => {
  const deck = startGame();
});

module.exports = router;
