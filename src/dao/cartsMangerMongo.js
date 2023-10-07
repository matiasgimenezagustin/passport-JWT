const {Cart} = require('./models/cartsModel')
const {Product} = require('./models/productModel')
const {Counter} = require('./models/counterModel')
class CartManager {

    async createCartInMongo() {
        const counterDoc = await Counter.findOneAndUpdate(
            { _id: 'cart_counter' },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );
        const newCart = new Cart({ id: counterDoc.seq, products: [] });
        await newCart.save();
        return {ok: true, content: 'The cart was created successfully'}
    }

    async getProductsByIdFromMongo(cid) {
        try {
            const cart = await Cart.findOne({ id: cid });
            console.log(cart)
            if (!cart) {
                return { ok: false, error: 'Cart not found' };
            }
            if (cart.products.length === 0) {
                return 'The cart selected is empty';
            } else {
                return { ok: true, content: cart };
            }
        } catch (error) {
            console.error('Error getting products by ID:', error);
            return { ok: false, error: 'Error getting products by ID' };
        }
    }

    async addProductToCartInMongo(cid, pid, quantity) {
        try {
            const cart = await Cart.findOne({ id: cid }).populate('products');
           
            if (!cart) {
                return { ok: false, error: 'Cart not found' };
            }
    
            // Verificar si el producto ya está en el carrito
            const productInCart = cart.products.find(product => product.id === pid);
    
            if (productInCart) {
                productInCart.quantity += quantity;
            } else {
                // Utiliza Product.findById para obtener el documento completo del producto
                const product = await Product.findById(pid);
                if (!product) {
                    return { ok: false, error: 'Product not found' };
                }
                cart.products.push(product); // Agregar la referencia completa al producto
            }
    
            await cart.save();
            return { ok: true, content: cart };
        } catch (error) {
            console.error('Error adding product to cart:', error);
            return { ok: false, error: 'Error adding product to cart' };
        }
    }
    

    async deleteProductsFromCartInMongo(cid, pid, unit) {
        try {
            const cart = await Cart.findOne({ id: cid });
            if (!cart) {
                return { ok: false, error: "The cart doesn't exist" };
            }

            const productIndex = cart.products.findIndex(product => product.id === pid);
            if (productIndex !== -1) {
                if (cart.products[productIndex].quantity >= unit) {
                    cart.products[productIndex].quantity -= unit;
                    await cart.save();
                    
                    return { ok: true, content: 'The product cart was deleted successfully' };
                } else {
                    return { ok: false, error: "Insufficient quantity in cart" };
                }
            } else {
                return { ok: false, error: "Product not found in cart" };
            }
        } catch (error) {
            console.error('Error deleting product from cart:', error);
            return { ok: false, error: 'Error deleting product from cart' };
        }
    }

    async updateCartFromMongo(cid, pid, newQuantity) {
        try {
            const cart = await Cart.findOne({ id: cid });
            if (!cart) {
                return { ok: false, error: 'Cart not found' };
            }
    
            const productIndex = cart.products.findIndex(product => product.id === pid);
            if (productIndex !== -1) {
                if (newQuantity >= 0) {
                    cart.products[productIndex].quantity = newQuantity;
                    await cart.save();
    
                    return { ok: true, content: 'Cart updated successfully' };
                } else {
                    return { ok: false, error: 'New quantity must be non-negative' };
                }
            } else {
                return { ok: false, error: 'Product not found in cart' };
            }
        } catch (error) {
            console.error('Error updating cart:', error);
            return { ok: false, error: 'Error updating cart' };
        }
    }
    
    async deleteAllProductsFromCartInMongo(cid) {
        try {
            const cart = await Cart.findOne({ id: cid });
            if (!cart) {
                return { ok: false, error: "The cart doesn't exist" };
            }
    
            cart.products = []; // Eliminar todos los productos del carrito
            await cart.save();
    
            return { ok: true, content: 'All products in the cart were deleted successfully' };
        } catch (error) {
            console.error('Error deleting all products from cart:', error);
            return { ok: false, error: 'Error deleting all products from cart' };2
        }
    }

}

const cartsManager = new CartManager()


module.exports = {cartsManager}