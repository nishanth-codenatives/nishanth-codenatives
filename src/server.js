const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const config = require('config');
const app = express();
const firebase = require('firebase')

var admin = require('firebase-admin');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

//Database
const {db , modelMap } = require("./models");

/* db.sequelize.sync().then(()=>{
    console.log("db connected");
}).catch((err) =>{console.log(err);}) */

//Route



require('./routes')(app);
app.get('/', function (req, res) {
   console.log("Got a GET request for the homepage");
   res.send('Hello GET');
})

app.use(haltOnTimedout);
function haltOnTimedout(req, res, next) {
  if (!req.timedout) next();
}


// mode can be access anywhre in the project
mode = process.env.NODE_ENV;

const port = config.get(`${mode}.port`);
const host = config.get(`${mode}.host`);

const firebaseConfig = config.get(`${mode}.firebaseConfig`); // CONFIGURE THE FIREBASE WITH API KEY
firebase.initializeApp(firebaseConfig); // CONNECT THE FIREBASE DB ....
admin.initializeApp(firebaseConfig);

app.listen(port, host, function() {
  console.log(`app is running ${host} at ${port} - ${mode}`);
});