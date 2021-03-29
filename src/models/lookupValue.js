module.exports = (sequelize, DataTypes) => {
    const lookup_value = sequelize.define('lookup_value', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        lookup_id: {
            type: DataTypes.INTEGER
        },
        parent_id: {
            type: DataTypes.INTEGER
        },
        seq: {
            type: DataTypes.INTEGER,
            allowNull: false

        },
        lookup_value: {
            type: DataTypes.STRING,
            allowNull: false

        },
        description: {
            type: DataTypes.STRING
        },
        lang_code:{
            type: DataTypes.STRING
        },
        enable_flag: {
            type: DataTypes.BOOLEAN
        },
        created_by: {
            type: DataTypes.UUID
        },
        modified_by: {
            type: DataTypes.UUID
        },
        is_voided: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
    }, {
        freezeTableName: true,
    });

    lookup_value.associate = function (models) {
        lookup_value.belongsTo(models.lookup, {
            foreignKey: 'lookup_id',
            as: 'lookup'
        });
        lookup_value.hasMany(models.portal_user, {
            foreignKey: "lookup_value_id",
            as: 'portal_user'
        });
    }
    return lookup_value;
};