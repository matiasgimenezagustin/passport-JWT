
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../dao/models/userModel');

passport.use('local', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, (email, password, done) => {
  User.findOne({ email }).exec()
    .then((user) => {
      if (!user) {
        return done(null, false, { message: 'Usuario no encontrado' });
      }
      if (!user.validPassword(password)) {
        return done(null, false, { message: 'Contraseña incorrecta' });
      }
      return done(null, user);
    })
    .catch((err) => {
      return done(err);
    });
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id)
    .then((user) => {
      done(null, user);
    })
    .catch((err) => {
      done(err, null);
    });
});

module.exports = passport;
