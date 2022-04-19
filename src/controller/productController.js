const productModel = require('../models/productModel')
const validator = require("../validator/validator");
const awsUrl = require("../aws/awsUrl")
const cartModel = require("../models/cartModel");



const updateProduct = async function (req, res) {
    try {
        const productId = req.params.productId

        if (!validator.isValidBody(req.body)) {
            return res.status(400).send({ status: false, message: "Bad Request there is no data in input field" });
        }
        const { description, title, isFreeShipping, price, style, installments } = req.body
        const bodyArray = Object.keys(req.body)
        // const availableSizes = JSON.parse(req.body.availableSizes)
        if (!productId) {
            return res.status(400).send({ status: false, msg: "productId is must please provide productId " });
        }


        if (!validator.isValidobjectId(productId)) {
            return res.status(400).send({ status: false, message: "Invalid productId" });
        }

        let productPresent = await productModel.findOne({ _id: productId, isDeleted: false });


        if (!productPresent) {
            return res.status(404).send({ status: false, message: `product with this id : ${productId} not found` });
        }

        if (bodyArray.includes("title")) {

            if (!validator.isValid(title)) {
                return res.status(400).send({ status: false, message: "Bad request please provoide valid title" })
            }

            const isTitleExists = await productModel.find({ title: { $regex: title, $options: "i" }, isDeleted: false });


            const exactTitleMatch = [];
            for (let i = 0; i < isTitleExists.length; i++) {

                const str1 = isTitleExists[i].title;
                const str2 = title;

                if (str1.toLowerCase() === str2.toLowerCase()) {
                    exactTitleMatch.push(str1);
                }

            }


            if (exactTitleMatch.length) {
                return res.status(409).send({ status: false, message: `Bad Request this title: "${title}" is already exists with "${exactTitleMatch[0]}" this name` });
            }
        }


        if (bodyArray.includes("isFreeShipping")) {


            if (!validator.isValid(isFreeShipping) || isFreeShipping != "true" || isFreeShipping != "false") {
                return res.status(400).send({ status: false, message: "Bad request please provoide valid isFreeShipping it only accept true or false value" })
            }

        }


        if (bodyArray.includes("price")) {
            // check price validation
            //only accept digit


            if (!validator.isValid(price)) {
                return res.status(400).send({ status: false, message: "Bad request please provoide valid price" })
            }
            if (!validator.isValidPrice(price)) {
                return res.status(400).send({ status: false, message: "Bad request please provoide valid price only in digits" })
            }

        }


        if (bodyArray.includes("description")) {

            if (!validator.isValid(description)) {
                return res.status(400).send({ status: false, message: "Bad request please provoide valid description" })
            }
        }


        if (bodyArray.includes("style")) {

            if (!validator.isValid(style)) {
                return res.status(400).send({ status: false, message: "Bad request please provoide valid style" })
            }
        }
        let availableSizes

        if (bodyArray.includes("availableSizes")) {
            if (!validator.isValid(req.body.availableSizes)) {
                return res.status(400).send({ status: false, message: "Bad request please provoide valid availableSizes" })
            }
            availableSizes = JSON.parse(req.body.availableSizes)

            const isSize = validator.isValidSize(availableSizes)
            if (isSize != true) {
                return res.status(400).send({ status: false, message: `Bad request for size ${isSize} so please provoide valid availableSizes only in array of string from ["S", "XS","M","X", "L","XXL", "XL"]` })

            }
            req.body.availableSizes = availableSizes
        }
        //installment validation

        if (bodyArray.includes("installments")) {
            if (!validator.isValid(installments)) {
                return res.status(400).send({ status: false, message: "Bad request please provoide valid installments number" })
            }
            if (!/^[1-9]{1,15}$/.test(installments)) {
                return res.status(400).send({ status: false, message: "Bad request please provoide valid installments number with minimum 1 number" })
            }

        }
        //********************************** */
        //  const updateProduct = await

        if (req.files) {
            let uploadedFileURL;
            let files = req.files // file is the array

            if (files && files.length > 0) {

                uploadedFileURL = await awsUrl.uploadFile(files[0])

                if (uploadedFileURL) {
                    req.body.productImage = uploadedFileURL
                } else {
                    return res.status(400).send({ status: false, message: "error uploadedFileURL is not present" })
                }

            }

        }

        const updatedProduct = await productModel.findByIdAndUpdate(productId, req.body, { new: true })

        if (!updatedProduct) {
            return res.status(404).send({ status: false, message: "product not found and not updated" })
        } else {
            return res.status(200).send({ status: true, data: updatedProduct })
        }

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



const getProduct = async function (req, res) {
    try {
        let data = req.query


        if (!validator.isValidBody(req.query)) {
            let search1 = await productModel.find({ isDeleted: false })
                .select({
                    _id: 0,
                    title: 1,
                    description: 1,
                    price: 1,
                    currencyId: 1,
                    currencyFormat: 1,
                    isFreeShipping: 1,
                    productImage: 1,
                    style: 1,
                    availableSizes: 1,
                    installments: 1,
                    //isDeletedL:0,
                    //   createdAt:0,
                    //   updatedAt:0,
                    //   _v:0
                })
                .sort({ price: 1 });
            if (!search1) {
                return res.status(404).send({ status: false, msg: "no data found" });
            }

            return res.status(200).send({ status: true, count: search1.length, msg: search1 });
        }


        let filterquery = { isDeleted: false };

        const { names, size, priceGreaterThan, priceLessThan } = data;


        let title = names
        let availableSizes
        if (req.query.size) {
            availableSizes = JSON.parse(size)
        }
        //price =priceGreaterThan ,priceLessThan
        console.log(title, availableSizes, names, size, priceGreaterThan, priceLessThan)


        if (availableSizes) {

            if (!validator.isValid(availableSizes)) {
                return res.status(400).send({ status: false, msg: "availableSizes should not be empty" })
            }
            const size = validator.isValidSize(availableSizes)
            if (size != true) {
                return res.status(400).send({ status: false, msg: `${size} is not a valid size` })
            }
            availableSizes = { $in: availableSizes }
            filterquery.availableSizes = availableSizes

        }
        console.log("0")


        if (priceLessThan || priceGreaterThan) {
            console.log("1")
            if (!priceLessThan && priceGreaterThan) {
                if (!validator.isValid(priceGreaterThan)) {
                    return res.status(400).send({ status: false, msg: "price should not be empty" })
                }
                if (!validator.isValidPrice(priceGreaterThan)) {
                    return res.status(400).send({ status: false, msg: "please entre valid price" })
                }

                filterquery.price = { $gt: priceGreaterThan }
            }


            if (priceLessThan && !priceGreaterThan) {
                if (!validator.isValid(priceLessThan)) {
                    return res.status(400).send({ status: false, msg: "priceLessThan should not be empty" })
                }
                if (!validator.isValidPrice(priceLessThan)) {
                    return res.status(400).send({ status: false, msg: "please entre valid priceLessThan" })
                }

                filterquery.price = { $lt: priceLessThan }
            }



            if (priceLessThan && priceGreaterThan) {
                if (!(validator.isValid(priceLessThan) && validator.isValidPrice(priceLessThan))) {
                    return res.status(400).send({ status: false, msg: "please entre valid priceLessThan or check price should not be empty" })
                }
                if (!(validator.isValid(priceGreaterThan) && validator.isValidPrice(priceGreaterThan))) {
                    return res.status(400).send({ status: false, msg: "please entre valid priceGreaterThan or check price should not be empty" })
                }

                filterquery.price = { $lt: priceLessThan, $gt: priceGreaterThan }


            }

        }


        if (title) {


            if (!validator.isValid(title)) {
                return res.status(400).send({ status: false, msg: "name is required" });
            }
            // if (validator.isValid(title)) {

            title = { $regex: title, $options: "i" }
            filterquery.title = title
        }





        //  const searchProducts = await productModel.find({$and : [{isDeleted:false} , {$or:[{title:title},{availableSizes:availableSizes},{price:{$in:[{$lt:priceLessThan},{$gt:priceGreaterThan},]}}]}]}).sort({price:1})

        const searchProducts = await productModel.find(filterquery).sort({ price: 1 })

        //const allProducts = searchProducts.sort(function (a, b) { return a.title.toLowerCase() > b.title.toLowerCase() ? 1 : -1 ||a.title.toLowerCase() > b.title.toLowerCase() ? -1 : 1})


        if (searchProducts.length === 0) {
            return res.status(404).send({ status: false, msg: "No product found" });
        }

        res.status(200).send({ status: true, msg: "sucess", count: searchProducts.length, data: searchProducts });
    }




    catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}
module.exports.getProduct = getProduct


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////














const createProduct = async function (req, res) {
    try {

        if (!validator.isValidBody(req.body) && !req.files) {
            return res.status(400).send({ status: false, msg: "body should not be empty" })
        }

        const body = JSON.parse(JSON.stringify(req.body))

        let { title, description, price, currencyId, currencyFormat } = body

        let availableSizes
        if (req.body.availableSizes) {
            availableSizes = JSON.parse(req.body.availableSizes)

        }

        //const availableSizes = JSON.parse(availableSizes)

        if (!validator.isValid(title)) {
            return res.status(400).send({ status: false, msg: "title should not be empty" })
        }

        const isTitleExists = await productModel.find({
            title: { $regex: title, $options: "i" },
            isDeleted: false,
        });


        const exactTitleMatch = [];
        for (let i = 0; i < isTitleExists.length; i++) {

            const str1 = isTitleExists[i].title;
            const str2 = title;

            if (str1.toLowerCase() === str2.toLowerCase()) {
                exactTitleMatch.push(str1);
            }

        }


        if (exactTitleMatch.length) {
            return res.status(409).send({ status: false, message: `Bad Request this title: "${title}" is already exists with "${exactTitleMatch[0]}" this name` });
        }



        if (!validator.isValid(description)) {
            return res.status(400).send({ status: false, msg: "description should not be empty" })
        }
        if (!validator.isValid(price)) {
            return res.status(400).send({ status: false, msg: "price should not be empty" })
        }
        if (!validator.isValidPrice(price)) {
            return res.status(400).send({ status: false, msg: "please entre valid price" })
        }
        if (!validator.isValid(currencyId)) {
            return res.status(400).send({ status: false, msg: "currencyId should not be empty" })
        }
        if (!validator.isValidCurrencyId(currencyId)) {
            return res.status(400).send({ status: false, msg: "please entre valid currencyId" })
        }
        if (!validator.isValid(currencyFormat)) {
            return res.status(400).send({ status: false, msg: "currencyFormat should not be empty" })
        }
        if (!validator.isValidCurrencyFormat(currencyFormat)) {
            return res.status(400).send({ status: false, msg: "please entre valid Indian currency format '₹' " })
        }
        // if (!validator.isValid(productImage)) {
        //     return res.status(400).send({ status: false, msg: "productImage should not be empty" })
        // }
        if (!validator.isValid(availableSizes)) {
            return res.status(400).send({ status: false, msg: "availableSizes should not be empty" })
        }
        const size = validator.isValidSize(availableSizes)
        if (size != true) {
            return res.status(400).send({ status: false, msg: `${size} is not a valid size and size only accept in array of string` })
        }
        body.availableSizes = availableSizes

        let uploadedFileURL;

        let files = req.files // file is the array
        if (files && files.length > 0) {

            uploadedFileURL = await awsUrl.uploadFile(files[0])

        }
        else {
            return res.status(400).send({ msg: "No file found in request" })
        }
        body.productImage = uploadedFileURL;

        let productData = await productModel.create(body)
        return res.status(201).send({ status: true, message: "product creted successfully", data: productData })


    } catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////




const getProductById = async function (req, res) {
    try {
        const productId = req.params.productId;

        if (!validator.isValidobjectId(productId)) {
            return res.status(400).send({ status: false, msg: `${productId} this is not valid productId ` })
        }

        const productDetails = await productModel.findOne({ _id: productId, isDeleted: false })

        if (!productDetails) {
            return res.status(404).send({ status: false, msg: `Product not found with this ID: ${productId} in our stock` })
        }

        return res.status(200).send({ status: true, message: "Success", data: productDetails })


    } catch (err) {

        return res.status(500).send({ status: false, error: err.message })
    }
}



/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const deleteProduct = async function (req, res) {
    try {
        let productId = req.params.productId


        if (!validator.isValidobjectId(productId)) {
            return res.status(400).send({ status: false, msg: "productId is not valid" })
        }

        let deletedData = await productModel.findOneAndUpdate({ _id: productId, isDeleted: false }, { isDeleted: true, deletedAt: new Date() }, { new: true })

        if (deletedData) {
            // return res.status(200).send({ status: true, msg: "product deleted successfully" })

            // const removeProduct = await cartModel.find({ productId: productId })


            // if (removeProduct.length) {

            //     for (let i = 0; i < removeProduct.length; i++) {

            //         for (let j = 0; j < removeProduct[i].items.length; j++) {

            //             if (removeProduct[i].items[j].productId == req.params.productId) {
            //                 removeProduct[i].items.splice(j, 1)
            //                 let cartId = removeProduct[i]._id
            //                 await cartModel.findByIdAndUpdate({ _id: cartId }, removeProduct[i], { new: true })
            //             }

            //         }


            //     }

            // }
            return res.status(200).send({ status: true, msg: "product deleted successfully" })




        } else {
            return res.status(404).send({ status: false, msg: "product not found" })
        }

    } catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}

module.exports.deleteProduct = deleteProduct
module.exports.getProductById = getProductById
module.exports.createProduct = createProduct
module.exports.updateProduct = updateProduct





