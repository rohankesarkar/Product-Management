const aws = require("aws-sdk");

aws.config.update(
    {
      accessKeyId: "AKIAY3L35MCRVFM24Q7U",
      secretAccessKey: "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",
      region: "ap-south-1"
    }
  )
  
  
  let uploadFile = async (file) => {
    return new Promise(async function (resolve, reject) {
     // Promise.reject(reason) Returns a new Promise object that is rejected with the given reason.
     // Promise.resolve(value) Returns a new Promise object that is resolved with the given value.
      let s3 = new aws.S3({ apiVersion: "2006-03-01" }) //we will be using s3 service of aws
      
      var uploadParams = {
        ACL: "public-read",
        Bucket: "classroom-training-bucket", 
        Key: "radhika/" + file.originalname, 
        Body: file.buffer
      }
  
      s3.upload(uploadParams, function (err, data) {
        if (err) {
          return reject({ "error": err })
        }
  
        console.log(data)
        console.log(" file uploaded succesfully ")
        return resolve(data.Location) // HERE
      })
      
    })
  }

  module.exports.uploadFile = uploadFile



  