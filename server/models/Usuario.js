'use strict';
module.exports = (sequelize, DataTypes) => {
    
    const Usuario = sequelize.define('Usuario', {
        
        cod: {
            allowNull: false,
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4
        },

        identidad: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },

        nombre: {
            type: DataTypes.STRING,
            allowNull: false
        },

        apellido: {
            type: DataTypes.STRING,
            allowNull: false
        },

        tel: {
            type: DataTypes.STRING,
            allowNull: false
        },

        email: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
        },

        password: {
            type: DataTypes.STRING,
            allowNull: false
        },

        fecregistro: {
            type: DataTypes.DATE,
            allowNull: false
        },

        estado: {
            type: DataTypes.BOOLEAN,
        }

    }, {});

    Usuario.associate = function(models) {};

    return Usuario;
};