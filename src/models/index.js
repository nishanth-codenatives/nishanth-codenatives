'use strict';

const fs = require('fs');
const path = require('path');
const config = require('config');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);

const db = {};

let modelMap ={};
let sequelize;

let mode = process.env.NODE_ENV;
const database = config.get(`${mode}.database.name`);
const username = config.get(`${mode}.database.username`);
const password = config.get(`${mode}.database.password`);
const _config  = config.get(`${mode}.database`);

sequelize = new Sequelize(database, username, password, _config);

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    //console.log(model);
    db[model.name] = model;

    const fileName = file.split(".")[0];
		const transformedFileName = fileName;
		modelMap[transformedFileName] = model;
    //console.log(modelMap);
  });

Object.keys(db).forEach(modelName => {
    //console.log(modelName);
    //console.log(db[modelName].associate);
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});
//console.log(db);
db.sequelize = sequelize;
db.Sequelize = Sequelize;

modelMap.sequelize = sequelize
modelMap.Sequelize = Sequelize


module.exports = {db , modelMap};
