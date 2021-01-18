require("dotenv").config();

const setPlayerId = (id) => {
  if (parseInt(id) == -1) {
    return process.env.DEALER;
  }
  return id;
};

module.exports = { setPlayerId };
