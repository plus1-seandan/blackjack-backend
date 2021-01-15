const { Sequelize } = require("sequelize");

const db = new Sequelize("poker", "postgres", "postgres", {
  host: "localhost",
  dialect: "postgres",
  define: {
    underscored: true,
  },
});

module.exports = db;
