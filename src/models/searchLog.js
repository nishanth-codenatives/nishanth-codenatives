module.exports = (sequelize, DataTypes) => {
    const search_log = sequelize.define('search_log', {
      id: {
        type: DataTypes.UUID,
        primaryKey: true
      },
      account_user_id: {
        type: DataTypes.UUID
      },
      org_id: {
        type: DataTypes.UUID
      },
      saved_search_name:{
        type: DataTypes.STRING
      },
      search_options:{
        type: DataTypes.JSON
      },
      recent_search_name:{
        type: DataTypes.STRING
      },
      is_saved:{
        type: DataTypes.BOOLEAN
      },
      /**Audit Columns */
      enable_flag :{
        type: DataTypes.BOOLEAN
      },
      is_voided:{
        type: DataTypes.BOOLEAN
      },
      createdAt: {
        type: DataTypes.DATE,
        field: "created_at"
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
  
    search_log.associate = function(models){
        search_log.belongsTo(models.account_user , {
          foreignKey: "account_user_id",
          as: "account_user",
        });
        search_log.belongsTo(models.organization , {
            foreignKey: "org_id",
            as: "organization",
        });
    }
    return search_log;
  };