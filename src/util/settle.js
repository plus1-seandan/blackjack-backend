require("dotenv").config();

const {
  getPlayerGameData,
  getMyHands,
  getHandInfo,
  getPlayerHandData,
  isBlackjack,
} = require("./game");
const models = require("../models");

const settle = async (gameId, playerId) => {
  const dealerGame = await getPlayerGameData(gameId, process.env.DEALER);

  const _hands = await getMyHands(gameId, playerId);

  const promises = _hands.map(async (hand) => {
    //calculate win/lose status, and payout
    return await settleHand(hand.id, dealerGame.points);
  });
  const hands = await Promise.all(promises);
  //only return the first and for now because we are not handling multiple players or splits
  return hands[0];
};

const settleHand = async (handId, dealerPoints) => {
  let hand = await getHandInfo(handId);
  const handCardsInfo = await getPlayerHandData(handId);
  await setGameStatus(hand, handCardsInfo, dealerPoints);
  hand = await getHandInfo(handId);
  return hand;
};
const setGameStatus = async (hand, handCardsInfo, dealerPoints) => {
  let status;
  let payout;
  if (handCardsInfo.points > 21) {
    status = "lose";
  } else if (dealerPoints > 21) {
    status = "win";
  } else if (dealerPoints === handCardsInfo.points) {
    status = "draw";
  } else if (dealerPoints > handCardsInfo.points) {
    status = "lose";
  } else {
    status = "win";
  }

  const blackjack = isBlackjack(handCardsInfo);

  if (status === "lose") {
    payout = -1 * hand.bet;
  } else if (status === "draw") {
    payout = 0;
  } else {
    if (blackjack) {
      payout = 1.5 * hand.bet;
    } else {
      payout = hand.bet;
    }
  }
  await models.Hand.update(
    {
      payout: payout,
      status: status,
    },
    {
      where: { id: hand.id },
      returning: true, // needed for affectedRows to be populated
      plain: true, // makes sure that the returned instances are just plain objects
    }
  );
};

module.exports = { settle };
