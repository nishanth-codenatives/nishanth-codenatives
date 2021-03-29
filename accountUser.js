const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
var mysql = require('mysql');
const { v4: uuidv4, validate: uuidValidate } = require('uuid');
const firebase = require("firebase");
var admin = require('firebase-admin');
const config = require('config');
const moment = require("moment");
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
const {db , modelMap } = require("./src/models");

const Op = modelMap.Sequelize.Op;

mode = process.env.NODE_ENV;
const firebaseConfig = config.get(`${mode}.firebaseConfig`); // CONFIGURE THE FIREBASE WITH API KEY
firebase.initializeApp(firebaseConfig); // CONNECT THE FIREBASE DB ....
admin.initializeApp(firebaseConfig);
const accountuserTbl = modelMap['accountUser'];
const user_role_tbl = modelMap['userRole'];
    var con = mysql.createConnection({
    host: "irmt-clone1.cgedaka56jmc.ap-southeast-1.rds.amazonaws.com",
    user: "irmtrdsAdmin",
    password: "rUqzMo2Q01LiSt3",
    database : "irmt_service_data"
  });
  try {
    console.log("success")
    let sql = "select * from user_profile up order by usr_created desc"
    con.connect(async function(err) {
    con.query(sql, async function (err, result) {
        if (err) throw err;
        console.log("Result: " + result[0].usr_id);
        let password = "rattos@2021"
        console.log( result[0].usr_p_email)
        await firebase.auth().createUserWithEmailAndPassword(
            result[0].usr_p_email ,
            password
        ).then(async (data)=>{ 
            //1 . create user with the organization id
            let user_details = {
                id:uuidv4(),
                user_id : data.user.toJSON().uid,
                org_id : "32fda31f-1077-4a2d-8b41-f8c004bac7c6",
                // token : data.user.toJSON().stsTokenManager.accessToken,
                email :result[0].usr_p_email,
                first_name : result[0].usr_firstname,
                last_name : result[0].usr_lastname ,
                phone_number : result[0].usr_p_contact,
                status : "Active",
                /*audit Columns*/
                updated_at: moment().format('YYYY-MM-DD H:m:s'),
                created_at: moment().format('YYYY-MM-DD H:m:s'),
                is_voided : false,
                is_delete:false,
                enable_flag : true
            }
            var resultUser =  await accountuserTbl.create(user_details);
            // create the role for the user as of now static Admin
            var create_userRole = {
                id:uuidv4(),
                account_user_id : resultUser.id,
                org_id : "32fda31f-1077-4a2d-8b41-f8c004bac7c6",
                role_id :"7c9d6682-7f42-4a14-92ff-b57bf8a1900d",
                updated_at: moment().format('YYYY-MM-DD H:m:s'),
                created_at: moment().format('YYYY-MM-DD H:m:s'),
                is_voided : false,
                enable_flag : true
            }
            var createrole =  await user_role_tbl.create(create_userRole );
        }).catch((err) =>{
            console.log("Firebase -error " , err)
        }) 
    });
    })  
  } catch (error) {
      console.log(error)
  }
    