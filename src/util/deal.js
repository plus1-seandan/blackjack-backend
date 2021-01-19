require("dotenv").config();

const {
  getPlayerGameData,
  getMyHands,
  getDeckId,
  drawCards,
  addCardsToHand,
} = require("./game");

const deal = async (gameId, playerId) => {
  //get the handId
  const hands = await getMyHands(gameId, playerId);
  const handId = hands[0].id;
  const cards = await drawCards(await getDeckId(gameId), 2);
  await addCardsToHand("deal", handId, gameId, cards);
  const result = await getPlayerGameData(gameId, playerId);
  return result;
};

module.exports = { deal };
