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
  bet: {
    type: Sequelize.DECIMAL(10, 2),
    defaultValue: 0,
  },
  payout: {
    type: Sequelize.DECIMAL(10, 2),
    defaultValue: 0,
  },
});

Game.beforeCreate((game) => (game.id = uuid()));

Game.associate = (models) => {
  Game.belongsTo(models.User);
  Game.hasMany(models.Move);
  Game.belongsTo(models.Deck);
};

module.exports = Game;
