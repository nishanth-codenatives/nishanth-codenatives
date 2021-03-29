
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const config = require('config');
const app = express();
const reqResponse = require('./src/cors/responseHandler');
const { v4: uuidv4, validate: uuidValidate  } = require('uuid');
const firebase = require("firebase");
const moment = require("moment");
const Op = require('sequelize').Op;
var admin = require('firebase-admin');
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
const {db , modelMap } = require("./src/models");

const PORT = 5555;

console.log(process.env.NODE_ENV);
mode = process.env.NODE_ENV;

const firebaseConfig = config.get(`${mode}.firebaseConfig`); // CONFIGURE THE FIREBASE WITH API KEY
firebase.initializeApp(firebaseConfig); // CONNECT THE FIREBASE DB ....

admin.initializeApp(firebaseConfig);
const {authenticateCheck , authorizationCheck} = require("./src/cors/middleware")
const controller = './src/controller';
const AutenticationController = require('./src/controller/Authentication/AuthenticationController')(modelMap);
const TeamController = require('./src/controller/Team/TeamController')(modelMap);
app.post('/register', AutenticationController.SignUp); // Account signup
app.post('/login', AutenticationController.Login);  // Account Login
app.post('/logout', AutenticationController.SignOut); // Account Signout
app.post('/forgotpassword', AutenticationController.ForgotPassword); // Forgot Password
app.get('/signupvalidate', AutenticationController.OrgValidate); // Validation for the email / organization 

app.post('/createuser', authenticateCheck, AutenticationController.createUser);  /// Create User based on organization
app.get('/getallusers/:id', authenticateCheck, AutenticationController.viewUser); ///View all user based on organization
app.put('/edituser/:id', authenticateCheck,  AutenticationController.editUser); ///Edit particular based on organization
app.delete('/deleteuser/:id', authenticateCheck, AutenticationController.deleteUser);  // Delete user based on organization
app.get('/getuser/:id', authenticateCheck,  AutenticationController.getUser); //Get particular user based on organization

app.post('/createbucket', AutenticationController.createBucket);
// app.post('/createuser', AutenticationController.createUser);  /// Create User based on organization
// app.get('/getallusers/:id',  AutenticationController.viewUser); ///View all user based on organization
// app.put('/edituser/:id',  AutenticationController.editUser); ///Edit particular based on organization
// app.delete('/deleteuser/:id',  AutenticationController.deleteUser);  // Delete user based on organization
// app.get('/getuser/:id',  AutenticationController.getUser); //Get particular user based on organization

app.post('/confirmUrl', AutenticationController.verifySignin); //verification for the address
app.post('/updatepassword',AutenticationController.updatepassword); // update password

app.post('/confirmaccount/:id' , AutenticationController.confirmAccount); // validate the Account ..
app.get('/portal', AutenticationController.getportalofUser);

app.post('/portal/savesearch', authenticateCheck, AutenticationController.saveUserSearch)
app.delete('/portal/savesearch/:id', authenticateCheck, AutenticationController.deleteUserSearch)
app.get('/portal/savedsearch', authenticateCheck, AutenticationController.getSavedSearchOfUser)
app.get('/portal/recentsearch',authenticateCheck, AutenticationController.getRecentSearchOfUser)
app.post('/portal/search', AutenticationController.searchHere);

app.post('/authorize' ,AutenticationController.authorize)
app.post('/mailer' ,AutenticationController.mailer)
app.post('/confirmpassword' , AutenticationController.verifyPassword)


app.post('/team' ,authenticateCheck, TeamController.addTeam) // add team and team members
app.get('/team' , authenticateCheck,TeamController.teamAndTeamList)// list all team and team members
app.get('/team/view/:id' ,authenticateCheck, TeamController.viewParticularTeam)// display particular team
app.delete('/team/:id' ,authenticateCheck, TeamController.deleteTeam) // delete team 
app.put('/team/:id' , authenticateCheck,TeamController.editTeamAndTeamMembers)// edit team and team members


module.exports = {
    app
};