const express = require("express");
const gameRouter = require("./game");
const registerRouter = require("./register");
const loginRouter = require("./login");
const userRouter = require("./users");

const router = express.Router();

//test api
router.get("/", (req, res) => {
  console.log("server is up and running");
});

router.use("/games", gameRouter);
router.use("/register", registerRouter);
router.use("/login", loginRouter);
router.use("/users", userRouter);

module.exports = router;
