const { Sequelize } = require("sequelize");
const { uuid } = require("uuidv4");

const db = require("../db");

const Game = db.define("game", {
  id: {
    primaryKey: true,
    type: Sequelize.UUID,
  },
  status: {
    type: Sequelize.STRING,
    defaultValue: "playing",
  },
  points: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
  },
});

Game.beforeCreate((game) => (game.id = uuid()));

Game.associate = (models) => {
  Game.belongsTo(models.User);
  Game.hasMany(models.Move);
};

module.exports = Game;
