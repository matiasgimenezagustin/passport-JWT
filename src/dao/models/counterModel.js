const mongoose = require('mongoose')

mongoose.connect('mongodb+srv://miguel:U1v4YDx3uuAua6Zm@cluster1.jqz7ljy.mongodb.net/mensajes', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});


const counterSchema = new mongoose.Schema({
    _id: String,
    seq: Number,
});

const Counter = mongoose.model('Counter', counterSchema);

module.exports = {Counter}