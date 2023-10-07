/* const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  email: String,
});

const User = mongoose.model('User', userSchema);

module.exports = User;
 */

/* const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
  first_name: String,
  last_name: String,
  email: { type: String, unique: true },
  age: Number,
  password: String, // Debe ser almacenado como un hash, puedes usar passport-local-mongoose para esto
  cart: { type: mongoose.Schema.Types.ObjectId, ref: 'Cart' },
  role: { type: String, default: 'user' },
});

// Usa passport-local-mongoose para agregar autenticación local al modelo de usuario
userSchema.plugin(passportLocalMongoose, {
  usernameField: 'email', // Utiliza el campo 'email' como nombre de usuario
});

const User = mongoose.model('User', userSchema);

module.exports = User;
 */

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  first_name: String,
  last_name: String,
  email: {
    type: String,
    unique: false, 
  },
  age: Number,
  password: String,
  cart: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cart', // Asumiendo que tienes un modelo Cart
  },
  role: {
    type: String,
    default: 'user',
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
