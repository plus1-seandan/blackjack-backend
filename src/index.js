const express = require("express");
const redis = require("redis");
const cors = require("cors");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const { getDeck, shuffleDeck } = require("./util/cards");
const router = require("./routes");
const { redisClient, app } = require("./server");
const db = require("./db");
const models = require("./models");
const initializePassport = require("./passport");

const main = async () => {
  const PORT = 8081;

  //add middleware
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(
    cors({
      origin: "*",
      credentials: true,
    })
  );

  //initialize passport authentication
  initializePassport(
    passport,
    (email) => models.User.findOne({ where: { email: user.email } }),
    (id) => models.User.findOne({ where: { id: user.id } })
  );

  app.use(flash());
  app.use(
    session({
      secret: "somesecretkey",
      resave: false,
      saveUninitialized: false,
    })
  );
  app.use(cookieParser("somesecretkey"));
  app.use(passport.initialize());
  app.use(passport.session());

  //configure routes
  app.use(router);

  //sync database
  await db.sync({
    models,
    // force: true
  }); //force syncs database for development

  //connect to reddis
  redisClient.on("connect", function () {
    console.log("connected to redis");
  });

  //server listening on port 8081
  app.listen(PORT, (err) => {
    if (!err) {
      console.log(`Server is running on ${PORT}`);
    } else {
      console.log(err);
    }
  });
};

try {
  main();
} catch (e) {
  console.log(e);
}
