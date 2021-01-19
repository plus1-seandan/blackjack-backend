require("dotenv").config();

const { getMyHands } = require("./game");

const models = require("../models");

const bet = async (gameId, playerId, bet) => {
  const hands = await getMyHands(gameId, playerId);
  const handId = hands[0].id;
  return await setBet(handId, bet);
};

const setBet = async (handId, bet) => {
  const res = await models.Hand.update(
    {
      bet: bet,
    },
    {
      where: { id: handId },
      returning: true, // needed for affectedRows to be populated
      plain: true, // makes sure that the returned instances are just plain objects
    }
  );
  return res;
};

module.exports = { setBet, bet };
