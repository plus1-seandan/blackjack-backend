const express = require("express");

const router = express.Router();

router.get("/", async (req, res) => {
  console.log("/game api is working");
});

module.exports = router;
