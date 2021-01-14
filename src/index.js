const express = require("express");

const main = async () => {
  const PORT = 8081;
  const app = express();

  //server listening on port 8081
  app.listen(PORT, (err) => {
    if (!err) {
      console.log(`Server is running on ${PORT}`);
    } else {
      console.log(err);
    }
  });
};

try {
  main();
} catch (e) {
  console.log(e);
}
