const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId

const cartSchema = new mongoose.Schema({
    userId : {
       type:ObjectId,
        ref : 'User32',
        required : true,
        unique : true
    },
    items : [{
        _id:0,
        productId : {
            type:ObjectId,
            ref : 'Product32',
            required : true

        },
        quantity : {
            type : Number,
            required : true,
            default: 1

        }
    }],
    totalPrice : {
        type : Number,
        required : true,
        comment : "Holds total price of all the items in the cart"
    },
    totalItems : {
        type : Number,
        required : true,
        comment : "Holds total number of items in the cart"
    }

}, { timestamps : true });

module.exports = mongoose.model('Cart32', cartSchema)