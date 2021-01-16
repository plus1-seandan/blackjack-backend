const express = require("express");
const bcrypt = require("bcrypt");

const router = express.Router();

const models = require("../models");

//register new user
router.post("/", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.query.password, 10);
    const user = await models.User.create({
      ...req.query,
      password: hashedPassword,
    });
    res.send("success");
  } catch (error) {
    res.status(400).send({
      message: error.message,
    });
  }
});

module.exports = router;
