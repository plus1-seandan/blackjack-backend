const express = require("express");
const router = express.Router();

const models = require("../models");

//login user
router.post("/", async (req, res) => {
  try {
    //get user by email
    const user = await models.User.findOne({
      where: { email: req.query.email },
    });
    //if username not found or password does not match
    if (!user || req.query.password != user.password) {
      res.send(false);
    }
    res.send(true);
  } catch (error) {
    res.status(400).send({
      message: error.message,
    });
  }
});

module.exports = router;
