const orderModel = require("../models/orderModel")
const validator  = require("../validator/validator")




const createOrder = async function (req, res) {
    try {
        
        req.body.userId = req.params.userId
        
        const {items, totalPrice,  totalItems, cancellable, totalQuantity} = req.body
        if(!validator.isValidBody(req.body)){
            return res.status(400).send({status:false, message:"Bad Request request body is empty"})
        }
        const validItems =  items.filter((obj) => {
            return obj != null && Object.keys(obj).length
        })   
        if(!(items.length && validItems.length)){
            return res.status(400).send({staus:false, message:"please select the product to place order"})
        }       
        if(!(validator.isValidPrice(totalPrice) && validator.isValid(totalPrice))){
            return res.status(400).send({status:false, message:"pease provide price or enter valid price"})
        }
        if(!(/^[1-9]{1}[0-9]{0,15}$/.test(totalItems) && validator.isValid(totalItems))){ 
            return res.status(400).send({status:false, message:"Bad request please provoide valid totalItems"})    
        }
        if(!(/^[1-9]{1}[0-9]{0,15}$/.test(totalQuantity) && validator.isValid(totalQuantity))){ 
            return res.status(400).send({status:false, message:"Bad request please provoide valid totalQuantity"})    
        }
        if(cancellable){
            if(!validator.isValid(cancellable)){
                return res.status(400).send({status:false, message:"please provide valid input in cancllable it only accept Boolean values"})
            }

            if(!["true", "false"].includes(cancellable)){
                return res.status(400).send({status:false, message:"please provide valid input in cancllable it only accept Boolean values"})
        
            }

        }


        const orderData = await orderModel.create(req.body)
        return res.status(201).send({ status: true, msg: "Order created succesfully", data: orderData })

    } catch (error) {
        return res.status(500).send({ status: false, error: error.message })
    }
}





const updateOrder = async function (req, res) {
    try {
        let userId = req.params.userId
        let { orderId , status} = req.body

        if(!validator.isValidBody(req.body)){
            return res.status(400).send({status:false, message:"Bad Request request body is empty"})
        }


        if (!validator.isValidobjectId(orderId)) {
            return res.status(400).send({ status: false, msg: "invalid orderId" })
        }

        const orderExist = await orderModel.findOne({ _id: orderId, userId:userId, isDeleted: false })
        if (!orderExist) {
            return res.status(404).send({ status: false, msg: "order does not exist" })
        }



        if(orderExist.status == "completed"){
            return res.status(400).send({status:false, message:"this order is already completed you can not change the status"})
        }
        if(orderExist.status == "cancled"){
            return res.status(400).send({status:false, message:"this order is already cancled you can not change the status"})
        }
        
        if(!["pending", "completed", "cancled"].includes(status)){
            return res.status(400).send({status:"false", message:"status is invalid you can only completed or cancle order"})
        }
        if (orderExist.cancellable != true && status == "cancled") {
            return res.status(400).send({ status: false, msg: "order can not be cancel" })
        }
        // if (userId != orderExist.userId) {
        //     return res.status(400).send({ status: false, msg: "credentials are not matching" })
        // }
        const updatedOrder = await orderModel.findOneAndUpdate({ _id: orderId, isDeleted: false },
             { status: status }, { new: true })
       
            return res.status(200).send({ status: false, msg: "order updated successfully", data: updatedOrder })
        
    } catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}




module.exports.updateOrder = updateOrder
module.exports.createOrder = createOrder



