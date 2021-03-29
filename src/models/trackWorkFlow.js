module.exports = (sequelize, DataTypes) => {

  const trackWorkFlow = sequelize.define('track_work_flow', {
    id : {
      type : DataTypes.UUID,primaryKey : true
    },
    work_flow_name : {
      type : DataTypes.STRING
    },
    work_flow_code : {
      type : DataTypes.STRING
    },
    work_flow_desc : {
      type : DataTypes.STRING
    },
    org_id:{
      type: DataTypes.UUID
    },
    is_common : {
      type : DataTypes.BOOLEAN
    },
    enable_flag : {
      type : DataTypes.BOOLEAN
    },
    is_voided : {
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
  },{
    freezeTableName: true,
  });

  // trackWorkFlow.associate = function (models) {
  //   trackWorkFlow.belongsTo(models.account_user, {
  //     foreignKey: 'created_by',
  //     as: 'account_user',
  //   });
  //   trackWorkFlow.hasMany(models.track, {
  //     foreignKey: 'track_work_flow_id',
  //     as: 'track',
  //   });
  // }
  return trackWorkFlow;
};