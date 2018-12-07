'use strict';
module.exports = (sequelize, DataTypes) => {
    const Organizacion = sequelize.define('Organizacion', {

        cod: {
            allowNull: false,
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4
        },

        nombre: {
            type: DataTypes.STRING,
            allowNull: false
        },

        descrip: DataTypes.STRING,
        
        imagen: {
            type: DataTypes.STRING,
            allowNull: false
        },

        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },

        tel: {
            type: DataTypes.STRING,
            allowNull: false
        },

        estado: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        }

    }, {});

    Organizacion.associate = function(models) {

        Organizacion.belongsTo(models.Dependencia);
        //, { foreignKey: 'orgaId' }

    };
    return Organizacion;
};