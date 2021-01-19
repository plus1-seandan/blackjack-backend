require("dotenv").config();

const { setupDeck } = require("./cards");
const { addPlayers } = require("./game");
const models = require("../models");

const setupGame = async (playerId, deckId) => {
  if (!deckId) {
    //if no deck specified, create a new deck, return deckId which is the redis key
    deckId = await setupDeck();
  }
  //create game
  const game = await creategame(deckId, playerId);
  //add dealer and the player to the game
  await addPlayers(game.id, [process.env.DEALER, playerId]);
  return game.id;
};

const creategame = async (deckId, userId) => {
  return await models.Game.create({
    userId: userId || "6b0e7926-de71-4f26-81bd-23af2431194f",
    deckId: deckId,
  });
};

module.exports = { setupGame };
