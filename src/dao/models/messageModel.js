const mongoose = require('mongoose')

mongoose.connect('mongodb+srv://miguel:U1v4YDx3uuAua6Zm@cluster1.jqz7ljy.mongodb.net/mensajes', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});


const messagesSchema = new mongoose.Schema({
    user: {type: String, required: true},
    message: {type: String, required: true}
})


const Message = mongoose.model('Message', messagesSchema)


module.exports = {Message}