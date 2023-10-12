const express = require('express');
const User = require('../dao/models/userModel');
const router = express.Router();
const passport = require('../config/passport.config');

// Ruta para el inicio de sesión
router.post('/', (req, res, next) => {
    const { email, password } = req.body;
    console.log(email, password)
  
    passport.authenticate('local', (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: info.message });
      }
      req.login(user, (err) => {
        if (err) {
          return next(err);
        }
        return res.status(200).json({ message: 'Inicio de sesión exitoso' });
      });
    })(req, res, next);
  });

module.exports = router;
