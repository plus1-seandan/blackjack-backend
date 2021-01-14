let suits = ["spades", "diamonds", "clubs", "hearts"];
let values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

//create card
const card = (suit, value) => {
  return { suit, value };
};

//create deck
const getDeck = () => {
  let deck = [];
  suits.forEach((suit) => {
    values.forEach((val) => {
      deck.push(card(suit, val));
    });
  });
  return deck;
};

//perform fisher yates shuffle
const shuffleDeck = (deck) => {
  for (let i = deck.length - 1; i > 0; i--) {
    const swapIndex = Math.floor(Math.random() * (i + 1));
    const currentCard = deck[i];
    const cardToSwap = deck[swapIndex];
    deck[i] = cardToSwap;
    deck[swapIndex] = currentCard;
  }
  console.log(deck);
  return deck;
};

module.exports = { getDeck, shuffleDeck };
