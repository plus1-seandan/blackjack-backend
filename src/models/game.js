const { Sequelize } = require("sequelize");
const { uuid } = require("uuidv4");

const db = require("../db");

const Game = db.define("game", {
  id: {
    primaryKey: true,
    type: Sequelize.UUID,
  },
});

Game.beforeCreate((game) => (game.id = uuid()));

Game.associate = (models) => {
  Game.belongsTo(models.User);
  Game.belongsTo(models.Deck);

  Game.belongsToMany(models.User, {
    through: {
      model: models.Hand,
      unique: false,
    },
    foreignKey: "gameId",
    // foreignKeyConstraint: false,
  });
};

module.exports = Game;
