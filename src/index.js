const express = require("express");
const { getDeck, shuffleDeck } = require("./util/cards");
const router = require("./routes");

const main = async () => {
  const PORT = 8081;
  const app = express();

  //add middleware
  app.use(router);

  //server listening on port 8081
  app.listen(PORT, (err) => {
    if (!err) {
      console.log(`Server is running on ${PORT}`);
    } else {
      console.log(err);
    }
  });

  //testing
  let deck = getDeck();
  deck = shuffleDeck(deck);
  console.log(deck);
};

try {
  main();
} catch (e) {
  console.log(e);
}
