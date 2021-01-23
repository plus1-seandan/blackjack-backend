const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const bodyParser = require("body-parser");

require("dotenv").config();

const router = require("./routes");

const { redisClient, app } = require("./server");
const db = require("./db");
const models = require("./models");
const setupPassport = require("./config/passport");

const main = async () => {
  const PORT = 8081;

  //sync database
  await db.sync({
    models,
    alter: true,
    // force: true,
  }); //force syncs database for development

  //connect to reddis
  redisClient.on("connect", function () {
    console.log("connected to redis");
  });

  //Add middleware
  app.use(cors());
  app.use(passport.initialize());
  setupPassport(passport);
  // app.use(express.json());
  // app.use(express.urlencoded({ extended: false }));
  // app.use(bodyParser.urlencoded({ extended: true }));
  // app.use(cookieParser());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  app.use(router);

  app.listen(PORT, console.log(`Server running on  ${PORT}`));
};

try {
  main();
} catch (e) {
  console.log(e);
}
