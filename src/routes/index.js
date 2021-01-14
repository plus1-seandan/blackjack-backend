const express = require("express");
const gameRouter = require("./game");

const router = express.Router();

//test api
router.get("/", (req, res) => {
  console.log("server is up and running");
});

router.use("/game", gameRouter);

module.exports = router;
