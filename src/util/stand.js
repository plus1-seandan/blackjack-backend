const { getPlayerGameData } = require("./game");
const { hit } = require("./hit");

const stand = async (gameId, playerId) => {
  //get player points

  await dealerPlay(gameId, playerId);

  const dealerGame = await getPlayerGameData(gameId, process.env.DEALER);
  return dealerGame;
  // await setGameStatus(gameId, dealerGame.points, playerGame.points);
  // await setPayout(gameId, playerId);
  // const data = await getPlayerGameData(gameId, process.env.DEALER);
  // const game = await getGame(gameId);

  // return { ...data, game };
};

const dealerPlay = async (game, player) => {
  console.log(
    "*******************************Run DEALER PLAY LOGIC***************************"
  );
  //recursive method to hit until dealer wins or busts
  const playerGame = await getPlayerGameData(game, player);
  const dealerGame = await getPlayerGameData(game, process.env.DEALER);
  if (dealerGame.points >= playerGame.points) {
    console.log(
      "*******************************END DEALER PLAY LOGIC***************************"
    );
    return;
  }
  await hit(game, process.env.DEALER);
  await dealerPlay(game, player);
};

module.exports = { stand };
