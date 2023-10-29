const express = require('express');
const router = express.Router();
const passport = require('../config/passport.config');
const User = require('../dao/models/userModel');



// Ruta para el inicio de sesión (login)
router.post('/login', (req, res, next) => {

    passport.authenticate('local', (err, user, info) => {
        console.log(user)
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

// Ruta para el registro de usuario (register)
router.post('/register', async (req, res, next) => {
    const { first_name, last_name, email, password, age } = req.body.user;

    try {
        // Verifica que los campos obligatorios estén presentes
        if (!email || !password) {
            return res.status(400).json({ message: 'Email y contraseña son obligatorios' });
        }

        // Crea un nuevo usuario con los datos proporcionados
        const newUser = new User({ first_name, last_name, email, password, age });

        await newUser.save();

        // Inicia sesión para el usuario registrado
        req.login(newUser, (err) => {
            if (err) {
                return next(err);
            }
            return res.status(200).json({ message: 'Usuario registrado con éxito' });
        });
    } catch (err) {
        return next(err);
    }
});

module.exports = router;
