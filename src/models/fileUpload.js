module.exports = (sequelize, DataTypes) => {
    const file_upload = sequelize.define('file_upload', {
      id: {
        type: DataTypes.UUID,
        primaryKey: true
      },
      location_url: {
        type: DataTypes.STRING
      },
      created_at :{
        type: DataTypes.DATE
      },
      updated_at:{
        type: DataTypes.DATE
      },
      upload_type:{
        type: DataTypes.STRING
      },
      mime_type:{
        type: DataTypes.STRING
      },
      original_file_name:{
        type: DataTypes.STRING
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
  
    file_upload.associate = function(models){
      
    } 
    return file_upload;
  };