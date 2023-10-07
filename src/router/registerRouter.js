const express = require('express');
const User = require('../dao/models/userModel');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const LocalStrategy = require('passport-local').Strategy;

// Estrategia de Passport para el registro
passport.use('local-register', new LocalStrategy(
    {
        usernameField: 'user[username]',
        passwordField: 'user[password]',
        passReqToCallback: true
    },
    async (req, username, password, done) => {
        try {
            const { email, first_name, last_name, age } = req.body.user;

            // Verificar si el correo electrónico ya está registrado
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return done(null, false, { message: 'El correo electrónico ya está registrado.' });
            }

            const hashedPassword = await bcrypt.hash(password, saltRounds);

            const newUser = new User({
                username,
                email,
                password: hashedPassword,
                first_name,
                last_name,
                age,
            });

            await newUser.save();

            return done(null, newUser);
        } catch (error) {
            return done(error);
        }
    }
));

// Ruta para el registro de usuario
router.post('/', (req, res, next) => {
    passport.authenticate('local-register', (err, user, info) => {
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
            return res.status(200).json({ message: 'Usuario registrado con éxito' });
        });
    })(req, res, next);
});

// Resto del código...

module.exports = router;
