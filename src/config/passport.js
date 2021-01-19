const LocalStrategy = require("passport-local");
const passportJWT = require("passport-jwt");
const bcrypt = require("bcryptjs");
const models = require("../models");
const JWTStrategy = passportJWT.Strategy;
require("dotenv").config();

function setupPassport(passport) {
  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
      },
      async (email, password, done) => {
        const user = await models.User.findOne({ where: { email: email } });
        if (user && (await bcrypt.compare(password, user.password))) {
          return done(null, user);
        } else {
          return done(null, false);
        }
      }
    )
  );
  passport.use(
    new JWTStrategy(
      {
        jwtFromRequest: passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.SESSION_SECRET,
      },
      async (jwt_payload, done) => {
        const user = await models.User.findOne({
          where: { id: jwt_payload.user._id },
        });
        if (user.id === jwt_payload.user._id) {
          return done(null, user);
        } else {
          return done(null, false, {
            message: "Token not matched",
          });
        }
      }
    )
  );
}

module.exports = setupPassport;
