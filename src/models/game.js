const { Sequelize } = require("sequelize");
const db = require("../db");

const Game = db.define("game", {
  status: {
    type: Sequelize.STRING,
    defaultValue: "playing",
  },
  points: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
  },
});

Game.associate = (models) => {
  Game.belongsTo(models.User);
  Game.hasMany(models.Move);
};

module.exports = Game;
