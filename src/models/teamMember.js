module.exports = (sequelize, DataTypes) => {
  const team_member = sequelize.define('team_member', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true
    },
    account_user_id: {
      type: DataTypes.UUID
    },
    team_id:{
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
  team_member.associate = function(models){
    team_member.belongsTo(models.organization , {
          foreignKey: "org_id",
          as: "organization",
      });
      team_member.belongsTo(models.account_user , {
        foreignKey: "account_user_id",
        as: "accountuser",
    });
    team_member.belongsTo(models.organization , {
      foreignKey: "team_id",
      as: "team",
  });
  }
  
 

  return team_member;
};