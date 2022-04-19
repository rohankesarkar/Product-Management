const express = require('express')
const router = express.Router()
const userController = require("../controller/userController")
const productController = require("../controller/productController")
const cartController = require('../controller/cartController')
const orderController = require("../controller/orderController")
const auth = require("../middleware/middleware")



router.get('test-me', function(req,res){
    res.send("hello from get api")
})



//user
router.post('/register', userController.registerUser)
router.post('/login', userController.loginUser)
router.get('/user/:userId/profile',auth.authentication, userController.getUser)
router.put('/user/:userId/profile', auth.authorization, userController.updateUser)


//product
router.post('/products', productController.createProduct)
router.get('/products', productController.getProduct)
router.get('/products/:productId', productController.getProductById)
router.put('/products/:productId', productController.updateProduct)
router.delete('/products/:productId', productController.deleteProduct)

//cart
router.post('/users/:userId/cart',auth.authentication, cartController.createCart)
router.put('/users/:userId/cart',auth.authentication, cartController.updateCart)
router.get('/users/:userId/cart',auth.authentication, cartController.getCartById)
router.delete('/users/:userId/cart', auth.authentication,cartController.deleteCart)


//order
router.post('/users/:userId/orders',auth.authorization, orderController.createOrder)
router.put('/users/:userId/orders',auth.authorization, orderController.updateOrder)


router.get("*", async function(req,res){
    return res.status(404).send({status:false, message:"page not found"})
})








module.exports = router