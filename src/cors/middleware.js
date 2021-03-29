const reqResponse = require('./responseHandler');
const axios = require('axios');
const config = require('config');
mode = process.env.NODE_ENV;


function authenticateCheck(req, res, next){
  try{
    console.log("midddleware" ,req.account_details)
     let slug =req.headers.slug;
     req.slugValue = slug;
     axios({
      method: 'post',
      url: config.get(`${mode}.authenticate`),
      headers:{
        authorization: req.headers.authorization,
      },
      data: {
        token: req.headers.authorization,
      }
    }).then(response =>{
      //res.status(200).json(response.data);
      let result = response.data.data;
      //console.log(result.user_details.user_role[0].role_id);
      req.role_id = result.user_details.user_role[0].role_id
      console.log("result" ,result.user_details)
      req.headers.account_details = {
        "account_user_id" :result.user_details.id,
        "org_id" : result.user_details.organization.id,
        "org_name":result.user_details.organization.org_name
      }

      next();
    })
    .catch(err =>{
      console.log(err);
      return res.status(400).send({
        "status" : false,
        message: "Authentication failed"
      })
    })
  }
  catch(error){
    return res.status(400).send({
      "status" : false,
      message: "Authentication Failed"
    })
  }
}

function authorizationCheck(req, res, next){
  try{
    let id = req.role_id
    let slugg = req.slugValue
     axios({
      method: 'GET',
      url: config.get(`${mode}.authorize`)+`?role_id=${id}&slug=${slugg}`,
    }).then(response =>{
      //res.status(200).json(response.data);
      next();
    })
    .catch(err =>{
      return res.status(400).send({
        "status" : false,
        message: "Authorization Failed"
      })
    })
  }
  catch(error){
    return res.status(400).send({
      "status" : false,
      message: "Authorization Failed"
    })
  }
}

module.exports = {
  authenticateCheck, authorizationCheck
}