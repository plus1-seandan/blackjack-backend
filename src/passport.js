const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const models = require("./models");

function initializePassport(passport, getUserByEmail, getUserById) {
  const authenticateUser = async (email, password, done) => {
    const user = getUserByEmail(email);
    if (user == null) {
      return done(null, false, { message: "No user with that email" });
    }
    if (await bcrypt.compare(password, user.password)) {
      return done(null, user);
    } else {
      return done(null, false, { message: "Password incorrect" });
    }
  };
  passport.use(new LocalStrategy({ email: "email" }, authenticateUser));
  passport.serializeUser((user, done) => done(null, user.id)); //stores a cookie inside a brower
  //returns a user from that cookie - by id
  passport.deserializeUser((id, done) => {
    return done(null, getUserById(id));
  });
}

module.exports = initializePassport;
