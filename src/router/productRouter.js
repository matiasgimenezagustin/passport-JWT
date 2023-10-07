const express = require('express')

const router = express.Router()



const {manager} = require('../dao/productsManagerMongo')

router.get('/', async (req, res) => {

    const { limit, page, sort } = req.query;
    console.log(page)

    try {
        const response = await manager.getProductsFromMongo(Number(limit), page ? page : 1);
        
        if (response.ok) {
            const { content, totalProducts } = response;
            
            const totalPages = Math.ceil(totalProducts / 10);
            
            const currentPage = page ? Number(page) : 1;

            const result = {
                payload: sort == 'desc' ? content.sort( (a, b) => a.price - b.price ) : (sort == 'asc' ? content.sort((a, b) => b.price - b.price) : content),
                totalPages: totalPages,
                prevPage: currentPage - 1,
                nextPage: currentPage + 1,
                page: currentPage,
                hasPrevPage: currentPage !== 1,
                hasNextPage: currentPage < totalPages,
                prevLink: currentPage !== 1 ? `?page=${currentPage - 1}` : null,
                nextLink: currentPage < totalPages ? `?page=${currentPage + 1}` : null,
            };
           
            res.status(200).json(result);
        } else {
            res.status(400).json('Cannot get Products');
        }
    } catch (error) {
        res.status(500).json('Internal Server Error');
    }
});


router.get('/:pid', async (req, res) => {
    const pid = req.params.pid;
    const product = await manager.getProductByIdFromMongo(pid);
    if (product) {
        res.json(product);
    } else {
        res.status(404).json({ error: 'Product not found' });
    }
});

router.post('/', async (req, res) =>{
    /* const {title, description, code, price, status, stock, category} = req.body */
    const newProduct = req.body
    const response = await manager.addProductToMongo(newProduct)
    if(response.ok){
        res.status(200).send(response)
    }
    else{
        res.status(400).send('Error, can not post the product')
    }
})

router.put('/:pid', async (req, res)=>{
    const updatedProduct = req.body
    const {pid} = req.params
    const response = await manager.updateProductByIdInMongo(pid, updatedProduct)
    if(response.ok){
        res.status(200).send(response)
    }
    else{
        res.status(400).send('Error, can not update the product')
    }
    
})

router.delete('/:pid', async (req, res) =>{
    const {pid} = req.params
    const response = await manager.deleteProductByIdFromMongo(pid)
    if(response.ok){
        res.send(response)
    }
    else{
        res.status(400).send(response.error)
    }
})


module.exports = router;