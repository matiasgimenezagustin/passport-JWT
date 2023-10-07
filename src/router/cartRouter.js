const express = require('express')
const {cartsManager} = require('../dao/cartsMangerMongo')

/* const cartsManager = require('../cartManager.js') Codigo viejo del FileStystem */
const router = express.Router()

router.post('/', async (req, res) =>{
    res.send(await cartsManager.createCartInMongo())
})

router.get('/:cid', async (req, res) =>{
    const { cid } = req.params

    const response = await cartsManager.getProductsByIdFromMongo(Number(cid))
    if(response.ok){
        res.status(200).send(response)
    }
    else{
        res.status(400).send(response)
    }

})

router.post('/:cid/products/:pid', async (req, res) =>{
    const { cid, pid } = req.params
    const { quantity } = req.query
    const response = await cartsManager.addProductToCartInMongo(Number(cid), pid, Number(quantity))
    if(response.ok){
        res.status(200).send(response)
    }
    else{
        res.status(400).send(response)
    }

})

router.put('/:cid/products/:pid/:units', async (req, res) =>{
    const {cid, pid, units} = req.params
    const response = await cartsManager.updateCartFromMongo(Number(cid), Number(pid), Number(units))
    if(result.ok){
        res.status(200).send(response)
    }else{
        res.status(400).send(response)
    }
})

router.delete('/:cid/products/:pid/:unit', async (req, res)=>{
    const {cid, pid, unit} = req.params
    const response = await cartsManager.deleteProductsFromCartInMongo(Number(cid), Number(pid), Number(unit))
    if(response?.ok){
        res.status(200).send(response)
    }
    else{
        res.status(400).send(response)
    }
})

router.delete('/:cid', async (req, res) =>{
    const {cid} = req.params
    const response = await cartsManager.deleteAllProductsFromCartInMongo(Number(cid))
    if(response.ok){
        res.status(200).send(response)
    }
    else{
        res.status(400).send(response)
    }
})

module.exports = router