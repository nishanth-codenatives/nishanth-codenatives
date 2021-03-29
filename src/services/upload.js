const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require("multer-s3");

const config = require('config');
let mode = process.env.NODE_ENV;

const s3 = new aws.S3({
    accessKeyId: config.get(`${mode}.aws.AWS_ID`),
    secretAccessKey: config.get(`${mode}.aws.AWS_SECRET`),
});

aws.config.update({
    secretAccessKey: config.get(`${mode}.aws.AWS_SECRET`),
    accessKeyId: config.get(`${mode}.aws.AWS_ID`),
  region: "ap-southeast-1",
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type, only JPEG and PNG is allowed!"), false);
  }
};

/**	
 * Function for create a new s3 bucket	
 * @param {BUCKET_NAME} This is new bucket name
 * @return {json} It returns new bucket location
 */
const s3createBucket = (BUCKET_NAME) => {
  return new Promise((resolve, reject) => {
    const params = {
      Bucket: BUCKET_NAME,
      CreateBucketConfiguration: {
        // Set your region here
        LocationConstraint: config.get(`${mode}.aws.region`)
        
      }
    };
    s3.createBucket(params, function (err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

/**	
 * Function for create a new folder inside a s3 bucket	
 * @param {params} { Bucket: <bucket_name>, Key: '<folder_name>/', ACL: 'public-read', Body: '<folder description>' }
 * @return {json} It returns new folder detail
 */
const s3createFolder = (params) => {
  return new Promise((resolve, reject) => {
    s3.upload(params, function (err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

/**	
 * This function for read/download file from s3 bucket	
 * @param {params} { Bucket: <bucket_name>, Key: '<folder_name>/<file_key>' }
 * @return {json} It returns file 
 */
const s3download = function (params) {
  return new Promise((resolve, reject) => {
    s3.getObject(params, function (err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data.Body.toString('utf-8'));
      }
    });
  });
}

/**	
 * This function for delete file from s3 bucket	
 * @param {params} { Bucket: <bucket_name>, Key: '<folder_name>/<file_key>' }
 * @return {json} It returns message
 */
const s3delete = function (params) {
  return new Promise((resolve, reject) => {
    s3.deleteObject(params, function (err, data) {
      if (err) {
        reject(err);
      } else {
        resolve({ data: "Deleted successfully" });
      }
    });
  });
};

/**	
 * This function for get s3 bucket file url
 * @param {params} { Bucket: <bucket_name>, Key: '<folder_name>/<file_key>', Expires: <time in seconds>}
 * @return {json} It returns file url
 */
const s3getSignedUrl = function (params) {
  return new Promise((resolve, reject) => {
    s3.getSignedUrl('getObject', params, function (err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

/**	
 * This function for upload file to s3 bucket	
 * @param {req} default req
 * @param {res} default res
 * @param {postData} {fieldName: <fieldName>, fileCount: <fileCount>}
 * @param {params} { Bucket: <bucket_name>, folder: '<folder_name>' }
 * @return {json} It returns uploaded file detail with s3 file location
 */
const s3upload = function (req, res, postData, params) {
  return new Promise((resolve, reject) => {
    const upload = multer({
      fileFilter,
      storage: multerS3({
        acl: "public-read",
        s3,
        bucket: params.Bucket,
        acl: 'public-read',
        metadata: function (req, file, cb) {
          var date = new Date();
          var timestamp = date.getTime();
          cb(null, { fieldName: `${timestamp}${file.originalname}` });
        },
        key: function (req, file, cb) {
          let fileKey = (params.folder) ? params.folder + '/' : '';
          cb(null, fileKey + Date.now().toString());
        },
      }),
    });

    const fileUpload = upload.array(postData.fieldName, postData.fileCount);
    fileUpload(req, res, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(req.files);
      }
    });
  });
};

const s3putObject = function (req, res, postData, params) {
  let base64 = req.body.profilePicture;
  let base64data = Buffer(base64.replace(/^data:image\/\w+;base64,/, ''), 'base64');
    // Getting the file type, ie: jpeg, png or gif
    let type = base64.split(';')[0].split('/')[1];

    // Generally we'd have an userId associated with the image
    // For this example, we'll simulate one
    let d = Date();
    let userId = postData.customer_id+'pp'+d.getTime();

    let location = '';
    let key = '';
  //buf = Buffer.from(req.body.imageBinary.replace(/^data:image\/\w+;base64,/, ""),'base64')
  return new Promise(async(resolve, reject) => {
    let data = {
      Bucket: params.Bucket,
      Key: userId,
      ACL: 'public-read',
      //Key: req.body.userId,
      Body:base64data,
      ContentEncoding: 'base64',
      ContentType: `image/${type}` // required. Notice the back ticks
    };
    try {
      const { Location, Key } = await s3.upload(data).promise();
      location = Location;
      key = Key;
      resolve({location:location,key:key})
    } catch (error) {
       console.log(error)
       reject(error)
    }

/*     s3.putObject(data, function (err, data) {
      if (err) {
        reject(err);
        console.log(err);
        console.log('Error uploading data: ', data);
      } else {
        resolve(data);
        console.log('succesfully uploaded the image!');
      }
    });*/
  }); 
}

module.exports = { s3createBucket, s3createFolder,s3putObject, s3upload, s3download, s3delete, s3getSignedUrl };


