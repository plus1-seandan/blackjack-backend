const { Sequelize } = require("sequelize");
const db = require("../db");

const Game = db.define("game", {});

Game.associate = (models) => {
  Game.belongsTo(models.User);
  Game.hasMany(models.Move);
};

module.exports = Game;
