const { Sequelize } = require("sequelize");
const { uuid } = require("uuidv4");

const db = require("../db");

const Hand = db.define("hand", {
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

Hand.beforeCreate((hand) => (hand.id = uuid()));

// Hand.associate = (models) => {
//   Channel.belongsToMany(models.User, {
//     through: "channelMember",
//     foreignKey: "channelId",
//   });
//   Hand.belongsTo(models.User);
//   Hand.belongsTo(models.Game);
// };

module.exports = Hand;
