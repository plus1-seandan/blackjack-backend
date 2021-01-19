require("dotenv").config();

const { bet } = require("./bet");
const { getPlayerGameData } = require("./game");
const { hit } = require("./hit");

const doubleDown = async (gameId, playerId, _bet) => {
  await bet(gameId, playerId, _bet);

  await hit(gameId, playerId);
  return await getPlayerGameData(gameId, playerId);
};

module.exports = { doubleDown };
