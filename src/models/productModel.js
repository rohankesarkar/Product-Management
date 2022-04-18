let mongoose = require("mongoose");

let productSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            unique: true,
        },

        description: {
            type: String,
            required: true,
        },

        price: {
            type: Number,
            required: true
        },
        currencyId: {
            type: String,
            required: true,
        },
        currencyFormat: {
            type: String,
            required: true,
        },

        isFreeShipping: {
            type: Boolean,
            default: false,
        },

        productImage: {
            type: String,
           //required: true,
        },

        style: {
            type: String,
        },
        availableSizes: {
            type: [String],
            required: true,
            trim:true
        },
        installments: {
            type: Number,
        },

        isDeleted: {
            type: Boolean,
            default: false,
        },
        deletedAt:{
            type:Date
        }
    },
    { timestamps: true }
);
module.exports = mongoose.model("product32", productSchema);