const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController')
const productController = require('../controllers/productController')
const cartController = require('../controllers/cartController')
const auth = require('../middleware/middleware')


//user
router.post('/register', userController.createUser)
router.get('/login', userController.loginUser)
router.get('/user/:userId/profile',auth.authentication, userController.getUser)
router.put('/user/:userId/profile',auth.authorization, userController.updateUser)

//product
router.post('/products', productController.createProduct)
router.get('/products', productController.getProduct)
router.get('/products/:productId', productController.getProductById)
router.put('/products/:productId', productController.updateProduct)
router.delete('/products/:productId', productController.deleteProduct)

//cart
//router.post('/users/:userId/cart', cartController.createCart)
router.post('/users/:userId/cart', cartController.makeCart)
router.put('/users/:userId/cart', cartController.updateCart)
router.get('/users/:userId/cart', cartController.getCart)
router.delete('/users/:userId/cart', cartController.deleteCart)




module.exports = router;