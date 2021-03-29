module.exports = (sequelize, DataTypes) => {

  const role = sequelize.define('role', {
    id : {
      type : DataTypes.UUID,primaryKey : true
    },
    name : {
      type : DataTypes.STRING,unique : true
    },
    role_code : {
      type : DataTypes.STRING
    },
    description : {
      type : DataTypes.STRING
    },
    enable_flag : {
      type : DataTypes.BOOLEAN
    },
    is_voided : {
      type : DataTypes.BOOLEAN
    },

    is_admin : {
      type : DataTypes.BOOLEAN
    },
    org_id :{
      type : DataTypes.UUID
    },
    is_default : {
      type : DataTypes.BOOLEAN
    },
    is_common : {
      type : DataTypes.BOOLEAN
    },
    createdAt : {
         field: 'created_at',
         type: DataTypes.DATE
    },
    updatedAt : {
         field: 'updated_at',
         type: DataTypes.DATE
    },
    created_by : {
      type : DataTypes.UUID
    },
    updated_by : {
      type : DataTypes.UUID
    },
    track_work_flow_id : {
      type : DataTypes.UUID
    },
  },{
    freezeTableName: true,
  });

  role.associate = function(models){
    role.hasMany(models.user_role , {
        foreignKey: "role_id",
        as: "userrole"
    });
  }

  return role;
};