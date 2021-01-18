require("dotenv").config();

const setPlayerId = (id) => {
  //if id === -1 - it indicates a dealer
  if (parseInt(id) == -1) {
    return process.env.DEALER;
  }
  return id;
};

module.exports = { setPlayerId };
