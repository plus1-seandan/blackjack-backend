const { Sequelize } = require("sequelize");
const db = require("../db");

const User = db.define("user", {
  username: {
    type: Sequelize.STRING,
    unique: true,
    validate: {
      isAlphanumeric: {
        args: true,
        msg: "The username can only contain letters and numbers",
      },
      len: {
        args: [3, 25],
        msg: "The username needs to be betwee 3 to 25 characters",
      },
    },
  },
  email: {
    type: Sequelize.STRING,
    unique: true,
    validate: {
      isEmail: {
        args: true,
        msg: "invalid email",
      },
    },
  },
  password: {
    type: Sequelize.STRING,
  },
});

User.associate = (models) => {
  User.hasMany(models.Game);
  User.hasMany(models.Move);
};

module.exports = User;
