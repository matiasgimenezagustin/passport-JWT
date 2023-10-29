const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GitHubStrategy = require('passport-github').Strategy;
const User = require('../dao/models/userModel');

const dotenv = require('dotenv')
dotenv.config({ path: './src/.env' })

// Inicialización de Passport y configuración de las estrategias
 function  initializePassport () {
  // Estrategia local para inicio de sesión
  passport.use('local', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',

  },  (email, password, done) => {

    User.findOne({ email })
      .exec()
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

  // Estrategia de GitHub
  passport.use(new GitHubStrategy({
    clientID: 'd622b73918b3bcb79ebf',
    clientSecret: 'd59813fa3f960a9f0f5486d1979aecdeb69203a4',
    callbackURL: 'http://localhost:8080/auth/github/callback'
  },
  (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
  }))

  // Serialización y deserialización de usuarios
  passport.serializeUser((user, done) => {

    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {

    if (admin.id == id) {

      done(null, admin);
    } else {
      User.findById(id)
        .then((user) => {
          done(null, user);
        })
        .catch((err) => {
          done(err, null);
        });
    }
  });
}

initializePassport(); 

module.exports = passport;
