module.exports = (sequelize, DataTypes) => {
    const lookup = sequelize.define('lookup', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        org_id: {
            type: DataTypes.UUID
        },
        lookup_code: {
            type: DataTypes.STRING,
            allowNull: false,
            uniqueKey: true
        },
        description: {
            type: DataTypes.STRING
        },
        created_by: {
            type: DataTypes.UUID,
        },
        modified_by: {
            type: DataTypes.UUID
        },
        enable_flag: {
            type: DataTypes.BOOLEAN
        },
        is_voided: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
    }, {
        freezeTableName: true,
    });

    lookup.associate = function (models) {
        lookup.hasMany(models.lookup_value, {
            foreignKey: 'lookup_id',
            as: 'lookup_value'
        });
        lookup.belongsTo(models.organization, {
            foreignKey: "org_id",
            onDelete: "CASCADE",
            as: 'organization'
        });
    }
    return lookup;
};