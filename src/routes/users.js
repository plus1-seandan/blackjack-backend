const express = require("express");
const passport = require("passport");
const db = require("../db");
const router = express.Router();

router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  async function (req, res) {
    try {
      res.send(req.user);
    } catch (error) {
      res.status(400).send({
        message: error.message,
      });
    }
  }
);

router.get(
  "/infos",
  passport.authenticate("jwt", { session: false }),
  async function (req, res) {
    try {
      const playerId = req.user.id;
      const data = await db.query(
        `SELECT * FROM player_infos where player_id = '${playerId}'`
      );
      res.send(data[0]);
    } catch (error) {
      res.status(400).send({
        message: error.message,
      });
    }
  }
);

router.get(
  "/leaderboard",
  passport.authenticate("jwt", { session: false }),
  async function (req, res) {
    try {
      const data = await db.query(
        `select distinct player_id, total_payout, b.username from player_infos a 
        join users b on a.player_id = b.id
        order by total_payout desc `
      );
      res.send(data[0]);
    } catch (error) {
      res.status(400).send({
        message: error.message,
      });
    }
  }
);

module.exports = router;
