require("dotenv").config();

const setPlayerId = (id) => {
  console.log({ testingId: id });
  if (parseInt(id) == -1) {
    return process.env.DEALER;
  }
  return id;
};

module.exports = { setPlayerId };
