const { Sequelize } = require("sequelize");
const { uuid } = require("uuidv4");

const db = require("../db");

const User = db.define("user", {
  id: {
    primaryKey: true,
    type: Sequelize.UUID,
  },
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
  cash: {
    type: Sequelize.DECIMAL(20, 2),
    defaultValue: 0,
  },
  password: {
    type: Sequelize.STRING,
  },
});

User.beforeCreate((user) => (user.id = uuid()));

User.associate = (models) => {
  User.hasMany(models.Game);
  User.hasMany(models.Move);
};

module.exports = User;
