const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  const resource_role = sequelize.define('resource_role', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true
    },
    org_id: {
      type: DataTypes.UUID
    },
    role_id: {
      type: DataTypes.UUID,
      uniqueKey: true
    },
    resource_id: {
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

  
  return resource_role;
};