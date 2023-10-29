
const { saveArchive, readArchive } = require("../fileSystemController.js");



class CartManager{
    static counterIdPath = "./src/db/cartCounter.json"
    constructor(path){
        this.counter = 0
        this.carts = []
        this.path = path
    }
    async createCart () {
        this.carts.push({products: [], id:this.counter++})
        await saveArchive(this.path, this.carts)
        await saveArchive(CartManager.counterIdPath, {"cartCounter": this.counter})
        return {ok: true, content:this.carts}
    }

    async purchaseCartInMongo(cartId) {
        // Obtener el carrito
        const cart = await getCartFromMongo(cartId);

        if (!cart) {
            return { ok: false, message: 'El carrito no existe' };
        }

        // Recorrer los productos en el carrito
        for (const product of cart.products) {
          // Verificar si el producto tiene suficiente stock
            const productInStock = await getProductFromMongo(product.productId);

            if (!productInStock) {
                return { ok: false, message: 'Producto no encontrado en el stock' };
            }
            if (productInStock.stock >= product.quantity) {
                // Restar la cantidad comprada del stock del producto
                await updateProductStockInMongo(product.productId, productInStock.stock - product.quantity);
            } else {
                // Si no hay suficiente stock, no agregar el producto al proceso de compra
                return { ok: false, message: 'Stock insuficiente para un producto' };
            }
        }
     
        await deleteCartFromMongo(cartId);
      
        return { ok: true, message: 'Compra exitosa' };
      }
      
    
    async getProductsById (cid){

        const productsFound = this.carts.find(cart => cart.id === cid)

        if(productsFound.products.length === 0){
            return "The cart selected is empty"
        }else if( productsFound.products.length > 0){
            return {ok: true, content:productsFound}
        }else{
            return {ok: false, error: 'Cart not found'}
        }
    }
    async addProductCart (cid, pid, quantity) {
        const cartSelectedIndex = this.carts.findIndex(cart => cart.id === cid)
        if(cartSelectedIndex != -1 ){
            let productIndex = this.carts[cartSelectedIndex].products.findIndex(product => product.id === pid)
            console.log(productIndex)
            if(productIndex != -1){
                this.carts[cartSelectedIndex].products[productIndex].quantity += quantity 
            }else{
                this.carts[cartSelectedIndex].products.push({id: pid, quantity: quantity})
            }
            await saveArchive(this.path, this.carts)
            return {ok: true, content:this.carts}
        }else{
            return {ok: false, error: 'Cart not found'}
        }
    }
    init = async () =>{
        const currentCarts = await readArchive(this.path)

        const counterCartsId = await readArchive(CartManager.counterIdPath)
        this.counter = counterCartsId.cartCounter
        if(currentCarts && currentCarts.length > 0){
            currentCarts.forEach(cart => this.carts.push(cart))
        }
    }
    async deleteProducts(cid, pid, unit){
        const cartFound =  await this.getProductsById(cid)
        if(cartFound.ok){
            this.carts = this.carts.map(cart=> {
                if(cart.id === cid){
                    if(cart.cart.some(product => product.id === pid)){
                        const productToUpdate = cart.cart.find(product => product.id == pid)
                        if(productToUpdate.quantity >= unit){
                            cart = cart.map(product =>{
                                if(product.id === pid){
                                    product.quantity += unit
                                }
                                return product
                            })
                        }
                    }
                }
                return cart
            })
            await saveArchive(this.path, this.carts)
            return {ok: true, content :this.carts}
        }
        else{
            return {ok: false, error: "the cart dosn't exist"}
        }
    }
    
}

const cartManager = new CartManager("./src/db/carts.json")
cartManager.init()

module.exports = cartManager