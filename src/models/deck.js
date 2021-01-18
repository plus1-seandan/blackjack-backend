const { Sequelize } = require("sequelize");
const { uuid } = require("uuidv4");

const db = require("../db");

const Deck = db.define("deck", {
  id: {
    primaryKey: true,
    type: Sequelize.UUID,
  },
  size: {
    type: Sequelize.INTEGER,
    defaultValue: 1,
  },
});

Deck.beforeCreate((deck) => (deck.id = uuid()));

Deck.associate = (models) => {
  Deck.hasMany(models.Game);
};

module.exports = Deck;
