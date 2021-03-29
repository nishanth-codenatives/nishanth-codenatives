module.exports = (sequelize, DataTypes) => {
    const accountuser = sequelize.define('account_user', {
      id: {
        type: DataTypes.UUID,
        primaryKey: true
      },
      user_id: {
        type: DataTypes.STRING
      },
      first_name: {
        type: DataTypes.STRING
      },
      last_name :{
        type: DataTypes.STRING
      },
      external_id :{
        type: DataTypes.STRING
      },
      org_id:{
        type: DataTypes.UUID,
      },
      designation:{
        type: DataTypes.STRING
      },
      email:{
        type: DataTypes.STRING
      },
      phone_number : {
        type: DataTypes.STRING
      },
      dob :{
        type: DataTypes.STRING
      },
      status:{
        type:DataTypes.STRING
      },
      created_at :{
        type: DataTypes.DATE
      },
      token:{
        type : DataTypes.STRING
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
  
    accountuser.associate = function(models){
      accountuser.belongsTo(models.organization , {
          foreignKey: "org_id",
          as: "organization",
      });
  

      accountuser.hasMany(models.user_role , {
          foreignKey: "account_user_id",
          as: "user_role"
      });
     
      accountuser.hasMany(models.search_log , {
        foreignKey: "account_user_id",
        as: "searchlog",
    });
    accountuser.hasMany(models.team , {
      foreignKey: "account_user_id",
      as: "team",
  });
  accountuser.hasMany(models.team , {
    foreignKey: "account_user_id",
    as: "teamnember",
});
  
    }
    return accountuser;
  };