module.exports = (sequelize, DataTypes) => {
    const userrole = sequelize.define('user_role', {
      id: {
        type: DataTypes.UUID,
        primaryKey: true
      },
      account_user_id: {
        type: DataTypes.STRING
      },
      role_id:{
        type: DataTypes.UUID,
      },
      org_id:{
        type: DataTypes.UUID,
      },
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
      is_delete:{
        type: DataTypes.BOOLEAN
      },
      modified_by:{
        type: DataTypes.UUID
      },
    }, {
      freezeTableName: true, 
    });
    /* Association comes from organization */
    userrole.associate = function(models){
        userrole.belongsTo(models.organization , {
            foreignKey: "org_id",
            as: "organization",
        });
    }
    
    /* Association comes from Account */
  userrole.associate = function(models){
    userrole.belongsTo(models.account_user , {
          foreignKey: "account_user_id",
          as: "accountuser",
      });
  }
  /* Association comes from Role */
  userrole.associate = function(models){
    userrole.belongsTo(models.role , {
        foreignKey: "role_id",
        as: "role",
    });
}

    return userrole;
  };