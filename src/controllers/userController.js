const userModel = require('../models/userModel')
const validator = require('../validator/validation')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const aws = require('../aws/aws')



const createUser = async function (req, res) {
    try {
        const body = JSON.parse(JSON.stringify(req.body))
        //const body = JSON.parse(req.body.data)

        if (!validator.isValidBody(body)) {
            return res.status(400).send({ status: false, msg: "body should not be empty" })
        }

        let { fname, lname, email, profileImage, phone, password, address } = body

        if (!validator.isValid(fname)) {
            return res.status(400).send({ status: false, msg: "first name should not be empty" })
        }
        if (!validator.isValidName(fname)) {
            return res.status(400).send({ status: false, msg: "first name is not valid" })
        }
        if (!validator.isValid(lname)) {
            return res.status(400).send({ status: false, msg: "first name should not be empty" })
        }
        if (!validator.isValidName(lname)) {
            return res.status(400).send({ status: false, msg: "last name  is not valid" })
        }
        if (!validator.isValid(email)) {
            return res.status(400).send({ status: false, msg: "email should not be empty" })
        }
        if (!validator.isValidEmail(email)) {
            return res.status(400).send({ status: false, msg: "email  is not valid" })
        }

        const dupEmail = await userModel.findOne({ email: email })

        if (dupEmail) {
            return res.status(400).send({ status: false, msg: "email exist already" })
        }


        // if (!validator.isValid(profileImage)) {
        //     return res.status(400).send({ status: false, msg: "profileImage should not be empty" })
        // }
        if (!validator.isValid(phone)) {
            return res.status(400).send({ status: false, msg: "phone number should not be empty" })
        }
        if (!validator.isValidPhone(phone)) {
            return res.status(400).send({ status: false, msg: "phone number is not valid " })
        }

        const dupPhone = await userModel.findOne({ phone: phone })
        if (dupPhone) {
            return res.status(400).send({ status: false, msg: 'phone number exist already' })
        }
        if (!validator.isValid(password)) {
            console.log("password1")
            return res.status(400).send({ status: false, msg: "password should not be empty" })
        }
        if (!validator.isValidPassword(password)) {
            console.log("pass2")
            return res.status(400).send({ status: false, msg: "password is not valid " })
        }
        if (!validator.isValidBody(address)) {
            console.log("here")
            return res.status(400).send({ status: false, msg: "address should not be empty" })
        }
        if (!validator.isValidBody(address.shipping)) {
            console.log("here also")
            return res.status(400).send({ status: false, msg: "shipping address should not be empty" })
        }

        if (!validator.isValid(address.shipping.street)) {
            return res.status(400).send({ status: false, msg: "street of shipping address should not be empty" })
        }
        if (!validator.isValid(address.shipping.city)) {
            return res.status(400).send({ status: false, msg: "city of shipping address should not be empty" })
        }
        if (!validator.isValidName(address.shipping.city)) {
            return res.status(400).send({ status: false, msg: "invalid input for city of shipping address" })
        }
        if (!validator.isValid(address.shipping.pincode)) {
            return res.status(400).send({ status: false, msg: "pincode of shipping address  should not be empty" })
        }
        if (!validator.isValidPinCode(address.shipping.pincode)) {
            return res.status(400).send({ status: false, msg: "pincode of shipping address  is not valid" })
        }
        if (!validator.isValidBody(address.billing)) {
            return res.status(400).send({ status: false, msg: "billing address should not be empty" })
        }
        if (!validator.isValid(address.billing.street)) {
            return res.status(400).send({ status: false, msg: "street of billing address should not be empty" })
        }
        if (!validator.isValid(address.billing.city)) {
            return res.status(400).send({ status: false, msg: "city of billing address should not be empty" })
        }
        if (!validator.isValidName(address.billing.city)) {
            return res.status(400).send({ status: false, msg: "invalid input for city of billing address" })
        }
        if (!validator.isValid(address.billing.pincode)) {
            return res.status(400).send({ status: false, msg: "pincode of billing address  should not be empty" })
        }
        if (!validator.isValidPinCode(address.billing.pincode)) {
            return res.status(400).send({ status: false, msg: "pincode of billing address is not valid" })
        }
        let uploadedFileURL;

        let files = req.files // file is the array
        if (files && files.length > 0) {

            uploadedFileURL = await aws.uploadFile(files[0])

        }
        else {
            return res.status(400).send({ msg: "No file found in request" })
        }
        body.profileImage = uploadedFileURL;

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(req.body.password, salt)
        req.body.password = hashedPassword

        const saveUser = await userModel.create(body)
        return res.status(201).send({ status: true, msg: "user created successfully", data: saveUser })
    } catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}

module.exports.createUser = createUser


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


const loginUser = async function (req, res) {
    try {
        let body = req.body
        let { email, password } = body

        if (!validator.isValidBody(body)) {
            return res.status(400).send({ status: false, msg: "body should not be empty" })
        }

        if (!validator.isValid(email)) {
            return res.status(400).send({ status: false, msg: "email should not be empty" })
        }
        if (!validator.isValidEmail) {
            return res.status(400).send({ status: false, msg: "email is not valid" })
        }
        if (!validator.isValid(password)) {
            return res.status(400).send({ status: false, msg: "password should not be empty" })
        }
        if (!validator.isValidPassword) {
            return res.status(400).send({ status: false, msg: "password is not valid" })
        }
        if (email && password) {
            const user = await userModel.findOne({ email: email })
            if (user) {
                const isValidPassword = await bcrypt.compare(body.password, user.password)
                if (isValidPassword) {
                    let token = jwt.sign({ userId: user._id, expiresIn: "15d" }, "PROJECT3BOOKMANAGEMENTPROJECTDONYBYGROUP7")
                    res.header('x-api-key', token)
                    return res.status(200).send({ status: true, msg: "user login successfull", data: token })
                } else {
                    return res.status(400).send({ status: false, msg: "password is not valid" })
                }
            } else {
                return res.status(400).send({ status: false, msg: "user not exist" })
            }
        }


    } catch (err) {
        return res.status(400).send({ status: false, msg: err.message })
    }
}

module.exports.loginUser = loginUser

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const getUser = async function (req, res) {
    try {
        const userId = req.params.userId
        const body = req.body

        if (!(validator.isValidobjectId(userId) && validator.isValid(userId))) {
            return res.status(400).send({ status: false, msg: "userId is not valid" })
        }
        if (validator.isValidBody(body)) {
            return res.status(400).send({ status: false, msg: "body should be empty" })
        }

        const userData = await userModel.findById({ _id: userId })
        if (userData) {
            return res.status(200).send({ status: true, msg: "user profile details", data: userData })
        } else {
            return res.status(400).send({ status: false, msg: "userid does not exist" })
        }
    } catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}

module.exports.getUser = getUser

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const updateUser = async function (req, res) {
    try {
        const userId = req.params.userId
        const body = JSON.parse(JSON.stringify(req.body))

        if (!(validator.isValidobjectId(userId) && validator.isValid(userId))) {
            return res.status(400).send({ status: false, msg: "userId is not valid" })
        }
        if (!validator.isValidBody(body)) {
            return res.status(400).send({ status: false, msg: "body must be present" })
        }
        let update = {}
        let { fname, lname, profileImage, phone, email, address, password } = body
        // const address = JSON.parse(body.address)

        if (fname) {
            if (!(validator.isValid(fname) && validator.isValidName(fname))) {
                return res.status(400).send({ status: false, msg: "fname is not valid" })
            }
            update["fname"] = fname
        }


        if (lname) {
            if (!(validator.isValid(lname) && validator.isValidName(lname))) {
                return res.status(400).send({ status: false, msg: "lname is not valid" })
            }
            update["lname"] = lname
        }


        // if (profileImage) {
        //     // if (!validator.isValid(profileImage)) {
        //     //     return res.status(400).send({ status: false, msg: "profileImage is not valid" })
        //     // }
        //     update["profileImage"] = profileImage
        // }


        if (phone) {
            if (!(validator.isValid(phone) && validator.isValidPhone(phone))) {
                return res.status(400).send({ status: false, msg: "phone is not valid" })
            }
            const duPhone = await userModel.findOne({ phone: phone })
            if (duPhone) {
                return res.status(400).send({ status: false, msg: "phone number exist alredy" })
            }
            update["phone"] = phone
        }

        if (email) {
            if (!(validator.isValid(email) && validator.isValidEmail(email))) {
                return res.status(400).send({ status: false, msg: "email is not valid" })
            }
            const dupEmail = await userModel.findOne({ email: email })
            if (dupEmail) {
                return res.status(400).send({ status: false, msg: "email id exist alredy" })
            }
            update["email"] = email
        }

        if (password) {
            if (!(validator.isValid(password) && validator.isValidPassword(password))) {
                return res.status(400).send({ status: false, msg: "password is not valid" })
            }
            const salt = await bcrypt.genSalt(10)
            const hashedPassword = await bcrypt.hash(req.body.password, salt)
            req.body.password = hashedPassword
            update["password"] = hashedPassword
        }
        if (body.address) {



            if (body.address.shipping) {
                if (address.shipping.street) {
                    if (!validator.isValidName(address.shipping.street)) {
                        return res.status(400).send({ status: false, msg: "street of shipping address is not valid" })
                    }
                    update["address.shipping.street"] = address.shipping.street
                }
                if (address.shipping.city) {
                    if (!validator.isValid(address.shipping.city)) {
                        return res.status(400).send({ status: false, msg: "city of shipping address is not valid" })
                    }
                    update["address.shipping.city"] = address.shipping.city
                }
                if (address.shipping.pincode) {
                    if (!(validator.isValid(address.shipping.pincode) && validator.isValidPinCode(address.shipping.pincode))) {
                        return res.status(400).send({ status: false, msg: "pincode of shipping address is not valid" })
                    }
                    update["address.shipping.pincode"] = address.shipping.pincode
                }


            }
            if (address.billing) {
                if (address.billing.street) {
                    if (!validator.isValid(address.billing.street)) {
                        return res.status(400).send({ status: false, msg: "street of billing address is not valid" })
                    }
                    update["address.billing.street"] = address.billing.street
                }
                if (address.billing.city) {
                    if (!validator.isValid(address.billing.city)) {
                        return res.status(400).send({ status: false, msg: "city of billing address is not valid" })
                    }
                    update["address.billing.city"] = address.billing.city
                }
                if (address.billing.pincode) {
                    if (!(validator.isValid(address.billing.pincode) && validator.isValidPinCode(address.billing.pincode))) {
                        return res.status(400).send({ status: false, msg: "pincode of billing address is not valid" })
                    }
                    update["address.billing.pincode"] = address.billing.pincode
                }

            }
        }
        if(profileImage){
        let uploadedFileURL;

        let files = req.files // file is the array
        if (files && files.length > 0) {

            uploadedFileURL = await aws.uploadFile(files[0])
            body.profileImage = uploadedFileURL;
        }
        else {
            return res.status(400).send({ msg: "No file found in request" })
        }
        
      update['profileImage'] = profileImage
    }

        const updatedData = await userModel.findOneAndUpdate({ _id: userId }, update, { new: true })
        if (updatedData) {
            return res.status(200).send({ status: true, msg: "user profile updated", data: updatedData })
        } else {
            return res.status(400).send({ status: false, msg: "userid does not exist" })
        }

    } catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}

module.exports.updateUser = updateUser