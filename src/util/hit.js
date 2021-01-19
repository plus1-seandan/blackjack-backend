require("dotenv").config();

const {
  getPlayerGameData,
  getMyHands,
  getDeckId,
  drawCards,
  addCardsToHand,
} = require("./game");

const hit = async (gameId, playerId) => {
  const hands = await getMyHands(gameId, playerId);
  const handId = hands[0].id;
  const cards = await drawCards(await getDeckId(gameId), 1);
  await addCardsToHand("hit", handId, gameId, cards);
  return await getPlayerGameData(gameId, playerId);
};

module.exports = { hit };
