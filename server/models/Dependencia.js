'use strict';
module.exports = (sequelize, DataTypes) => {
  const Dependencia = sequelize.define('Dependencia', {

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

        imagen: {
            type: DataTypes.STRING
        },

        descrip: {
            type: DataTypes.STRING
        },

        estado: {
            type: DataTypes.BOOLEAN
        }

  }, {});
  Dependencia.associate = function(models) {
    
    	Dependencia.belongsToMany(models.Organizacion, {
            through: 'Orgadep',
            as: 'depOrga',
            foreignKey: 'depId',
        });

        Dependencia.belongsToMany(models.Evento, {
            through: 'Depevento',
            as: 'depEvento',
            foreignKey: 'depId',
        });

  };
  return Dependencia;
};