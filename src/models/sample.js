module.exports = (sequelize, DataTypes) => {
    const sample = sequelize.define('sample', {
      id: {
        type: DataTypes.UUID,
        primaryKey: true
      },
      name:{
        type: DataTypes.STRING,
      },
      address:{
        type: DataTypes.STRING,
      },
      mobile :{
        type: DataTypes.STRING
      },
    }, {
      freezeTableName: true, 
    });
    
    sample.associate = function(models){
    sample.hasOne(models.sample_role , {
              foreignKey: "sample_id",
              as: "sampleRole",
          });	
      }

    return sample;
};