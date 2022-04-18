const mongoose = require("mongoose")

const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false 
    
    return true;
}
//  && typeof value === ['string']


const isValidBody = function (requestBody) {
    return Object.keys(requestBody).length > 0;
}

const isValidName = function (value) {
    if (!(/^[a-zA-Z\s]+$/.test(value.trim()))) {
        return false
    }
    return true
}

const isValidCurrencyId = function (currencyId) {
    return ['INR'].indexOf(currencyId) !== -1
}

const isValidPhone = function (value) {
    if (!(/^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/.test(value.trim()))) {
        return false
    }
    return true
}

const isValidEmail = function (value) {
    if (!(/^[a-z0-9+_.-]+@[a-z0-9.-]+$/.test(value.trim()))) {
        return false
    }
    return true
}

const isValidPassword = function(value) {
    if(!(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,15}$/.test(value.trim()))) {
        return false
    }
    return true
}

const isValidPrice = function(value){
    if(!(/^\d{0,8}(\.\d{1,2})?$/.test(value.trim()))){
        return false
    }
    return true
}

const isValidobjectId = (objectId) => {
    return mongoose.Types.ObjectId.isValid(objectId)
}

const isValidPinCode = function(value){
    if(!(/^[1-9][0-9]{5}$/.test(value.trim()))){
        return false
    }
    return true
}
const isValidDigit = function (value) {
    if (!(/^[1-9]$/.test(value.trim()))) {
        return false
    }
    return true
}





const isValidCurrencyFormat = function (currencyFormat) {
    return ['₹'].indexOf(currencyFormat) !== -1
}

// const isValidSize = function (size) {
//     if(size="S" || "XS" || "M" || "X" || "L"||"XXL" || "XL"){
//         return true
//     }else{
//         false
//     }
    
//     //return ["S", "XS","M","X", "L","XXL", "XL"].indexOf(size) !== -1
// }
const isValidSize =  function (size){
    const availableSizes = ["S", "XS","M","X", "L","XXL", "XL"]
    for(let i=0; i<size.length; i++){
        if(!(availableSizes.includes(size[i]))){
            //  res.status(400).send({status:false, message:`invalid availableSizes for ${size[i]} size`})
            //  break
            return size[i]
        }
    }
    return true
 
}
 




module.exports.isValid = isValid
module.exports.isValidBody = isValidBody
module.exports.isValidCurrencyId = isValidCurrencyId
module.exports.isValidPhone = isValidPhone
module.exports.isValidEmail = isValidEmail
module.exports.isValidPassword = isValidPassword
module.exports.isValidobjectId = isValidobjectId
module.exports.isValidPinCode = isValidPinCode
module.exports.isValidPrice = isValidPrice
module.exports.isValidCurrencyFormat = isValidCurrencyFormat
module.exports.isValidSize = isValidSize
module.exports.isValidName = isValidName
module.exports.isValidDigit = isValidDigit

