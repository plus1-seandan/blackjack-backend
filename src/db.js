const { Sequelize } = require("sequelize");

const db = new Sequelize("poker", "postgres", "postgres", {
  host: process.env.DB_HOST || "localhost",
  dialect: "postgres",
  define: {
    underscored: true,
  },
});

module.exports = db;
