const firebase = require("firebase");
const reqResponse = require('../cors/responseHandler');
var admin = require('firebase-admin');
module.exports = () => {
    return function (req , res , next) {
        const { authorization } = req.headers;
        try {
            if(!authorization){
                return res.status(400).json({
                    status: false,
                    message: "Authorization Failed",
                });
            }
            admin
            .auth()
            .verifyIdToken(authorization)
            .then((decodedToken) => {
                const uid = decodedToken.uid;
                next();
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
}