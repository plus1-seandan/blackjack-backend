const { Sequelize } = require("sequelize");
const { uuid } = require("uuidv4");

const db = require("../db");

const HandCard = db.define("handCard", {
  id: {
    primaryKey: true,
    type: Sequelize.UUID,
  },
  action: {
    type: Sequelize.STRING,
  },
  card: {
    type: Sequelize.STRING,
  },
  value: {
    type: Sequelize.INTEGER,
  },
});

HandCard.beforeCreate((handCard) => (handCard.id = uuid()));

HandCard.associate = (models) => {
  HandCard.belongsTo(models.Hand);
};

module.exports = HandCard;
