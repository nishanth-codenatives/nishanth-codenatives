const reqResponse = require('../../cors/responseHandler');
const {sendMail} = require('../../cors/mail');
const { v4: uuidv4, validate: uuidValidate  } = require('uuid');
const firebase = require("firebase");
var admin = require('firebase-admin');
const moment = require("moment");
const Op = require('sequelize').Op;
const config = require('config');
const storage = require('../../services')
const axios = require('axios');
//const profiles = require('./mock.js')
var Sequelize = require('sequelize');
const domainLlist = require('./domainList.json')
module.exports = (modalMap) => {
    const organizationTbl = modalMap["organization"]; 
    const accountuserTbl = modalMap["accountUser"]; 
    const user_role_tbl = modalMap["userRole"]; 
    const role_tbl = modalMap["role"]; 
    const file_upload_tbl  = modalMap['fileUpload']
    const portal_user_tbl = modalMap["portalUser"]
    const lookupValueTbl = modalMap["lookupValue"]
    const resumeViewLog = modalMap["resumeViewLog"]
    const searchLogTbl = modalMap["searchLog"]
    const track_status_tbl = modalMap["track"]
    const resourceRoleTbl = modalMap['resourceRole']
    const trackFlowTbl = modalMap["trackWorkFlow"];
    /* Signup Using the Firebase  */
    const SignUp = async (req , res) =>{
        const {email , password , first_name , last_name ,company, phone_number} = req.body;
        // const roleIDs = ['a227cde3-862a-4b62-96cb-39c6c23febb7', '2f360288-cab0-4e69-ae18-50d75a433790'];

        // const trackStatus = [   'Initial','Not Spoken - VM / NR - Emailed','Spoken - To Track','Not Suitable / Not Interested','Interested',
        //                         'Interested Tracking','Proposed','Proposed Tracking','Rejected','Shortlisted','Shortlisted Tracking',
        //                         'Interview Scheduled','Interview Scheduled Tracking','Interview Reject','Post Interview Feedback',
        //                         'Offered','Offered Tracking','Offer Rejected - Client','Offer Declined - Candidate','Offer Accepted',
        //                         'Pre Join Tracking','Joined','Not Joined','Joined Tracking','New Profile','Joined - Client Reject',
        //                         'ASSIGN','Pre-Offered','Project going to end','Project Ended'
        //                     ];

        // const trackStatus = [ 
        //     'Initial Contact', 
        //     'Interested',
        //     'Not Interested',
        //     'Submitted',
        //     'Interview Scheduled',
        //     'Interviewed',
        //     'Interview Rescheduled',
        //     'Interview Cancelled',
        //     'Selected',
        //     'Offered',
        //     'Joined',
        //     'Offer Revoked',
        //     'Withdrawn',
        //     'Rejected',
        //     'Reactivate'            
        // ];
        try {
            if(!first_name || !last_name || !email || !phone_number|| !company|| !password){
                return res.status(400).send({
                    "status" : false,
                    error: "Fields are Mandatory"
                })
            }
            let fetchRoleBasedOrganization = await role_tbl.findAll({
                where :{ is_common : true}
            })

            
            
            let isActivated = await accountuserTbl.findOne({
                where : { email : email}
            })
            let mode ='', domain ='', html='' , sendmailer=''
            if(isActivated){
                if(isActivated.status != "Active"){
                    let error = {}
                    mode = process.env.NODE_ENV;
                    domain = config.get(`${mode}.domain`);
                    //let id = resultUser.id
                    html = `Hi ${isActivated.first_name} ${isActivated.last_name} <br/><br/>Greeting from RatosApp ,<br/><br/>Your Account has been successfully created.`+
                        `Please <a href="${domain}/account-verification/${email}/${isActivated.id}" target="_blank">Click Here</a> for account verification.` +
                        `<br/><br/>Thank you <br/><br/>Ratos Support Team`
                    sendmailer = await sendMail(email , "Email verification - RatosApp" , html)
                    if(sendmailer){
                        error.message="Account already present , Verification is not done . Please check your email for Activation link."
                        return res.status(400).send(reqResponse.errorResponse(420, error));
                    }else{
                        error.message="Account Verification is not done . Please check your email for Activation link."
                        return res.status(400).send(reqResponse.errorResponse(420, error));
                    }
                }
            }
            let bucketName = company;
            bucketName = bucketName.toLowerCase()
            bucketName = bucketName.replace(/\s+/g, '-');
            await firebase.auth().createUserWithEmailAndPassword(
                email ,
                password
            ).then(async (data)=>{
                //1. create Organization
                let organization_details = {
                    id : uuidv4(),
                    first_name : first_name,
                    last_name : last_name ,
                    phone_number : phone_number,
                    org_name : company,
                    email :email,
                    enable_flag : true ,
                    is_voided : false ,
                    updated_at: moment().format('YYYY-MM-DD H:m:s'),
                    org_bucket : bucketName
                }
                var result = await organizationTbl.create(organization_details);
                let org_id_clone  = result.id
                
               
                //2 . create user with the organization id
                let user_details = {
                    id:uuidv4(),
                    user_id : data.user.toJSON().uid,
                    org_id : result.id,
                   // token : data.user.toJSON().stsTokenManager.accessToken,
                    email :email,
                    first_name : first_name,
                    last_name : last_name ,
                    phone_number : phone_number,
                    status : "Pending",
                    /*audit Columns*/
                    updated_at: moment().format('YYYY-MM-DD H:m:s'),
                    created_at: moment().format('YYYY-MM-DD H:m:s'),
                    is_voided : false,
                    is_delete:false,
                    enable_flag : true
                }

                var resultUser =  await accountuserTbl.create(user_details);
               

                /*Default create track and track lookup data*/
                await axios({
                    method: 'post',
                    url: 'https://us-central1-ratos-apps.cloudfunctions.net/track-work-flow/lookup-clone',
                    headers:{
                        org_id: result.id,
                        account_user_id: resultUser.id,
                    },
                        data: {}
                    }).then(response =>{

                    });
                /* Get track work flow default id */
                var track_work_flow_data =  await trackFlowTbl.findOne({
                                                where : {
                                                    org_id : result.id,
                                                    enable_flag : true
                                                },
                                                attributes: ['id', 'work_flow_name']
                                            });
                for( const element of fetchRoleBasedOrganization ) {
                    let role_id_default = uuidv4()
                    let role_aryy = {
                        id: role_id_default,
                        "name": element.name,
                        "role_code": element.role_code,
                        "description": element.description,
                        "is_admin": element.is_admin,
                        "enable_flag": true,
                        "org_id" : result.id,
                        "is_voided": false,
                        "is_default": true,
                        "is_common": false,
                        "createdAt": moment().format('YYYY-MM-DD H:m:s'),
                        "updatedAt": moment().format('YYYY-MM-DD H:m:s'),
                        "created_by": resultUser.id,
                        "updated_by": resultUser.id,
                        "track_work_flow_id": track_work_flow_data.id
                    }
                    let createRoleBasedOnOrganization = await role_tbl.create(role_aryy)
                    let rolebasedResource =  await resourceRoleTbl.findAll({
                        where: {
                            role_id :element.id,
                            is_common : true
                        }
                    });
                    let resource_role = []
                    rolebasedResource.forEach(element => {
                        resource_role.push({
                            id : uuidv4(),
                            org_id :result.id,
                            role_id : role_id_default,
                            resource_id : element.resource_id,
                            is_enable : element.is_enable ,
                            is_common : false
                        })
                    });
                    let resource_create = await resourceRoleTbl.bulkCreate(resource_role)
                }
                
                
                let roleCode = ["agency-admin","manager-edit"];
                let roleData =  await role_tbl.findAll({
                                where: {
                                    role_code : {
                                        [Op.in] : roleCode
                                    },
                                    org_id : result.id ,
                                    is_default : true
                                },
                                attributes : ['id','name'] ,
                                logging : console.log
                            });
                // create the role for the user as of now static Admin
                var length = roleData.length
                var i =0 ;
                while(i < length){
                    var create_userRole = {
                        id:uuidv4(),
                        account_user_id : resultUser.id,
                        org_id : result.id,
                        role_id : roleData[i].id,
                        updated_at: moment().format('YYYY-MM-DD H:m:s'),
                        created_at: moment().format('YYYY-MM-DD H:m:s'),
                        is_voided : false,
                        enable_flag : true
                    }
                    var createrole =  await user_role_tbl.create(create_userRole);
                    i++;
                }
                // let GetAllUsers = await accountuserTbl.findOne({ where: { id :  resultUser.id }, include: [{
                //     model : user_role_tbl,
                //     as : "user_role"
                // }]})
                // let output = {
                //     data ,
                //     "user_details" : GetAllUsers
                // }
                // return res.send(output);
                // var trackLength = trackStatus.length
                // var track =0;
                // while(track < trackLength){
                //     if (trackStatus[track] == 'Initial Contact') {
                //         var create_track_status = {
                //             id          : uuidv4(),
                //             org_id      : result.id,
                //             name        : trackStatus[track],
                //             track_code  : trackStatus[track],
                //             is_default  : true,
                //             updated_at  : moment().format('YYYY-MM-DD H:m:s'),
                //             created_at  : moment().format('YYYY-MM-DD H:m:s'),
                //             is_voided   : false,
                //             enable_flag : true
                //         }
                //     }else{
                //         var create_track_status = {
                //             id          : uuidv4(),
                //             org_id      : result.id,
                //             name        : trackStatus[track],
                //             track_code  : trackStatus[track],
                //             is_default  : false,
                //             updated_at  : moment().format('YYYY-MM-DD H:m:s'),
                //             created_at  : moment().format('YYYY-MM-DD H:m:s'),
                //             is_voided   : false,
                //             enable_flag : true
                //         }
                //     }

                //     var createTrackStatus =  await track_status_tbl.create(create_track_status);
                //     track++;
                // }

                 GetAllUsers = await accountuserTbl.findOne({ where: { id :  resultUser.id }, include: [{
                    model : user_role_tbl,
                    as : "user_role"
                }]})
                 output = {
                    data ,
                    "user_details" : GetAllUsers
                }
                mode = process.env.NODE_ENV;
                 domain = config.get(`${mode}.domain`);
                let id = resultUser.id
                 html = `Hi ${first_name} ${last_name} <br/><br/>Greeting from RatosApp ,<br/><br/>Your Account has been successfully created.`+
                    `Please <a href="${domain}/account-verification/${email}/${id}" target="_blank">Click Here</a> for account verification.` +
                    `<br/><br/>Thank you <br/><br/>Ratos Support Team`
                 sendmailer = await sendMail(email , "Email verification - RatosApp" , html)
                if(sendmailer){
                    /**Invoke createBucket() function */
                   /*  req.company = req.body.company
                    console.log('req.company', req.company); */
                  
                    await createBucket(company);
                    return res.status(200).send(reqResponse.sucessResponse(200, 'Account Created Successfully , Please Check your email for Activation ', output));
                }else{
                    return res.status(400).send({
                        "status" : false,
                        message: "Something went wrong . please try again"
                    })
                }
            })
            .catch(function(error) {
                return res.status(400).send(reqResponse.errorResponse(400,error));
            });
        } catch (error) {
            return res.status(400).send(reqResponse.errorResponse(400, error));
        }
    }
    /* Signin using Firebase ... and Authenticate */

    const Login = async (req , res) =>{
        const {email , password} = req.body;
        try {
            if(!email || !password){
                return res.status(400).send({
                    "status" : false,
                    error: "Fields are Mandatory"
                })
            }
            const is_exist = await accountuserTbl.findOne({
                where: {
                    email : email,
                    is_voided: true
                }
            });
            if (is_exist) {
                console.log("is_exist inside................")
                let error = {
                    error: "User Account are Deleted!"
                }
                return res.status(400).send(400,error);
            }else{
                console.log("else inside...................")
                await firebase.auth().signInWithEmailAndPassword(email, password)
                .then(async (data)=>{
                    /* verify status is pending or not */
                    console.log(data.user.toJSON().uid)
                    let GetAllUsers = await accountuserTbl.findOne({ where: { user_id :  data.user.toJSON().uid , status : "Active"},
                        include: [{
                            model : user_role_tbl,
                            as : "user_role" ,
                            attributes :  ['id','account_user_id' , 'role_id'],
                            include :[{
                                model : role_tbl ,
                                as : "role" ,
                                attributes :  ['id','name' , 'role_code']
                            }]
                        }, {
                            model : organizationTbl,
                            as : "organization" ,
                            attributes :  ['id','org_name' , 'org_bucket', 'logo']
                        }]
                    })
                    if(GetAllUsers){
                        console.log('user', GetAllUsers.id);
                        let userId = GetAllUsers.id
                        /**Clear Cache api trigger */
                        let url = config.get(`${mode}.clearCache`)
                        axios.post(url, {user_id : userId}).then(response =>{
                            console.log('Cleared Catch successfully');
                        })
                        let output = {
                            data ,
                            "user_details":GetAllUsers
                        }
                        return res.status(200).send(reqResponse.sucessResponse(200, 'login Success', output));
                    }else{
                        return res.status(400).send({
                            "status" : false,
                            error: "Email Verification Needed"
                        })
                   //     return res.status(400).send(reqResponse.errorResponse(400, "Email Verification Needed"));
                    }
                })
                .catch((error) => {
                    console.log('erro', error);
                    error.message = "Please check your username and password.";
                    return res.status(400).send(reqResponse.errorResponse(400, error));
                });
            }
        } catch (error) {
            return res.status(400).send(reqResponse.errorResponse(400, error));
        }
    }
    /* Signout using Firebase */
    const SignOut = async (req, res)=>{
        await firebase.auth().signOut().then((data) => {
            return res.status(200).send(reqResponse.sucessResponse(200, 'logged Out Successfully', data));
        }).catch((error)=> {
        return res.status(400).send(reqResponse.errorResponse(400, error.message));
        });
    }
    /* Forgot Password ... send a password reset email to a user   */
    const ForgotPassword = async (req , res)=>{
        const {email} = req.body
        try {
            if (!req.body) {
                return res.status(400).send(reqResponse.errorResponse(400, "Request body is not found"));
            }

            let isActivated = await accountuserTbl.findOne({
                where : { email : email}
            })
            if(isActivated){
                if(isActivated.status != "Active"){
                    let error = {}
                    let mode = process.env.NODE_ENV;
                    const domain = config.get(`${mode}.domain`);
                    //let id = resultUser.id
                    let html = `Hi ${isActivated.first_name} ${isActivated.last_name} <br/><br/>Greeting from RatosApp ,<br/><br/>Your Account has been successfully created.`+
                        `Please <a href="${domain}/account-verification/${email}/${isActivated.id}" target="_blank">Click Here</a> for account verification.` +
                        `<br/><br/>Thank you <br/><br/>Ratos Support Team`
                    let sendmailer = await sendMail(email , "Email verification - RatosApp" , html)
                    if(sendmailer){
                        error.message="Account Verification is not done . Please check your email for Activation link."
                        return res.status(400).send(reqResponse.errorResponse(420, error));
                    }else{
                        error.message="Account Verification is not done . Please check your email for Activation link."
                        return res.status(400).send(reqResponse.errorResponse(420, error));
                    }
                }
            }
            
            var auth = firebase.auth();
            await auth.sendPasswordResetEmail(email).then((data)=> {
                return res.status(200).send(reqResponse.sucessResponse(200, 'Email Sent successfully', data));
            }).catch((error)=> {
                return res.status(400).send(reqResponse.errorResponse(400, error));
            });
        } catch (error) {
            return res.status(400).send(reqResponse.errorResponse(400, error));
        }
    }
    /* Organization name is present or Not  */
    const OrgValidate = async (req , res) =>{
        try {
            if (!req.query) {
                return res.status(400).send(reqResponse.errorResponse(400, "Request body is not found"));
            }
            
            let email = req.query.email;
            let org_name = req.query.org_name;
            console.log("email" , email)
            if(org_name){
                let isExistOrganization = await organizationTbl.findOne({
                    where: { 
                        org_name : { [Op.like]: `%${org_name}%`} 
                    }
                })
                if(isExistOrganization){
                    return res.status(400).json({
                        status: false,
                        message: "Company Name with same name is already present.",
                    });
                }else{
                    return res.status(200).send(reqResponse.sucessResponse(200, 'Organization is Not found', "success"));
                }
            }else{




                let domain_arry = domainLlist.domain_list
                var respone = email.replace(" ", "+");
                console.log("email" , respone)
                let isExistEmail = await accountuserTbl.findOne({
                    where: { 
                        email : respone
                    }
                })

                let mode ='', domain ='', html='' , sendmailer=''
               
                const address = email.split('@').pop()
                if(domain_arry.includes(address)){
                    return res.status(400).json({
                        status: false,
                        message: "Please use official domain email id",
                    });
                }
                if(isExistEmail){
                    if(isExistEmail.status != "Active"){
                        let error = {}
                        mode = process.env.NODE_ENV;
                        domain = config.get(`${mode}.domain`);
                        //let id = resultUser.id
                        html = `Hi ${isExistEmail.first_name} ${isExistEmail.last_name} <br/><br/>Greeting from RatosApp ,<br/><br/>Your Account has been successfully created.`+
                            `Please <a href="${domain}/account-verification/${email}/${isExistEmail.id}" target="_blank">Click Here</a> for account verification.` +
                            `<br/><br/>Thank you <br/><br/>Ratos Support Team`
                        sendmailer = await sendMail(email , "Email verification - RatosApp" , html)
                        let message=''
                        if(sendmailer){
                            message="Account already present , Verification is not done . Please check your email for Activation link."
                            return res.status(400).json({
                                status: false,
                                message: message,
                            });
                        }else{
                            message="Account Verification is not done . Please check your email for Activation link."
                            return res.status(400).json({
                                status: false,
                                message: message,
                            });
                        }
                    }
                    return res.status(400).json({
                        status: false,
                        message: "Email ID is already present in the system.",
                    });
                }else{
                    return res.status(200).send(reqResponse.sucessResponse(200, 'Email is Not found', "success"));
                }
            }
            
        } catch (error) {
            return res.status(400).send(reqResponse.errorResponse(400, error));
        }
    }
    /* CREATE USER BASED ON THE ORGANIZATION ... */
    const createUser = async (req , res) =>{
        const {email , orgid , role_id , first_name, last_name,
                phone_number , dob , admin_id , designation , is_admin} = req.body
        try {
            if(!email || !orgid || role_id.length <= 0 || !admin_id){
                return res.status(400).json({
                    status: false,
                    message: "Mandatory fields are not present",
                });
            }
            let exists_not = await accountuserTbl.findOne({ where: { email : email , org_id : orgid}})
            if(exists_not){
                return res.status(400).json({
                    status: false,
                    message: "Account with this username is already present in the system",
                });
            }
            
            let user_details = {
                id:uuidv4(),
                user_id : "",
                org_id :orgid,
               // token : data.user.toJSON().stsTokenManager.accessToken,
                email :email,
                first_name : first_name,
                last_name : last_name ,
                phone_number : phone_number,
                status : "Pending",
                /*audit Columns*/
                updated_at: moment().format('YYYY-MM-DD H:m:s'),
                created_at: moment().format('YYYY-MM-DD H:m:s'),
                dob : dob,
                is_voided : false,
                is_delete:false,
                enable_flag : true ,
                designation : designation
            }
            var resultUser =  await accountuserTbl.create(user_details);
            // create the role for the user as of now static Admin
            var length = role_id.length
            var i =0 ;
            while(i < length){
                var create_userRole = {
                    id:uuidv4(),
                    account_user_id : resultUser.id,
                    org_id : orgid,
                    role_id : role_id[i],
                    updated_at: moment().format('YYYY-MM-DD H:m:s'),
                    created_at: moment().format('YYYY-MM-DD H:m:s'),
                    is_voided : false,
                    is_delete:false,
                    enable_flag : true
                }
                var createrole =  await user_role_tbl.create(create_userRole);
                i++;
            }
            if(is_admin){
                var create_userRole1 = {
                    id:uuidv4(),
                    account_user_id : resultUser.id,
                    org_id : orgid,
                    role_id : "a227cde3-862a-4b62-96cb-39c6c23febb7",
                    updated_at: moment().format('YYYY-MM-DD H:m:s'),
                    created_at: moment().format('YYYY-MM-DD H:m:s'),
                    is_voided : false,
                    is_delete:false,
                    enable_flag : true
                }
                var createrole1 =  await user_role_tbl.create(create_userRole1);
            }
           
            mode = process.env.NODE_ENV;

            const urlId   = config.get(`${mode}.domain`);
           /*  var actionCodeSettings = {
                url: urlId + '/user-set-password?email='+email+'&id='+resultUser.id ,
                handleCodeInApp: true
            };
     */
            const get_admin_details = await accountuserTbl.findOne({
                where : {id : admin_id }
            })

            const organization_details = await organizationTbl.findOne({
                where :{ id : orgid}
            })

            const domain = config.get(`${mode}.domain`);
            let html = `Hi ${first_name} ${last_name} <br/><br/>Greeting from RatosApp ,<br/><br/>${get_admin_details.first_name} has been requested you to join this organization <b>${organization_details.org_name}</b>.`+
                `Please <a href="${domain}/user-set-password/${email}/${resultUser.id}" target="_blank">Click Here</a> for account activation.` +
                `<br/><br/>Thank you <br/><br/>Ratos Support Team`
            let sendmailer = await sendMail(email , "Account Creation Request - RatosApp" , html)
            
            if(sendmailer){
                let GetAllUsers = await accountuserTbl.findOne({ where: { id : resultUser.id}, include: [{
                    model : user_role_tbl,
                    as : "user_role"
                }]})
                let output = {
                    "user_details":GetAllUsers
                }
                return res.status(200).send(reqResponse.sucessResponse(200, 'Activation email has been sent to User ', output));
            }else{
                return res.status(400).json({
                    status: false,
                    error: "Mail sending is failed . Please request again",
                });
            }
            /* firebase.auth().sendSignInLinkToEmail(email, actionCodeSettings)
            .then(async(data)=> {
                let GetAllUsers = await accountuserTbl.findOne({ where: { id : resultUser.id}, include: [{
                    model : user_role_tbl,
                    as : "user_role"
                }]})
                let output = {
                    data ,
                    "user_details":GetAllUsers
                }

                return res.status(200).send(reqResponse.sucessResponse(200, 'Activation email has been sent to User ', output));
            })
            .catch(function(error) {
                return res.status(400).send(reqResponse.errorResponse(400, error));
                // Some error occurred, you can inspect the code: error.code
            }); */
        } catch (error) {
            return res.status(400).send(reqResponse.errorResponse(400, error));
        }
    }
    /* EDIT USER BASED ON THE ORGANIZATION  */
    const editUser =async (req , res)=>{
        const {email , first_name,last_name, role_id , orgid , dob , phone_number , deletedid ,designation} = req.body;
        const id = req.params.id;
        try {
            if(!id || !email || role_id.length <= 0 || !orgid){
                return res.status(400).json({
                    status: false,
                    message: "Mandatory fields are not present",
                });
            }
            let checkUser = await accountuserTbl.findOne({
                where :{ id : id , org_id :orgid}
            })

            if(!checkUser){
                return res.status(400).json({
                    status: false,
                    message: "Id is not present",
                });
            }
            let data = {
                first_name : first_name,
                last_name : last_name,
                phone_number : phone_number,
                dob : dob ,
                designation : designation
            }
            let update_data = await accountuserTbl.update(data,{
                where : { id : id  , org_id :orgid}
            })

            let destroyRole = await user_role_tbl.destroy({
                where : {account_user_id :id , org_id :orgid}
            })
            var length = role_id.length
            var i =0 ;
            while(i < length){
                var create_userRole = {
                    id:uuidv4(),
                    account_user_id :id,
                    org_id : orgid,
                    role_id : role_id[i],
                    updated_at: moment().format('YYYY-MM-DD H:m:s'),
                    created_at: moment().format('YYYY-MM-DD H:m:s'),
                    is_voided : false,
                    is_delete:false,
                    enable_flag : true
                }
                var createrole =  await user_role_tbl.create(create_userRole);
                i++;
            }
            var deleteid_length = deletedid.length;
            if(deleteid_length > 0){
                var k = 0 ;
                while(k < deleteid_length){
                    let deleteFileUpload  = await file_upload_tbl.update({
                       is_voided : true 
                    }, {where : { id : deletedid[k]}})
                    k++;
                }
            }
            
            let GetAllUsers = await accountuserTbl.findOne({ where: { id : id }, include: [{
                model : user_role_tbl,
                as : "user_role" 
            }]})
            return res.status(200).send(reqResponse.sucessResponse(200, 'Edited user successfully', GetAllUsers));
           // return res.status(200).send(reqResponse.sucessResponse(200, 'Edited user successfully', update_data));
        } catch (error) {
            return res.status(400).send(reqResponse.errorResponse(400, error));
        }
    }
    /* SOFT DELETE THE USER BASED ON THE ORGANZIATION  */
    const deleteUser = async (req , res)=>{
        const id = req.params.id;
        try {
            if(!id){
                return res.status(400).json({
                    status: false,
                    message: "Mandatory fields are not present",
                });
            }
            /**Disable the User in Firebase with user_id */
            if(req.query.user_id != undefined){
                console.log('with firebase uid');
                await admin.auth().updateUser(req.query.user_id, {
                    disabled: true
                })
                .then(async()=>{
                    console.log('User got deleted');
                    await accountuserTbl.update({
                        enable_flag : false ,
                        is_voided: true,
                        is_delete:true
                    },{
                        where :{ id : req.params.id}
                    }).then(()=>{
                        return res.status(200).send(reqResponse.sucessResponse(200, 'Deleted user successfully', deleteUser));
                    }).catch((error)=>{
                        console.log('error in deleting account_user_id', error);
                        return res.status(400).send(reqResponse.errorResponse(400, error));
                    })
                })
                .catch((error)=>{
                    console.log('Error Deleting user: ', error);
                })
            }
            else{
                console.log('without firebase user_id');
                /**Delete the User if Firebase(user_id) is empty*/
                let deleteUser = await accountuserTbl.update({
                    enable_flag : false ,
                    is_voided: true,
                    is_delete:true
                },{
                    where :{ id : id}
                })
                if(!deleteUser){
                    return res.status(400).json({
                        status: false,
                        message: "Id is not present",
                    });
                }
                return res.status(200).send(reqResponse.sucessResponse(200, 'Deleted user successfully', deleteUser));
            }
           
        } catch (error) {
            return res.status(400).send(reqResponse.errorResponse(400, error));
        } 
    }
    /* LIST THE USER BASED ON THE ORGANIZATION */
    const viewUser = async(req , res )=>{
        let condition = {};
        const orgid = req.params.id 
        //console.log("middleware-request" , req.headers)
        if(req.query.is_active_user == "true"){
            console.log("Active_user and Pending_user...................")
            condition.is_voided = false;
            condition.org_id = orgid;
        }else if (req.query.is_job_active_user == "true") {
            console.log("Active_user...................")
            condition.is_voided = false;
            condition.status = "Active";
            condition.org_id = orgid;
        } else{
            console.log("Deleted_user.................")
            condition.is_voided = true;
            condition.org_id = orgid;
        }


     
        
        try {
            if(!orgid){
                return res.status(400).json({
                    status: false,
                    message: "Mandatory fields are not present",
                });
            }
            /* if(req.query.q){
                condition = { [Op.or]: [
                        {
                            label_entry : {
                                [Op.like]: '%' + req.query.q + '%'
                            }
                        }
                    ]
                };
            } */

            let findData = {};
            if(req.query.sortField){
                let splitSort = req.query.sortField.split('.');
                if(splitSort.length >1){
                    findData.order = [[splitSort[0].trim(), splitSort[1].trim(), req.query.direction]];
                } else {
                    findData.order = [[req.query.sortField, req.query.direction]];
                }
            }
           
            
            findData.include = [{
                model : user_role_tbl,
                as : "user_role" ,
                attributes :  ['id','account_user_id' , 'role_id'],
                include :[{
                    model : role_tbl ,
                    as : "role" ,
                    attributes :  ['id','name' , 'role_code']
                }]
            }]
            findData.where = condition;
            let GetAllUserscount = await accountuserTbl.findAll(findData ,{logging :console.log})
            let totalCount = GetAllUserscount ? GetAllUserscount.length : 0
            let page, pageSize
            page = req.query.page ? req.query.page : 1;
            pageSize = req.query.pageSize ? req.query.pageSize : 10
            let limit = pageSize
            let pageNumber = page
            let offset = pageNumber ? (pageNumber-1) * limit : 0
            
            if(req.query.page){
                findData.offset = offset;
            }
            if(req.query.pageSize){
                findData.limit = limit;
            }
           
            let GetAllUsers = await accountuserTbl.findAll(findData)
            if(!GetAllUsers){
                return res.status(400).json({
                    status: false,
                    message: "User's are not found in organization",
                });
            }
            let obj = {
                totalCount , 
                data : GetAllUsers
            }
            return res.status(200).send(reqResponse.sucessResponse(200, 'List of Users', obj));
        } catch (error) {
            return res.status(400).send(reqResponse.errorResponse(400, error));
        }
    }
    /* GET PARTICULAR USER BASED ON THE ORGANIZATION  */
    const getUser = async(req , res)=>{
        const id = req.params.id;
        let is_admin = false;
        try {
            if(!id){
                return res.status(400).json({
                    status: false,
                    message: "Mandatory fields are not present",
                });
            }
            let GetAllUsers = await accountuserTbl.findOne({ where: { id : id }, 
                include: [{
                    model : user_role_tbl,
                    as : "user_role" ,
                    attributes :  ['id','account_user_id' , 'role_id'],
                    include :[{
                        model : role_tbl ,
                        as : "role" ,
                        attributes :  ['id','name' , 'role_code']
                    }]
                }]
            }).then((result) => {
                result.is_key = ((result.user_role.filter(fields => fields.role.role_code == 'agency_admin').length) > 0)?true: false
                return result;
            })
            let fileUpload = await file_upload_tbl.findAll({
                where :{
                    fk_id : req.params.id
                },
                logging: console.log
            })
            if(!GetAllUsers){
                return res.status(400).json({
                    status: false,
                    message: "User are not found",
                });
            }
            if (GetAllUsers.is_key) {
                is_admin = true
            }
            let data = {
                fileUpload,
                GetAllUsers,
                is_admin
            }
            return res.status(200).send(reqResponse.sucessResponse(200, 'Get Particular User', data));
        } catch (error) {
            console.log('error', error);
            return res.status(400).send(reqResponse.errorResponse(400, error));
        }
    }
    /* CONFIRM THE URL OF THE USER BASED ON THE PASSWORD-LESS SIGNUP */
    const verifySignin = async (req , res)=>{
        const { data , email , password , id} = req.body;
        try {
            if(!email || !password  || !id){
                return res.status(400).json({
                    status: false,
                    message: "Mandatory fields are not present",
                });
            }

            let id_check = await accountuserTbl.findOne({
                where : {id : id }
            })
            if(id_check){
                await firebase.auth().createUserWithEmailAndPassword(
                    email ,
                    password
                ).then(async (data)=>{
                    let updatUser = await accountuserTbl.update({
                        user_id : data.user.toJSON().uid,
                        status : "Active"
                    },{
                        where :{ id : id}
                    })
                    
                    let GetAllUsers = await accountuserTbl.findOne({ where: { id :  id }, include: [{
                        model : user_role_tbl,
                        as : "user_role"
                    }]})
                    let output = {
                        data ,
                        "user_details" : GetAllUsers
                    }
                    return res.status(200).send(reqResponse.sucessResponse(200, 'Account Created Successfully ', output));
                    
                }).catch((error)=>{
                    console.log('err', error);
                    return res.status(400).send(reqResponse.errorResponse(400, error));
                })
            }else{
                return res.status(400).json({
                    status: false,
                    error: "Account is not present",
                });
            }
            // Confirm the link is a sign-in with email link.
            /* if (firebase.auth().isSignInWithEmailLink(data)) {
                firebase.auth().signInWithEmailLink(email, data)
                .then(async (result) =>{
                    var user = firebase.auth().currentUser;
                    user.updatePassword(password).then( async (data) =>{
                        //console.log("data", data)
                        let updatUser = await accountuserTbl.update({
                            user_id : result.user.toJSON().uid,
                            status : "Active"
                        },{
                            where :{ id : id}
                        })

                        let GetAllUsers = await accountuserTbl.findOne({ where: { id :  id }, include: [{
                            model : user_role_tbl,
                            as : "user_role"
                        }]})
                        let output = {
                            data ,
                            "user_details" : GetAllUsers
                        }
                        return res.status(200).send(reqResponse.sucessResponse(200, 'Account Created Successfully ', output));
                        //return res.status(200).send(reqResponse.sucessResponse(200, 'created user successfully', result));
                    }).catch(function(error) {
                        return res.status(400).send(reqResponse.errorResponse(400, error));
                    });
                    
                })
                .catch(function(error) {
                    return res.status(400).send(reqResponse.errorResponse(400, error));
                });
            } */
        } catch (error) {
            console.log('error', error);
            return res.status(400).send(reqResponse.errorResponse(400, error));
        }
    }
    /* Update password from forgot password Link */
    const updatepassword = async (req , res)=>{
        const {email , password} = req.body;
        try {
            if(!email || !password){
                return res.status(400).json({
                    status: false,
                    message: "Mandatory fields are not present",
                });
            }
            var user = firebase.auth().currentUser;
            user.updatePassword(password).then(function(data) {
                // Update successful.
                return res.status(200).send(reqResponse.sucessResponse(200, 'Password Updated Successfully', data));
            }).catch(function(error) {
                return res.status(400).send(reqResponse.errorResponse(400, error));
            });

        } catch (error) {
            return res.status(400).send(reqResponse.errorResponse(400, error));
        }
    }
    /* Verify the token  */
    const authorize = async(req , res) =>{
        const { token } = req.body
        try {
            if(!token){
                
                return res.status(400).json({
                    status: false,
                    message: "Authorization Failed",
                });
            }
            
            admin
            .auth()
            .verifyIdToken(token)
            .then(async(decodedToken) => {
                const uid = decodedToken.uid;
                let GetAllUsers = await accountuserTbl.findOne({ 
                    where: { user_id :  uid }, include: [{
                        model : user_role_tbl,
                        as : "user_role"
                    },{
                        model : organizationTbl,
                        as : "organization",
                        attributes :["id","org_name"]
                    }]
                })
                let output = {
                    "user_details" : GetAllUsers
                }
               
                
                return res.status(200).send({
                    "status" : true,
                    message: "success",
                    data : output
                })
            })
            .catch((error) => {
                return res.status(400).send({
                    "status" : false,
                    message: "Authorization Failed"
                })
            })
            
        } catch (error) {
            return res.status(400).send({
                "status" : false,
                message: "Authorization Failed"
            })
        }
    }
    /* confirmation of the mail */
    const confirmAccount = async (req , res)=>{
        const id = req.params.id;
        try {
            if( !id ){
                return res.status(400).json({
                    status: false,
                    message: "Mandatory fields are not present",
                });
            }
            let findAccount = await accountuserTbl.findOne({
                where : {id : id}
            })
            if(!findAccount){
                return res.status(400).json({
                    status: false,
                    message: "Account Not Exists",
                });
            }
            let verify_account = await accountuserTbl.update({
                status : "Active"
            }, {where : { id : id } })
            return res.status(200).send(reqResponse.sucessResponse(200, 'Account Verified Successfully', verify_account));
            
        } catch (error) {
            return res.status(400).send(reqResponse.errorResponse(400, error));
        }
    }
    /* const mailer data */
    const mailer = async (req , res)=>{
        const {email , first_name , last_name} = req.body;
        let mode = process.env.NODE_ENV;
        /* const domain = config.get(`${mode}.domain`);
        let id = "454654"
        let html = `Hi ${first_name} ${last_name} <br/><br/>Greeting from RatosApp ,<br/><br/>Your Account has been successfully created.`+
            `Please <a href="${domain}/account-verification/${email}/${id}" target="_blank">Click Here</a> for account verification.` +
            `<br/><br/>Thank you <br/><br/>Ratos Support Team`
        let sendmailer = await sendMail(email , "Email verification - RatosApp" , html)
        res.send(sendmailer) */


            const urlId   = config.get(`${mode}.domain`);
            var actionCodeSettings = {
                url: urlId + '/user-set-password?email='+email+'&id=65464654' ,
                handleCodeInApp: true
            };
    
            firebase.auth().sendSignInLinkToEmail(email, actionCodeSettings)
            .then(async(data)=> {
                return res.status(200).send(reqResponse.sucessResponse(200, 'Account Verified Successfully', data));
            }).catch((err) =>{
                return res.status(400).send(reqResponse.errorResponse(400, error));
            })
    }
    /* Confirm password */
    const verifyPassword = async (req , res)=>{
        const {code, password} = req.body
        try {
            if(!code || !password){
                return res.status(400).json({
                    status: false,
                    message: "Mandatory fields are not present",
                });
            }
            await firebase.auth().confirmPasswordReset(code, password)
                .then(function(data) {
                // Success
                return res.status(200).send(reqResponse.sucessResponse(200, 'Password updated Successfully', data));
                })
                .catch(function(error) {
                // Invalid code
                return res.status(400).send(reqResponse.errorResponse(400, error));
            })
        } catch (error) {
            return res.status(400).send(reqResponse.errorResponse(400, error));
        }
    }
    /* CREATION OF THE BUCKET IN GCP CALLED IN THE REGISTRATION API */
    async function createBucket(company){
        try{

           // console.log(req.body);
            let bucketName = company;
            bucketName = bucketName.toLowerCase()
            bucketName = bucketName.replace(/\s+/g, '-');
            console.log(bucketName)
            const data =await storage.createBucket(bucketName);
            //console.log(`Bucket ${bucketName} created.`);
           // return res.status(200).send(reqResponse.sucessResponse(200, 'Storage bucket Created', data))
        }
        catch(error){
            console.log(error);
           // return res.status(400).send(reqResponse.errorResponse(400, error));
        }
    }

    /**Recruiter Portal Services */
    const createPortalForUser = async (req, res) => {
        try {
                const portalData = req.body;

                if(!portalData.account_user_id || !portalData.lookup_value_id || !portalData.limit){
                    return res.status(400).send({
                        "status" : false,
                        message: "Fields are Mandatory"
                    })
                }

                //Check for duplication of Role Name
                const is_exist = await portal_user_tbl.findOne({
                    where: {
                      account_user_id: portalData.account_user_id,
                      lookup_value_id: portalData.lookup_value_id
                    }
                });
                if (is_exist) {
                    return res.status(400).json({
                      status: false,
                      message: "Duplication of Portal Data Not Allowed!",
                    });
                }
                else{
                    portalData.id = uuidv4();
                    /*audit Columns*/
                    portalData.created_at  = moment().format('YYYY-MM-DD H:m:s');
                    portalData.is_voided   = false;
                    portalData.enable_flag = true;

                    /*Creat New Role Data*/
                    var result =  await portal_user_tbl.create(portalData);
                    res.status(200).send(reqResponse.sucessResponse(200, 'Portal Created for User', result));
                } 
        } catch (error) {
            res.status(400).send(reqResponse.errorResponse(400, error));
        }
    };

    const getportalofUser = async (req, res) => {
        try {
            let {
                account_user_id
            } = req.query;
            let newDate = moment().format('YYYY-MM-DD')
            let result = await portal_user_tbl.findAll({
                where: {
                    account_user_id
                },
                include: [{
                    model: lookupValueTbl,
                    as: 'lookup_value',
                    attributes: ['id', 'lookup_value']
                }, ],
            });
            console.log('portal assigned to user', result);
            if(result.length == 0){
                return res.status(404).send({
                    "status" : false,
                    message: "Portals Not Assigned to User"
                })
            }
            else{
                /**Response needs to pass to resume_view_log table for getting count */
                
                let resultArray = []
                result.forEach(async (val, key) =>{
                    let response = {};
                    //console.log('val', val);
                    response.portalName = val.dataValues.lookup_value.lookup_value;
                    response.lookup_value_id = val.dataValues.lookup_value.id;
                    response.limit = val.dataValues.limit;
                    response.is_checked = true

                    // console.log(response.portalName);
                    // console.log(response.limit);
                    console.log("select count(*) from resume_view_log where account_user_id='" + req.query.account_user_id + "' and lookup_id ='" + response.lookup_value_id + "' and DATE(date_seen)='" + newDate+"'");
                    let seenCount = await modalMap.sequelize.query("select count(*) from resume_view_log where account_user_id='" + req.query.account_user_id + "' and lookup_id ='" + response.lookup_value_id + "' and DATE(date_seen)='" + newDate+"'").then((resultant)=>{
                        console.log('resultant', resultant[0]);
                        response.remaining = (val.dataValues.limit-resultant[0][0].count);
                        resultArray.push(response)

                        if(Object.is(result.length - 1, key) ){

                            //console.log(key);
                            return  res.status(200).send(reqResponse.sucessResponse(200, 'Saved Search List', resultArray));
        
                        }
                    })
                })
            } 
        } catch (error) {
            console.log('Main Catch Error', error);
            res.status(400).send(reqResponse.errorResponse(400, error));
        }
    }

    const saveUserSearch = async (req, res) => {
        try {
            const {account_user_id, org_id} = req.headers;
            const searchData = req.body;
            if(!searchData.search_options.must_have_keywords){
                return res.status(404).send({
                    "status" : false,
                    message: "Fields are Mandatory"
                })
            }
            const isExist = await searchLogTbl.findOne({
                where:{
                    saved_search_name: searchData.saved_search_name,
                    account_user_id : searchData.account_user_id,
                    org_id : searchData.org_id
                }
            })
            console.log('isExist', isExist);
            if(isExist){
                return res.status(404).send({
                    "status": false,
                    message: "Saved Name already Exist! Please try another name"
                })
            }
            else{
                searchData.id = uuidv4();
                searchData.is_saved = true
                /*audit Columns*/
                searchData.created_at  = moment().format('YYYY-MM-DD H:m:s');
                searchData.is_voided   = false;
                searchData.enable_flag = true;
                searchData.created_by = searchData.account_user_id
                searchData.modified_by = searchData.account_user_id
                searchData.recent_search_name = searchData.search_options.must_have_keywords

                /*Creat New Role Data*/
                var result =  await searchLogTbl.create(searchData);
                console.log('result of saved search', result);
                res.status(200).send(reqResponse.sucessResponse(200, 'Save Search Result of User', result));
            }
        } 
        catch (error) {
            console.log('Main Catch Error', error);
            res.status(400).send(reqResponse.errorResponse(400, error));
        }
    };

    const getSavedSearchOfUser = async(req, res)=>{
        try {
            let {account_user_id, org_id} = req.headers;
            // let result = await searchLogTbl.findAll({
            //         where: {
            //             account_user_id,
            //             org_id,
            //             is_saved: true,
            //             is_voided: false
            //         },
            //         limit: 10,
            //         order: [
            //             ['createdAt', 'DESC'],
            //         ],
            // });
            let [result, metaData] = await modalMap.sequelize.query("select DISTINCT saved_search_name, search_options, created_at from search_log where account_user_id='" + req.headers.account_user_id + "' and org_id ='" + req.headers.org_id + "' and is_saved = true and is_voided = false and saved_search_name != '' order by created_at desc limit 10 ")
            if(result.length > 0){
                res.status(200).send(reqResponse.sucessResponse(200, 'Saved Search List', result));
            }else{
                return res.status(404).send({status: false,message: "Saved Search List Not found"});
            }
        } catch (error) {
            res.status(400).send(reqResponse.errorResponse(400, error));
        }
    }

    const getRecentSearchOfUser = async(req, res)=>{
        try {
            let {account_user_id, org_id} = req.headers;
            // let result1 = await searchLogTbl.findAll({
            //         where: {
            //             account_user_id,
            //             org_id,
            //         },
            //         //attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('search_options')), 'search_options']],
            //         limit: 10,
            //         order: [
            //             ['createdAt', 'DESC'],
            //         ],
            //         logging: console.log
            // });
            let [result1, metaData] = await modalMap.sequelize.query("select DISTINCT recent_search_name, search_options, created_at from search_log where account_user_id='" + req.headers.account_user_id + "' and org_id ='" + req.headers.org_id + "' and recent_search_name != '' order by created_at  desc limit 10 ")
            console.log(req.headers.org_id);
            console.log(result1);
            if(result1.length > 0){
                res.status(200).send(reqResponse.sucessResponse(200, 'Recent Search List', result1));
            }else{
                return res.status(404).send({status: false,message: "No recent search found"});
            }
        } catch (error) {
            res.status(400).send(reqResponse.errorResponse(400, error));
        }
    }
    const deleteUserSearch = async(req, res)=>{
        try{
            let {id} = req.params;
            const removeSavedSearch = await searchLogTbl.findOne({
                where: {
                    id,
                    is_voided:false
                },
            });
            if(!removeSavedSearch){
                return res.status(400).send({status: false,message: "Saved Search Not found"});
            }else{
                let deletedField = await searchLogTbl.update(
                    { is_voided: true },
                    {
                        where: { id: id },
                    }
                );
                res.status(200).send(reqResponse.sucessResponse(200, 'Saved Search Deleted', deletedField)); 
            }
        }
        catch (error) {
            res.status(400).send(reqResponse.errorResponse(400, error));
        }
    }
    /**test */
    // const searchHere = async(req, res)=>{
    //     try{
    //         var result = { profiles: [ { first_name: "Vikram", last_name: "Vedachalam", designation: "Database Admin", location: "New York", work_authorization: "H1B", time_zone: "America/New_York", employment_type: "Permanent", experience: "8years", education: "Bachelor in technology", salary: "10000", company_name: "Accenture", willing_to_relocate: true, language: "English", security_clearance: "Military", notice_period: "immediately", last_updated: "7 Days Ago", last_viewed: "7 Days Ago", portal: "Internaldb", skills: ["sql", "sqlserver"] }, { first_name: "Arun", last_name: "Shesha", designation: "Devops Engineer", location: "New York", work_authorization: "H1B", time_zone: "America/New_York", employment_type: "Permanent", experience: "8years", education: "Bachelor in technology", salary: "10000", company_name: "Accenture", willing_to_relocate: true, language: "English", security_clearance: "Military", notice_period: "immediately", last_updated: "7 Days Ago", last_viewed: "7 Days Ago", portal: "Internaldb", skills: ["devops", "linux"] }, { first_name: "Johnny", last_name: "Vedachal", designation: "Database Admin", location: "New York", work_authorization: "H1B", time_zone: "America/New_York", employment_type: "Permanent", experience: "8years", education: "Bachelor in technology", salary: "10000", company_name: "Accenture", willing_to_relocate: true, language: "English", security_clearance: "Military", notice_period: "immediately", last_updated: "7 Days Ago", last_viewed: "7 Days Ago", portal: "Internaldb", skills: ["sql", "sqlserver"] }, { first_name: "Vel", last_name: "Ram", designation: "Software Developer", location: "New York", work_authorization: "H1B", time_zone: "America/New_York", employment_type: "Permanent", experience: "8years", education: "bachelor in technology", salary: "10000", company_name: "accenture", willing_to_relocate: true, language: "english", security_clearance: "military", notice_period: "immediately", last_updated: "7 Days Ago", last_viewed: "7 Days Ago", portal: "Monster", skills: ["java", "eclipse"] }, { first_name: "Iliyas", last_name: "Mohammed", designation: "Nodejs Developer", location: "Los Angeles", work_authorization: "H1B", time_zone: "America/New_York", employment_type: "Permanent", experience: "5years", education: "bachelor in technology", salary: "100000", company_name: "accenture", willing_to_relocate: true, language: "english", security_clearance: "military", notice_period: "immediately", last_updated: "7 Days Ago", last_viewed: "7 Days Ago", portal: "Dice", skills: ["nodejs", "expressjs"] }, { first_name: "Sreepal", last_name: "Sree", designation: "Angularjs Developer", location: "Los Angeles", work_authorization: "H1B", time_zone: "America/New_York", employment_type: "Permanent", experience: "5years", education: "bachelor in technology", salary: "100000", company_name: "TCS", willing_to_relocate: true, language: "english", security_clearance: "military", notice_period: "immediately", last_updated: "7 Days Ago", last_viewed: "7 Days Ago", portal: "Dice", skills: ["angularjs", "reactjs"] }, { first_name: "Meganathan", last_name: "Sekhar", designation: "Angularjs Developer", location: "New York", work_authorization: "H1B", time_zone: "America/New_York", employment_type: "Permanent", experience: "5years", education: "bachelor in technology", salary: "100000", company_name: "TCS", willing_to_relocate: true, language: "english", security_clearance: "military", notice_period: "immediately", last_updated: "7 Days Ago", last_viewed: "7 Days Ago", portal: "Dice", skills: ["angularjs", "reactjs"] }, { first_name: "Ragav", last_name: "Sekhar", designation: "Python Developer", location: "New York", work_authorization: "H1B", time_zone: "America/New_York", employment_type: "Permanent", experience: "5years", education: "bachelor in technology", salary: "100000", company_name: "TCS", willing_to_relocate: true, language: "english", security_clearance: "military", notice_period: "immediately", last_updated: "7 Days Ago", last_viewed: "7 Days Ago", portal: "Dice", skills: ["python", "reactjs"] }, { first_name: "Vengatesh", last_name: "s", designation: "Full Stack Developer", location: "New York", work_authorization: "H1B", time_zone: "America/New_York", employment_type: "Permanent", experience: "5years", education: "bachelor in technology", salary: "100000", company_name: "TCS", willing_to_relocate: true, language: "english", security_clearance: "military", notice_period: "immediately", last_updated: "7 Days Ago", last_viewed: "7 Days Ago", portal: "Dice", skills: ["reactjs", "nodejs"] }, { first_name: "Vengatesh", last_name: "s", designation: "Full Stack Developer", location: "New York", work_authorization: "H1B", time_zone: "America/New_York", employment_type: "Permanent", experience: "5years", education: "bachelor in technology", salary: "100000", company_name: "TCS", willing_to_relocate: true, language: "english", security_clearance: "military", notice_period: "immediately", last_updated: "7 Days Ago", last_viewed: "7 Days Ago", portal: "Dice", skills: ["reactjs", "nodejs"] } ] }
    //         let payload = req.body;

    //         payload.id = uuidv4();
    //             /*audit Columns*/
    //             payload.createdAt  = moment().format('YYYY-MM-DD H:m:s');
    //             payload.updatedAt  = moment().format('YYYY-MM-DD H:m:s');
    //             payload.is_voided   = false;
    //             payload.enable_flag = true;
    //             payload.recent_search_name = payload.search_options.must_have_keywords

    //             let recentSearchId =  await searchLogTbl.create(payload);

            
    //         function getUsers(filters) {
    //             return result.profiles.filter(function (o) {
    //                 return Object.keys(filters).every(function (k) {
    //                     console.log(k);
    //                     console.log(o[k]);
    //                     return o[k].split(',').some(function (v) {
    //                         console.log('v', v);
    //                         console.log('filter[k]', filters[k]);
    //                         return v === filters[k];
    //                     });
    //                 });
    //             });
    //             //.map(function (o) {
    //             //    return o.title;
    //             //});
    //         }
    //         //o => loop
    //         //k => key(database admin)
    //         //o[k]=> loop(key)
    //         const keyword = payload.search_options;
    //         // return res.status(200).send({status: true,message: "List", data: result, recentSearchId: recentSearchId, payload: payload});
    //         let foundResult = getUsers({designation: keyword.designation, location: keyword.location, time_zone:keyword.time_zone});
    //         console.log(foundResult);
    //         res.status(200).send(reqResponse.sucessResponse(200, foundResult, payload, recentSearchId ))
    //     }
    //     catch (error) {
    //         res.status(400).send(reqResponse.errorResponse(400, error));
    //     }
    // }



    const searchHere = async(req, res)=>{
            function getMatchJson(searchField){
                var data = [{ first_name: "Vikram", last_name: "Vedachalam", designation: "Network Engineer", location: "Chennai", work_authorization: "H1B", time_zone: "India/Chennai", employment_type: "Permanent", experience: "8years", education: "Bachelor in technology", salary: "10000", company_name: "Accenture", willing_to_relocate: true, language: "English", security_clearance: "Military", notice_period: "immediately", last_updated: "7 Days Ago", last_viewed: "7 Days Ago", portal: "Internaldb", skills: ["sql", "sqlserver"] }, { first_name: "Arun", last_name: "Shesha", designation: "Devops Engineer", location: "New York", work_authorization: "H1B", time_zone: "America/New_York", employment_type: "Permanent", experience: "8years", education: "Bachelor in technology", salary: "10000", company_name: "Accenture", willing_to_relocate: true, language: "English", security_clearance: "Military", notice_period: "immediately", last_updated: "7 Days Ago", last_viewed: "7 Days Ago", portal: "Internaldb", skills: ["devops", "linux"] }, { first_name: "Johnny", last_name: "Vedachal", designation: "Database Admin", location: "New York", work_authorization: "H1B", time_zone: "America/New_York", employment_type: "Permanent", experience: "8years", education: "Bachelor in technology", salary: "10000", company_name: "Accenture", willing_to_relocate: true, language: "English", security_clearance: "Military", notice_period: "immediately", last_updated: "7 Days Ago", last_viewed: "7 Days Ago", portal: "Internaldb", skills: ["sql", "sqlserver"] }, { first_name: "Vel", last_name: "Ram", designation: "Software Developer", location: "New York", work_authorization: "H1B", time_zone: "America/New_York", employment_type: "Permanent", experience: "8years", education: "bachelor in technology", salary: "10000", company_name: "accenture", willing_to_relocate: true, language: "english", security_clearance: "military", notice_period: "immediately", last_updated: "7 Days Ago", last_viewed: "7 Days Ago", portal: "Monster", skills: ["java", "eclipse"] }, { first_name: "Iliyas", last_name: "Mohammed", designation: "Nodejs Developer", location: "Los Angeles", work_authorization: "H1B", time_zone: "America/New_York", employment_type: "Permanent", experience: "5years", education: "bachelor in technology", salary: "100000", company_name: "accenture", willing_to_relocate: true, language: "english", security_clearance: "military", notice_period: "immediately", last_updated: "7 Days Ago", last_viewed: "7 Days Ago", portal: "Dice", skills: ["nodejs", "expressjs"] }, { first_name: "Sreepal", last_name: "Sree", designation: "Angularjs Developer", location: "Los Angeles", work_authorization: "H1B", time_zone: "America/New_York", employment_type: "Permanent", experience: "5years", education: "bachelor in technology", salary: "100000", company_name: "TCS", willing_to_relocate: true, language: "english", security_clearance: "military", notice_period: "immediately", last_updated: "7 Days Ago", last_viewed: "7 Days Ago", portal: "Dice", skills: ["angularjs", "reactjs"] }, { first_name: "Meganathan", last_name: "Sekhar", designation: "Angularjs Developer", location: "New York", work_authorization: "H1B", time_zone: "America/New_York", employment_type: "Permanent", experience: "5years", education: "bachelor in technology", salary: "100000", company_name: "TCS", willing_to_relocate: true, language: "english", security_clearance: "military", notice_period: "immediately", last_updated: "7 Days Ago", last_viewed: "7 Days Ago", portal: "Dice", skills: ["angularjs", "reactjs"] }, { first_name: "Ragav", last_name: "Sekhar", designation: "Python Developer", location: "New York", work_authorization: "H1B", time_zone: "America/New_York", employment_type: "Permanent", experience: "5years", education: "bachelor in technology", salary: "100000", company_name: "TCS", willing_to_relocate: true, language: "english", security_clearance: "military", notice_period: "immediately", last_updated: "7 Days Ago", last_viewed: "7 Days Ago", portal: "Dice", skills: ["python", "reactjs"] }, { first_name: "Vengatesh", last_name: "s", designation: "Full Stack Developer", location: "New York", work_authorization: "H1B", time_zone: "America/New_York", employment_type: "Permanent", experience: "5years", education: "bachelor in technology", salary: "100000", company_name: "TCS", willing_to_relocate: true, language: "english", security_clearance: "military", notice_period: "immediately", last_updated: "7 Days Ago", last_viewed: "7 Days Ago", portal: "Dice", skills: ["reactjs", "nodejs"] }, { first_name: "Vengatesh", last_name: "s", designation: "Full Stack Developer", location: "New York", work_authorization: "H1B", time_zone: "America/New_York", employment_type: "Permanent", experience: "5years", education: "bachelor in technology", salary: "100000", company_name: "TCS", willing_to_relocate: true, language: "english", security_clearance: "military", notice_period: "immediately", last_updated: "7 Days Ago", last_viewed: "7 Days Ago", portal: "Dice", skills: ["reactjs", "nodejs"] }];
                
                var regex = new RegExp(searchField, "i");
                var output = [];
                data.forEach(function(val, key){
                / console.log(val) /;
                    if ((val.company_name.search(regex) != -1) || (val.skills.toString().toLowerCase().indexOf( searchField.toLowerCase()) != -1 )||(val.designation.search(regex) != -1) || (val.education.search(regex) != -1) || (val.employment_type.search(regex) != -1) || (val.experience.search(regex) != -1) || (val.first_name.search(regex) != -1) || (val.last_name.search(regex) != -1) || (val.security_clearance.search(regex) != -1) || (val.notice_period.search(regex) != -1) || (val.last_updated.search(regex) != -1) || (val.time_zone.search(regex) != -1) || (val.work_authorization.search(regex) != -1) || (val.location.search(regex) != -1) || (val.language.search(regex) != -1) ||  (val.portal.search(regex) != -1) ) {
                        output.push(val);
                    }

                }); 
                return output;
            }
            try{
                    let result = [];
                    let payload = req.body;
                    /**Store the search Data in search_log table */
                    payload.id = uuidv4();
                    /*audit Columns*/
                    payload.createdAt  = moment().format('YYYY-MM-DD H:m:s');
                    payload.updatedAt  = moment().format('YYYY-MM-DD H:m:s');
                    payload.is_voided   = false;
                    payload.enable_flag = true;
                    payload.recent_search_name = payload.search_options.must_have_keyword
                    let recentSearchId =  await searchLogTbl.create(payload);

                    let keyword = payload.search_options
                    result[0] = keyword.company_name ? getMatchJson(keyword.company_name) : [];
                    result[1] = keyword.designation ? getMatchJson(keyword.designation) : [];
                    result[2] = keyword.must_have_keywords ? getMatchJson(keyword.must_have_keywords) : [];
                    result[3] = keyword.time_zone ? getMatchJson(keyword.time_zone) : [];
                    result[4] = keyword.employment_type ? getMatchJson(keyword.employment_type) : [];
                    result[5] = keyword.language ? getMatchJson(keyword.language) : [];
                    result[6] = keyword.security_clearance ? getMatchJson(keyword.security_clearance) : [];
                    result[7] = keyword.notice_period ? getMatchJson(keyword.notice_period) : [];
                    let finalResult = result[0].concat(result[1],result[2],result[3],result[4],result[5],result[6], result[7]);
                    
                    jsonObject = finalResult.map(JSON.stringify); 
                    uniqueSet = new Set(jsonObject); 
                    uniqueArray = Array.from(uniqueSet).map(JSON.parse); 
                        
                    // console.log(uniqueArray);
                    // console.log(finalResult);

                res.status(200).send(reqResponse.sucessResponse(200, finalResult, payload, recentSearchId ))
            }
            catch (error) {
                res.status(400).send(reqResponse.errorResponse(400, error));
            }
        }

    return {
        SignUp , Login , SignOut , ForgotPassword , OrgValidate , createUser , editUser ,
        deleteUser ,viewUser ,getUser , verifySignin , updatepassword , authorize , confirmAccount , mailer,
        verifyPassword, createBucket, createPortalForUser, getportalofUser, saveUserSearch, deleteUserSearch, getSavedSearchOfUser, getRecentSearchOfUser, searchHere
    }
}

// var filter = req.body.search_options.must_have_keywords
//             console.log(filter);
//             let users
//             users= result.data.filter(function(item) {
//                 for (var key in filter) {
//                   if (item[key] === undefined || item[key] != filter[key])
//                     return false;
//                 }
//                 return true;
//               });
//               console.log(users)