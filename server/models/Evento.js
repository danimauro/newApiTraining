'use strict';
module.exports = (sequelize, DataTypes) => {
    const Evento = sequelize.define('Evento', {
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
        imagen: DataTypes.STRING,
        fecinicio: {
            type: DataTypes.DATE,
            allowNull: false
        },
        fecfin: {
            type: DataTypes.DATE,
            allowNull: false
        },
        estado: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        }
    }, {});
    Evento.associate = function(models) {

        Evento.belongsTo(models.Invitado, { foreignKey: 'invitadoId' });

        Evento.belongsToMany(models.Dependencia, {
            through: 'Depevento',
            as: 'eventoDep',
            foreignKey: 'eventoId',
        })
    };
    return Evento;
};