const cartModel = require('../models/cartModel')
const orderModel = require('../models/orderModel')
const userModel = require('../models/userModel')
const validator = require('../validator/validation')



const createOrder = async function (req, res) {
    try {
      let userId = req.params.userId
      let { productId,  quantity,totalPrice, totalItems,  totalQuantity,cancellable} = req.body
      let body = req.body
      
      if(!validator.isValidBody(body)){
        return res.status(404).send({ status: false, msg: "body should not be empty"})
      }
      const userExist = await userModel.findById({_id:userId})
      if(!userExist){
        return res.status(404).send({ status: false, msg: "user not found"})
      }
    //   if(!validator.isValidStatus(status) ){
    //     return res.status(400).send({ status: false, msg: "please provide valid status"})
    //   }
      
      

      let createOrder = await orderModel.create(body)
      return res.status(200).send({status:true, msg:"order created successfully", data:createOrder})




    } catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}

module.exports.createOrder = createOrder


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const updateOrder = async function (req, res) {
    try {
        let userId = req.params.userId
        let { orderId, status } = req.body
        let body = req.body
      
        if(!validator.isValidBody(body)){
          return res.status(404).send({ status: false, msg: "body should not be empty"})
        }

        if (!validator.isValidobjectId(userId)) {
            return res.status(400).send({ status: false, msg: "invalid userId" })
        }
        const userExist = await userModel.findById({ _id: userId })
        if (!userExist) {
            return res.status(404).send({ status: false, msg: "user not found" })
        }

        if (!validator.isValidobjectId(orderId)) {
            return res.status(400).send({ status: false, msg: "invalid orderId" })
        }

        const orderExist = await orderModel.findOne({ _id: orderId, isDeleted: false })
        if (!orderExist) {
            return res.status(400).send({ status: false, msg: "order does not exist" })
        }
        if (userId != orderExist.userId) {
            return res.status(400).send({ status: false, msg: "credentials are not matching" })
        }
        if (orderExist.cancellable == "false") {
            return res.status(400).send({ status: false, msg: "cancellation is not allowed" })
        }
        if (orderExist.status == "canceled") {
            return res.status(400).send({ status: false, msg: "order is alredy cancelled" })
        }
        if (orderExist.status == "completed") {
            return res.status(400).send({ status: false, msg: "order is alredy completed" })
        }
        if(!validator.isValidStatus(status)){
            return res.status(400).send({ status: false, msg: "status should be from ['pending', 'completed', 'cancelled']" })
        
        }
        const updatedOrder = await orderModel.findOneAndUpdate({ _id: orderId, cancellable: true, isDeleted: false }, { status: status }, { new: true })

        return res.status(200).send({ status: false, msg: "order updated successfully", data: updatedOrder })

    } catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}

module.exports.updateOrder = updateOrder
