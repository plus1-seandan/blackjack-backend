require("dotenv").config();

const {
  getPlayerGameData,
  getMyHands,
  addPlayers,
  getHandCards,
} = require("./game");

const models = require("../models");
const { setBet } = require("./bet");

const split = async (gameId, playerId) => {
  //get original hand id
  let hands = await getMyHands(gameId, playerId);
  const oldHandId = hands[0].id;
  const bet = hands[0].bet;
  //add a new hand record with the same player id
  const newHand = await addPlayers(gameId, playerId);
  //copy the old bet to the new split hand
  await setBet(newHand.id, bet);
  //split the hand
  await splitMoves(oldHandId, newHand.id);
  //return data
  return await getPlayerGameData(gameId, playerId);
};
const splitMoves = async (oldHandId, newHandId) => {
  const cards = await getHandCards(oldHandId);
  //get one of the two cards that are dealt.
  const cardOneId = cards[0].id;
  await models.HandCard.update(
    {
      handId: newHandId,
    },
    {
      where: { id: cardOneId },
      returning: true, // needed for affectedRows to be populated
      plain: true, // makes sure that the returned instances are just plain objects
    }
  );
};

module.exports = { split };
