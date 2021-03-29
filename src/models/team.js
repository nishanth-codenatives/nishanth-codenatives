module.exports = (sequelize, DataTypes) => {
    const team = sequelize.define('team', {
      id: {
        type: DataTypes.UUID,
        primaryKey: true
      },
      account_user_id :{
        type: DataTypes.UUID,
      },
      org_id:{
        type: DataTypes.UUID,
      },
      team_name :{
        type: DataTypes.STRING
      },
      description :{
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
      is_delete:{
        type: DataTypes.BOOLEAN
      },
      modified_by:{
        type: DataTypes.UUID
      },
    }, {
      freezeTableName: true, 
    });
  
    team.associate = function(models){
        
        team.hasMany(models.team_member , {
            foreignKey: "account_user_id",
            as: "accountuser"
        });
        team.hasMany(models.team_member , {
            foreignKey: "org_id",
            as: "organization"
        });
        team.hasMany(models.team_member , {
            foreignKey: "team_id",
            as: "teammember"
        });
      }
   
    return team;
  };