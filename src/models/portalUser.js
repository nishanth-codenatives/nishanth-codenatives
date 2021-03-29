module.exports = (sequelize, DataTypes) => {
    const portal_user = sequelize.define('portal_user', {
      id: {
        type: DataTypes.UUID,
        primaryKey: true
      },
      account_user_id: {
        type: DataTypes.UUID
      },
      lookup_value_id: {
        type: DataTypes.INTEGER
      },
      limit :{
        type: DataTypes.STRING
      },
      /**Audit Columns */
      created_at :{
        type: DataTypes.DATE
      },
      updated_at:{
        type: DataTypes.DATE
      },
      enable_flag :{
        type: DataTypes.BOOLEAN
      },
      is_voided:{
        type: DataTypes.BOOLEAN
      },
      created_by :{
        type: DataTypes.UUID,
      },
      modified_by:{
        type: DataTypes.UUID
      },
    }, {
      freezeTableName: true, 
    });
  
    portal_user.associate = function(models){
        portal_user.belongsTo(models.account_user , {
          foreignKey: "account_user_id",
          as: "account_user",
        });
        portal_user.belongsTo(models.lookup_value , {
            foreignKey: "lookup_value_id",
            as: "lookup_value",
        });
    }
    return portal_user;
  };