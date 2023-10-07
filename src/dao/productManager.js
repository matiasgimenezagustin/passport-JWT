
const { saveArchive, readArchive } = require("../fileSystemController.js");



class ProductManager {
    static counterIdPath = "./src/db/counters.json"
    static productProperties = ["title", "description", "price", "code", "stock"]
    static errors = {
        incompleteProduct: `The product must have ${ProductManager.productProperties.join(", ")}` ,
        repeatCodeField: "You cannot repeat the code field",
        invalidId: "The product´s id provided incorrect",
        notFound: "Product not found"
    }

    constructor(path){
        this.path = path
        this.products = []
        this.counter = 0
    }

    updateProduct = async (id, productToUpdate) =>{
        const indice = this.products.findIndex(product => Number(product.id) === Number(id))
        if(indice === -1){
            return ProductManager.errors.invalidId
        }else if(this.hasAllProperties(productToUpdate)){
            if(!(this.products.some(product => product.code === productToUpdate.code))){
                this.products[indice] =  {...productToUpdate, id: Number(id)}
                await saveArchive(this.path, this.products)
                return {ok: true, content:this.products}
            }else{
                return {ok: false, error: ProductManager.errors.repeatCodeField}
            }
        }else{
            return {ok: false, error: ProductManager.errors.incompleteProduct}
        }
        
    }
    hasAllProperties = (productToCheck) =>{
        const results = []
        for(const property of ProductManager.productProperties){
            results.push(Object.keys(productToCheck).includes(property))
        }
        return results.every(result => result)
    }
    addProduct = async (productToAdd) => {
        if(this.hasAllProperties(productToAdd)){
            if(!(this.products.some(product => product.code === productToAdd.code))){
                this.products = [...this.products, {...productToAdd, id: this.counter++}]
                await saveArchive(this.path, this.products)
                await saveArchive(ProductManager.counterIdPath, {"productsCounter": this.counter})
                const response = await readArchive(this.path)
                return {...response, ok:true}
            }else{
                return {ok: false, error: ProductManager.errors.repeatCodeField}
            }
        }else{
            return {ok: false, error: ProductManager.errors.incompleteProduct}
        }
        
    }
    
    getProducts = async (limit) =>{
        return await readArchive(this.path)
        .then(res => {
            if(limit){
                return {ok: true, content:res.slice(0, limit)}
            }else{
                return {ok: true, content:res}
            }
        })
    } 

    getProductById = async (id) => {
        return await this.getProducts()
        .then(products => products.find(product => Number(product.id) === Number(id)))
        .then(product => {
            if(product){
                return {ok: true, content: product}
            }else{
                return {ok: false, error: ProductManager.errors.notFound}
            }
        } )
    }
    deleteById = async (id) =>{
        let productsQuantity = this.products.length
        this.products = this.products.filter(product => Number(product.id) !== Number(id))
        if(this.products.length === productsQuantity){
            return {ok: false, error: ProductManager.errors.notFound}
        }
        await saveArchive(this.path,this.products)
        return {ok: true, content: this.products}
    }
    init = async () =>{
        const currentProducts = await readArchive(this.path)
        const counterId = await readArchive(ProductManager.counterIdPath)
        this.counter = counterId.productsCounter
        if(currentProducts.length > 0){
            currentProducts.forEach(product => this.products.push(product))
        }
    }
}
const manager = new ProductManager("./src/db/products.json")
manager.init()


module.exports = {manager}