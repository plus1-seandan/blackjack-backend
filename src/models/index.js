const { Sequelize } = require("sequelize");
const User = require("./user");
const Game = require("./game");
const Move = require("./moves");
const db = require("../db");

const models = {
  User,
  Game,
  Move,
};

//if a model has associate attribute, create the associations
Object.keys(models).forEach((modelName) => {
  if ("associate" in models[modelName]) {
    models[modelName].associate(models);
  }
});

models.sequelize = db;
models.Sequelize = Sequelize;

module.exports = models;
