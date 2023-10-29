const mongoose = require('mongoose');


mongoose.connect('mongodb+srv://miguel:U1v4YDx3uuAua6Zm@cluster1.jqz7ljy.mongodb.net/mensajes', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});


const ticketSchema = new mongoose.Schema({
  code: { type: String, unique: true, default: generateUniqueCode },
  purchase_datetime: { type: Date, default: Date.now },
  amount: { type: Number, required: true },
  purchaser: { type: String, required: true },
});

// Genera un código único para el ticket
function generateUniqueCode() {

  const uuid = require('uuid');
  return uuid.v4();
}


const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = { Ticket };
