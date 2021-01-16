const express = require("express");
const passport = require("passport");
const router = express.Router();

const models = require("../models");

//login user
router.post("/", async (req, res) => {
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
  });
  res.send("success");
});

module.exports = router;
