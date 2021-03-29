const fs = require('fs');
const aws = require('aws-sdk');
const config = require('config');
let mode = process.env.NODE_ENV;

const s3 = new aws.S3({
    accessKeyId: config.get(`${mode}.aws.AWS_ID`),
    secretAccessKey: config.get(`${mode}.aws.AWS_SECRET`),
    region: "us-east-2",
});


const uploadFile = (fileName) => {
    fs.readFile(fileName, (err, data) => {
     if (err) throw err;
     const params = {
         Bucket: config.get(`${mode}.aws.AWS_BUCKET_NAME`), // pass your bucket name
         Key: 'contacts.jpeg', // file will be saved as testBucket/contacts.csv
         Body: JSON.stringify(data, null, 2)
     };
     s3.upload(params, function(s3Err, data) {
         if (s3Err) throw s3Err
         console.log(`File uploaded successfully at ${data.Location}`)
     });
  });
};

module.exports = uploadFile ;

