module.exports = (sequelize, DataTypes) => {
  const resource = sequelize.define('resource', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true
    },
    org_id: {
      type: DataTypes.UUID
    },
    name: {
      type: DataTypes.STRING,
      uniqueKey: true
    },
    type: {
      type: DataTypes.STRING
    },
    slug: {
      type: DataTypes.STRING,
      uniqueKey: true
    },
    lookup_value_id: {
      type: DataTypes.UUID
    },
    is_enable: {
      type: DataTypes.BOOLEAN
    },
    is_deleted: {
      type: DataTypes.BOOLEAN
    },
    created_by: {
      type: DataTypes.UUID,
    },
    createdAt: {
      type: DataTypes.DATE,
      field: "created_on"
    },
    modified_by: {
      type: DataTypes.UUID
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: "modified_on"
    },
  }, {
    freezeTableName: true,
  });

  
  // dc_permission.associate = function (models) {
  //   dc_permission.hasMany(models.dc_role_permission, {
  //     foreignKey: 'permission_id',
  //     as: 'role_permission',
  //   });
  //   dc_permission.belongsTo(models.dc_menu, {
  //     foreignKey: 'menu_id',
  //     as: 'menu',
  //   });
  //   dc_permission.belongsTo(models.dc_lookup_value, {
  //     foreignKey: 'lookup_value_id',
  //     as: 'lookup_value'
  //   });
  // }
  return resource;
};