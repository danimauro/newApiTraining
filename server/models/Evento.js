'use strict';
module.exports = (sequelize, DataTypes) => {
    const Evento = sequelize.define('Evento', {
        codigo: {
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
        imagen: DataTypes.STRING,
        fecinicio: {
            type: DataTypes.DATE,
            allowNull: false
        },
        fecifin: {
            type: DataTypes.DATE,
            allowNull: false
        },
        estado: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        }
    }, {});
    Evento.associate = function(models) {

        Evento.belongsTo(models.Invitado);

        Evento.belongsToMany(models.Dependencia, {
            through: 'Depevento',
            as: 'eventoDep',
            foreignKey: 'eventoId',
        })
    };
    return Evento;
};