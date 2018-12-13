'use strict';
module.exports = (sequelize, DataTypes) => {
    const Invitado = sequelize.define('Invitado', {
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
        apellido: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            unique:true,
            allowNull: false
        },
        perfil: {
            type: DataTypes.STRING,
            allowNull: false
        },
        imagen: {
            type: DataTypes.STRING,
            allowNull: false
        },
        estado: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        }
    }, {});
    Invitado.associate = function(models) {
        // associations can be defined here
        Invitado.hasMany(models.Evento, { foreignKey: 'invitadoId' });
    };
    return Invitado;
};