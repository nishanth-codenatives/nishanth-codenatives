module.exports = (sequelize, DataTypes) => {
    const organization = sequelize.define('organization', {
      id: {
        type: DataTypes.UUID,
        primaryKey: true
      },
      first_name: {
        type: DataTypes.STRING
      },
      last_name :{
        type: DataTypes.STRING
      },
      org_name:{
        type: DataTypes.STRING
      },
      email:{
        type: DataTypes.STRING
      },
      phone_number : {
        type: DataTypes.STRING
      },
      url:{
        type: DataTypes.STRING
      },
      description:{
        type: DataTypes.STRING
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
      modified_by:{
        type: DataTypes.UUID
      },
      org_bucket :{
        type: DataTypes.STRING
      },
      logo:{
        type: DataTypes.TEXT
      }
    }, {
      freezeTableName: true, 
    });
  
    organization.associate = function(models){
        organization.hasMany(models.account_user , {
            foreignKey: "org_id",
            as: "accountuser"
        });
    }
    organization.associate = function(models){
      organization.hasMany(models.user_role , {
          foreignKey: "org_id",
          as: "userrole"
      });
      organization.hasMany(models.search_log , {
        foreignKey: "org_id",
        as: "searchlog"
    });
    organization.hasMany(models.team_member , {
      foreignKey: "org_id",
      as: "team"
  });
   
    
    }
  
    return organization;
  };