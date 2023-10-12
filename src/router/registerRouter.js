const express = require('express');
const User = require('../dao/models/userModel');
const router = express.Router();



// Ruta para el registro de usuario
router.post('/', async (req, res, next) => {
    const { first_name, last_name, email, password, age} = req.body.user;

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
