///////////////////////////////////
// IMPORT
///////////////////////////////////
const express = require("express") 
const User = require('../models/user')
const Product = require('../models/product')

///////////////////////////////////
// INITIALIZE ROUTER
///////////////////////////////////
const router = express.Router()

///////////////////////////////////
// CART ROUTES
///////////////////////////////////

/// getCart
router.get('/cart', async (req, res) => {
    await User.findById(req.headers.id)
        .then((user) => {
            console.log(user.cart)
            res.json(user.cart)
        })
})

/// updateCart functions
router.put('/cart', async (req, res) => {
    await User.findById(req.headers.id)
        .then((user) => {
            const update = []
            req.body.cart.map((item) => {update.push(item)})
            user.cart = update
            return user
        })
        .then((user) => {
            User.findByIdAndUpdate(
                req.headers.id, 
                user, 
                {returnDocument: 'after'}
            ).then((user) => {
                console.log(user.cart)
                res.json(user.cart)
            })
        })
})

/// deeleteCart functions
router.delete('/cart', async (req, res) => {
    await User.findById(req.headers.id)
        .then((user) => {
            const update = []
            if (req.body.p_id !== "all") {
                user.cart.map((item) => {
                    if (item.productId !== req.body.p_id) {
                        update.push(item)
                    }
                })
            }
            user.cart = update
            return user
        })
        .then((user) => {
            User.findByIdAndUpdate(
                req.headers.id, 
                user, 
                {returnDocument: 'after'}
            ).then((user) => {
                console.log(user.cart)
                res.json(user.cart)
            })
        })
})

///////////////////////////////////
// PRODUCT ROUTES
///////////////////////////////////

/// getProduct
router.get('/products', async (req, res) => {
    res.json(await Product.find({}))
})

/// searchProduct
router.post('/products', async (req, res) => {
    res.json(await Product.find(req.body))
})

////////////////////////////////
// export the router
/////////////////////////////////
module.exports = router