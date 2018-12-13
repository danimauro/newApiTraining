'use strict';
module.exports = (sequelize, DataTypes) => {
  const Depevento = sequelize.define('Depevento', {

        fecregistro: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        estado: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },

  }, {});
  Depevento.associate = function(models) {

      Depevento.belongsTo(models.Dependencia, { foreignKey: 'depId' });
      Depevento.belongsTo(models.Evento, { foreignKey: 'eventoId' });
  };
  return Depevento;
};