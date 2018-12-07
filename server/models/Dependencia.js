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
        }

  }, {});
  Dependencia.associate = function(models) {
    
    	Dependencia.belongsToMany(models.Organizacion, {
            through: 'Orgadep',
            as: 'depOrga',
            foreignKey: 'depId',
        });

  };
  return Dependencia;
};