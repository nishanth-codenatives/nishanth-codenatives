module.exports = (sequelize, DataTypes) => {
    const sampleRole = sequelize.define('sample_role', {
    id: {
            type: DataTypes.UUID,
            primaryKey: true
        },
    sample_id: {
            type: DataTypes.UUID
        },
    username :{
        type: DataTypes.STRING
        },
    password :{
        type: DataTypes.STRING
        },  
    }, {
      freezeTableName: true, 
    });

    sampleRole.associate = function(models){
        sampleRole.belongsTo(models.sample , {
          foreignKey: "sample_id",
          as: "sample",
        });
    }
    
    return sampleRole;
};