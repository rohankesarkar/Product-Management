const cartModel = require('../models/cartModel')
const productModel = require('../models/productModel')
const validator = require('../validator/validation')
const userModel = require('../models/userModel')


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const makeCart = async function (req, res) {
    try {

        let userId = req.params.userId

        let { productId, quantity } = req.body
        let body = req.body

        if (!validator.isValidBody(body)) {
            return res.status(400).send({ status: false, msg: "body should not be empty" })
        }

        if (!validator.isValidobjectId(userId)) {
            return res.status(400).send({ status: false, msg: "invalid userId" })
        }
        if (!validator.isValidobjectId(productId)) {
            return res.status(400).send({ status: false, msg: "invalid productId" })
        }
        

        let cartExists = await cartModel.findOne({ userId: userId })

        let productExist = await productModel.findById({ _id: productId })
        if (!productId) {
            return res.status(400).send({ status: false, msg: `product with id ${productId} does not exist` })
        }

        if (cartExists) {
            let itemIndex = cartExists.items.findIndex(p => p.productId == productId)

            if (itemIndex != -1) {

                cartExists.items[itemIndex].quantity = Number(cartExists.items[itemIndex].quantity) + Number(quantity || 1)
                if (Number(productExist.installments) < Number(cartExists.items[itemIndex].quantity)) {
                    return res.status(400).send({ status: false, msg: "You exeeded stock limit" })
                }
                let totalPriceForProduct = Number(productExist.price) * Number(quantity || 1)
                cartExists.totalPrice = Number(cartExists.totalPrice) + Number(totalPriceForProduct)


                let updatedCart = await cartModel.findOneAndUpdate({ userId: userId }, cartExists, { new: true })
                return res.status(200).send({ status: true, msg: "cart updated successfully", data: updatedCart })
            } else {
                cartExists.items.push({
                    productId: productId,
                    quantity: quantity
                })
                if (Number(productExist.installments) < Number(quantity)) {
                    return res.status(400).send({ status: false, msg: "You exeeded stock limit" })
                }
                cartExists.items.quantity = Number(cartExists.items.quantity) + Number(quantity || 1)

                let totalPriceForProduct = Number(productExist.price) * Number(quantity || 1)
                cartExists.totalPrice = Number(cartExists.totalPrice) + Number(totalPriceForProduct)
                cartExists.totalItems = Number(cartExists.totalItems) + 1

                let updatedCart = await cartModel.findOneAndUpdate({ userId: userId }, cartExists, { new: true })
                return res.status(200).send({ status: true, msg: "cart updated successfully", data: updatedCart })


            }

        } else {
            const data = {
                userId: userId,
                items: [{
                    productId: productId,
                    quantity: quantity
                }],
                totalItems: 1,
                totalPrice: productExist.price * quantity
            }
            let createCart = await cartModel.create(data)
            return res.status(201).send({ status: true, msg: "cart created successfully", data: createCart })
        }
    } catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}

module.exports.makeCart = makeCart

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const updateCart = async function (req, res) {
    try {

        let userId = req.params.userId

        let { productId, cartId } = req.body
        let body = req.body

        if (!validator.isValidBody(body)) {
            return res.status(400).send({ status: false, msg: "body should not be empty" })
        }
        if (!validator.isValidobjectId(userId)) {
            return res.status(400).send({ status: false, msg: "userId is not valid" })
        }
        if (!validator.isValidobjectId(productId)) {
            return res.status(400).send({ status: false, msg: "productId is not valid" })
        }
        if (!validator.isValid(productId)) {
            return res.status(400).send({ status: false, msg: "productId should not be empty" })
        }
        if (!validator.isValidobjectId(cartId)) {
            return res.status(400).send({ status: false, msg: "cartId is not valid" })
        }
        if (!validator.isValid(cartId)) {
            return res.status(400).send({ status: false, msg: "cartId should not be empty" })
        }

        const userExist = await userModel.findById({ _id: userId })
        if (!userExist) {
            return res.status(400).send({ status: false, msg: "user does not exist" })
        }

        const cartExists = await cartModel.findById({ _id: cartId })
        if (!cartExists) {
            return res.status(400).send({ status: false, msg: "cart does not exist" })
        }

        const productExist = await productModel.findById({ _id: productId, isDeleted: false })
        if (!productExist) {
            return res.status(400).send({ status: false, msg: "product does not exist" })
        }

        if (userExist && cartExists && productExist) {
            let itemIndex = cartExists.items.findIndex(p => p.productId == productId)
            if (cartExists.items[itemIndex].productId != req.body.productId) {
                return res.status(400).send({ status: false, msg: "product is not present in your cart" })
            }

            if (itemIndex != -1) {
                cartExists.items[itemIndex].quantity = Number(cartExists.items[itemIndex].quantity) - 1
                if (Number(cartExists.items[itemIndex].quantity) == 0) {
                    cartExists.totalItems = Number(cartExists.totalItems) - 1
                    cartExists.items.splice(itemIndex,1)
                    cartExists.totalPrice = Number(cartExists.totalPrice) - Number(productExist.price)
                    if(cartExists.items.length == 0){
                        return res.status(400).send({ status: false, msg: "your cart is empty" })
                    }

                    let removeProduct = await cartModel.findOneAndUpdate({ userId: userId }, cartExists, { new: true })
                    return res.status(200).send({ status: false, msg: "product removed successfully", data: removeProduct })
                }

                cartExists.totalPrice = Number(cartExists.totalPrice) - Number(productExist.price)

                let updatedCart = await cartModel.findOneAndUpdate({userId: userId }, cartExists, { new: true })

                return res.status(200).send({ status: true, msg: "quantity of product updated successfully", data: updatedCart })
            }
        }
    } catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}
module.exports.updateCart = updateCart
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const getCart = async function (req, res) {
    try {
        let userId = req.params.userId
        if (!validator.isValidobjectId(userId)) {
            return res.status(400).send({ status: false, msg: "userId is not valid" })
        }
        const searchedCart = await cartModel.findOne({ userId: userId })
        if (searchedCart) {
            return res.status(200).send({ status: true, msg: "success", data: searchedCart })
        } else {
            return res.status(404).send({ status: false, msg: "cart not found" })
        }

    } catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}

module.exports.getCart = getCart

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const deleteCart = async function (req, res) {
    try {

        let userId = req.params.userId

        if (!validator.isValidobjectId(userId)) {
            return res.status(400).send({ status: false, msg: "userId is not valid" })
        }

        let deletedCart = await cartModel.findOneAndUpdate({ userId: userId }, { totalItems: 0, totalPrice: 0, items: [] }, { new: true })
        if (deletedCart) {
            return res.status(200).send({ status: true, msg: "your cart is empty", data: deletedCart })
        } else {
            return res.status(404).send({ status: false, msg: "cart not found" })
        }
    } catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}

module.exports.deleteCart = deleteCart


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


