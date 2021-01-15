const express = require("express");

const router = express.Router();

const models = require("../models");

//register new user
router.post("/", async (req, res) => {
  try {
    const user = await models.User.create(req.query);
    res.send("success");
  } catch (error) {
    res.status(400).send({
      message: error.message,
    });
  }
});

module.exports = router;
