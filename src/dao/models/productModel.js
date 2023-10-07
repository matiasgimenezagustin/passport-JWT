const mongoose = require('mongoose')

mongoose.connect('mongodb+srv://miguel:U1v4YDx3uuAua6Zm@cluster1.jqz7ljy.mongodb.net/mensajes', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});


const productSchema = new mongoose.Schema({
    title: {type: String, required: true},
    description: {type: String, required: true}, 
    price: {type: Number, required: true},
    code: {type: String, required: true},
    stock: {type: Number, required: true},
    thumbnail: {type: String, required: false},
    id: {type: Number, required: false}
})




const Product = mongoose.model('Product', productSchema)

module.exports = {Product}