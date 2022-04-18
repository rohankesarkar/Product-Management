const mongoose = require("mongoose");
 const ObjectId = mongoose.Schema.Types.ObjectId


const cartSchema = new mongoose.Schema({
    userId : {
        type : ObjectId,
        ref : 'user',
        required : true,
        unique : true
    },
    items : [{
        productId : {
            type : ObjectId,
            ref : 'product32',
            required : true

        },
        quantity : {
            type : Number,
            required:true

        },
        price:{
            type:String,

        }
    }],
    totalPrice : {
        type : Number,
        //required : true,
        comment : "Holds total price of all the items in the cart"
    },
    totalItems : {
        type : Number,
       // required : true,
        comment : "Holds total number of items in the cart"
    }

}, { timestamps : true });

module.exports = mongoose.model('cart32', cartSchema)