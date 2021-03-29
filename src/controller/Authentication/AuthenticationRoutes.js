const router = require('express').Router();
const {modelMap } = require("../../models");
const RouteConstant = require('../../constant/Routes');
const AutenticationController = require('./AuthenticationController')(modelMap);

const {authenticateCheck, authorizationCheck} = require('../../cors/middleware');
const AuthenticationController = require('./AuthenticationController');

module.exports = (app) => {
    router.route('/register').post(AutenticationController.SignUp); /// CREATE A ACCOUNT 
    router.route('/login').post(AutenticationController.Login);  /// LOGIN / AUTENTICATE
    router.route('/logout').post(AutenticationController.SignOut);  /// LOGOUT
    router.route('/forgotpassword').post(AutenticationController.ForgotPassword);  /// ForgotPassword
    router.route('/signupvalidate').get(AutenticationController.OrgValidate);  /// validate the email / organziation

    /* router.route('/createuser').post(authenticateCheck, authorizationCheck, AutenticationController.createUser);  /// Create User based on organization
    router.route('/getallusers/:id').get(authenticateCheck, authorizationCheck, AutenticationController.viewUser); ///View all user based on organization
    router.route('/edituser/:id').put(authenticateCheck, authorizationCheck, AutenticationController.editUser); ///Edit particular based on organization
    router.route('/deleteuser/:id').delete(authenticateCheck, authorizationCheck, AutenticationController.deleteUser);  // Delete user based on organization
    router.route('/getuser/:id').get(authenticateCheck, authorizationCheck, AutenticationController.getUser); //Get particular user based on organization
 */
    router.route('/createuser').post( AutenticationController.createUser);  /// Create User based on organization
    router.route('/getallusers/:id').get( AutenticationController.viewUser); ///View all user based on organization
    router.route('/edituser/:id').put(AutenticationController.editUser); ///Edit particular based on organization
    router.route('/deleteuser/:id').delete( AutenticationController.deleteUser);  // Delete user based on organization
    router.route('/getuser/:id').get( AutenticationController.getUser); //Get particular user based on organization

    router.route('/createbucket').post(AutenticationController.createBucket);

    router.route('/confirmUrl').post(AutenticationController.verifySignin); //Confirm the URL of the user...
    router.route('/updatepassword').post(AutenticationController.updatepassword); // update password

    router.route('/authorize').post(AutenticationController.authorize)
    router.route('/confirmaccount/:id').post(AutenticationController.confirmAccount)// validate the Account ..
    router.route('/mailer').post(AutenticationController.mailer)// send mail

    router.route('/confirmpassword').post(AutenticationController.verifyPassword);

    router.route('/portal').post(AutenticationController.createPortalForUser)
    router.route('/portal').get(AutenticationController.getportalofUser)
    router.route('/portal/savesearch').post(AutenticationController.saveUserSearch)
    router.route('/portal/savesearch/:id').delete(AutenticationController.deleteUserSearch)
    router.route('/portal/savedsearch').get(AutenticationController.getSavedSearchOfUser)
    router.route('/portal/recentsearch').get(AutenticationController.getRecentSearchOfUser)
    router.route('/portal/search').post(AutenticationController.searchHere);


    router.route('/check').get(authenticateCheck, authorizationCheck, (req, res)=>{
      console.log('Middleware Checks Passed');
    })
    app.use(`${RouteConstant.VERSION+RouteConstant.Authentication}`, router);
  
  };