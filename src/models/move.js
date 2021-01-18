// const { Sequelize } = require("sequelize");
// const { uuid } = require("uuidv4");

// const db = require("../db");

// const Move = db.define("move", {
//   id: {
//     primaryKey: true,
//     type: Sequelize.UUID,
//   },
//   action: {
//     type: Sequelize.STRING,
//   },
//   card: {
//     type: Sequelize.STRING,
//   },
//   value: {
//     type: Sequelize.INTEGER,
//   },
// });

// Move.beforeCreate((move) => (move.id = uuid()));

// Move.associate = (models) => {
//   Move.belongsTo(models.User);
//   Move.belongsTo(models.Game);
// };

// module.exports = Move;
