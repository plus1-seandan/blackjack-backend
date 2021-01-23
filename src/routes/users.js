const express = require("express");
const passport = require("passport");
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

module.exports = router;
