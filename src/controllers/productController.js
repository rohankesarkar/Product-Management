const productModel = require('../models/productModel')
const validator = require('../validator/validation')
const aws = require('../aws/aws')
//const aws = require("aws-sdk");




const createProduct = async function (req, res) {
    try {

        const body = JSON.parse(JSON.stringify(req.body))

        let { title, description, price, currencyId, currencyFormat, productImage,
            isFreeShipping, style, installments, availableSizes } = body

        if (!validator.isValidBody(body)) {
            return res.status(400).send({ status: false, msg: "body should not be empty" })
        }
        if (!validator.isValid(title)) {
            return res.status(400).send({ status: false, msg: "title should not be empty" })
        }

        const titleExist = await productModel.findOne({ title: title})
        //console.log(titleExist)
        if (titleExist) {
            return res.status(400).send({ status: false, msg: "title exist already" })
        }


        // const isTitleExists = await productModel.find({
        //     title: { $regex: title, $options: "i" },
        //     isDeleted: false,
        // });


        // const exactTitleMatch = [];
        // for (let i = 0; i < isTitleExists.length; i++) {

        //     const str1 = isTitleExists[i].title;
        //     const str2 = title;

        //     if (str1.toLowerCase() === str2.toLowerCase()) {
        //         exactTitleMatch.push(str1);
        //     }

        // }


        // if (exactTitleMatch.length) {
        //     return res
        //         .status(409)
        //         .send({
        //             status: false,
        //             message: `Bad Request this title: "${title}" is already exists with "${exactTitleMatch[0]}" this name`,
        //         });
        // }

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
            return res.status(400).send({ status: false, msg: "please entre valid currency format" })
        }
        if (isFreeShipping) {
            if (!validator.isValid(isFreeShipping) ) {
                return res.status(400).send({ status: false, msg: "isFreeShipping is not valid" })
            }
        }
        if (style) {
            if (!validator.isValid(style)) {
                return res.status(400).send({ status: false, msg: "please provide style" })
            }
        }
        if (installments) {
            if (!validator.isValid(installments)) {
                return res.status(400).send({ status: false, msg: "please provide installment" })
            }
            if (!/^[1-9]{1,200}$/.test(installments)) {
                return res.status(400).send({ status: false, message: "please provoide valid installments number with minimum 1 number" })
            }
        }
        // if (!validator.isValid(productImage)) {
        //     return res.status(400).send({ status: false, msg: "productImage should not be empty" })
        // }
        if (!validator.isValid(availableSizes)) {
            return res.status(400).send({ status: false, msg: "availableSizes should not be empty" })
        }
        const size = validator.isValidSize(availableSizes)
        if (size != true) {
            return res.status(400).send({ status: false, msg: `${size} is not a valid size` })
        }

        let uploadedFileURL;

        let files = req.files // file is the array
        console.log(files, typeof (files))
        if (files && files.length > 0) {

            uploadedFileURL = await aws.uploadFile(files[0])

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

module.exports.createProduct = createProduct

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


const getProductById = async function (req, res) {
    try {
        const productId = req.params.productId;

        if (!validator.isValidobjectId(productId)) {
            return res.status(400).send({ status: false, msg: `${productId} this is not valid productId ` })
        }


        let productData = await productModel.findById({ _id: productId, isDeleted: false })
        if (productData) {
            return res.status(200).send({ status: true, message: "Success", data: productData })
        }
        else {
            return res.status(404).send({ status: false, msg: " Product not found !" })
        }
    } catch (err) {

        return res.status(500).send({ status: false, error: err.message })
    }
}

module.exports.getProductById = getProductById

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const getProduct = async function (req, res) {
    try {
        let data = req.body;

        if (validator.isValidBody(data)) {
            return res.status(400).send({ status: false, msg: "body must be empty" })
        }

        let filter = {
            isDeleted: false
        }
        if (req.query.availableSizes) {
            if (!(validator.isValidSize(req.query.availableSizes) && validator.isValidBody(req.query.availableSizes))) {
                return res.status(400).send({ status: false, msg: "Size is not valid" })
            }
            filter['availableSizes'] = req.query.availableSizes
        }
        if (req.query.title) {
            if (!(validator.isValidSize(req.query.title) && validator.isValid(req.query.title))) {
                return res.status(400).send({ status: false, msg: "title is not valid" })
            }
            // title={ $in: /title/i }
            // filter['title'] = req.query.title
            req.query.title = { $regex: req.query.title, $options: "i" }
            filter['title'] = req.query.title
        }

        if (req.query.priceLessThan || req.query.priceGreaterThan) {

            if (!req.query.priceLessThan && req.query.priceGreaterThan) {
                if (!validator.isValid(req.query.priceGreaterThan)) {
                    return res.status(400).send({ status: false, msg: "price should not be empty" })
                }
                if (!validator.isValidPrice(req.query.priceGreaterThan)) {
                    return res.status(400).send({ status: false, msg: "please entre valid price" })
                }
                filter["price"] = { $gt: req.query.priceGreaterThan }
            }


            if (req.query.priceLessThan && !req.query.priceGreaterThan) {
                if (!validator.isValid(req.query.priceLessThan)) {
                    return res.status(400).send({ status: false, msg: "price should not be empty" })
                }
                if (!validator.isValidPrice(req.query.priceLessThan)) {
                    return res.status(400).send({ status: false, msg: "please entre valid price" })
                }
                filter['price'] = { $lt: req.query.priceLessThan }
            }
        }
        if (req.query.priceLessThan && req.query.priceGreaterThan) {
            if (!(validator.isValid(req.query.priceLessThan) && validator.isValidPrice(req.query.priceLessThan))) {
                return res.status(400).send({ status: false, msg: "please entre valid priceLessThan or check price should not be empty" })
            }
            if (!(validator.isValid(req.query.priceGreaterThan) && validator.isValidPrice(req.query.priceGreaterThan))) {
                return res.status(400).send({ status: false, msg: "please entre valid priceGreaterThan or check price should not be empty" })
            }
            filter['price'] = { $lt: req.query.priceLessThan, $gt: req.query.priceGreaterThan }
        }


        let searchedData = await productModel.find(filter).sort({ price: 1 })
            .select({ isDeleted: 0, _id: 0, createdAt: 0, updatedAt: 0, __v: 0 })

        if (searchedData.length > 0) {
            return res.status(200).send({ status: true, count: searchedData.length, data: searchedData })
        } else {
            return res.status(404).send({ status: false, msg: "data not found" })
        }

    } catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}
module.exports.getProduct = getProduct


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const updateProduct = async function (req, res) {
    try {

        const body = JSON.parse(JSON.stringify(req.body))
        let productId = req.params.productId

        if (!validator.isValidobjectId(productId)) {
            return res.status(400).send({ status: false, msg: "productId is not valid" })
        }

        let { title, description, price, currencyId, currencyFormat, productImage, availableSizes } = body

        let update = {}

        if (title) {
            if (!validator.isValid(title)) {
                return res.status(400).send({ status: false, msg: "title is not valid" })
            }
            let titleExist = await productModel.findOne({ title: title })
            if (titleExist) {
                return res.status(400).send({ status: false, msg: "title exist already" })
            }
            update["title"] = title
        }
        if (description) {
            if (!validator.isValid) {
                return res.status(400).send({ status: false, msg: "provide valid description" })
            }
            update["description"] = description
        }
        if (price) {
            if (!(validator.isValid(price) && validator.isValidPrice(price))) {
                return res.status(400).send({ status: false, msg: "price is not valid" })
            }
            update["price"] = price
        }
        if (currencyFormat) {
            if (!validator.isValidCurrencyFormat(currencyFormat)) {
                return res.status(400).send({ status: false, msg: "currencyFormat is not valid" })
            }
            update["currencyFormat"] = currencyFormat
        }
        if (currencyId) {
            if (!(validator.isValid(currencyId) && validator.isValidCurrencyId(currencyId))) {
                return res.status(400).send({ status: false, msg: "currencyId is not valid" })
            }
            update["currencyId"] = currencyId
        }
        if (productImage) {
            let uploadedFileURL;

            let files = req.files // file is the array
            if (files && files.length > 0) {

                uploadedFileURL = await aws.uploadFile(files[0])
                body.profileImage = uploadedFileURL;
            }
            else {
                return res.status(400).send({ msg: "No file found in request" })
            }
            update["productImage"] = productImage
        }
        if (currencyId) {
            if (!(validator.isValid(availableSizes) && validator.isValidSize(availableSizes))) {
                return res.status(400).send({ status: false, msg: "availableSizes is not valid" })
            }
            update["availableSizes"] = availableSizes
        }

        let updatedData = await productModel.findOneAndUpdate({ _id: productId }, update, { new: true })
        if (updatedData) {
            return res.status(200).send({ status: true, msg: updatedData })
        } else {
            return res.status(400).send({ status: true, msg: "product does not exist" })
        }


    } catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}
module.exports.updateProduct = updateProduct

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


const deleteProduct = async function (req, res) {
    try {
        let productId = req.params.productId


        if (!validator.isValidobjectId(productId)) {
            return res.status(400).send({ status: false, msg: "productId is not valid" })
        }

        let deletedData = await productModel.findOneAndUpdate({ _id: productId, isDeleted: false }, { isDeleted: true, deletedAt: new Date() }, { new: true })
        if (deletedData) {
            return res.status(200).send({ status: true, msg: "product deleted successfully" })
        } else {
            return res.status(404).send({ status: false, msg: "product not found" })
        }

    } catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}

module.exports.deleteProduct = deleteProduct

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

