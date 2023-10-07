const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    id: Number,
    products: [
        {
            id: Number,
            quantity: Number,
        },
    ],
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = {Cart}