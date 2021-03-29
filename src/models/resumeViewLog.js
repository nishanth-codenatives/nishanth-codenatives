module.exports = (sequelize, DataTypes) => {
    const resume_view_log = sequelize.define('resume_view_log', {
      id: {
        type: DataTypes.UUID,
        primaryKey: true
      },
      account_user_id: {
        type: DataTypes.UUID
      },
      resume_id:{
        type: DataTypes.STRING
      },
      date_seen:{
        type: DataTypes.DATE
      },
      lookup_id: {
        type: DataTypes.INTEGER
      },
      /**Audit Columns */
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
    }, {
      freezeTableName: true, 
    });
  
    resume_view_log.associate = function(models){
        resume_view_log.belongsTo(models.account_user , {
          foreignKey: "account_user_id",
          as: "account_user",
      });
    }
    return resume_view_log;
  };