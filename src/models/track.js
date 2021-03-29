module.exports = (sequelize, DataTypes) => {

  const track = sequelize.define('track', {
    id : {
      type : DataTypes.UUID,primaryKey : true
    },
    name : {
      type : DataTypes.STRING
    },
    track_code : {
      type : DataTypes.STRING
    },
    description : {
      type : DataTypes.STRING
    },
    org_id:{
      type: DataTypes.UUID
    },
    is_default : {
      type : DataTypes.BOOLEAN
    },
    track_status_map : {
      type: DataTypes.ARRAY(DataTypes.TEXT)
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

  track.associate = function (models) {
      track.belongsTo(models.account_user, {
        foreignKey: 'created_by',
        as: 'account_user',
      });
    }
  return track;
};