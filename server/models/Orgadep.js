'use strict';
module.exports = (sequelize, DataTypes) => {
  const Orgadep = sequelize.define('Orgadep', {

        fecregistro: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        estado: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },

  }, {});
  Orgadep.associate = function(models) {

      Orgadep.belongsTo(models.Organizacion, { foreignKey: 'orgaId' });
      Orgadep.belongsTo(models.Dependencia, { foreignKey: 'depId' });
  };
  return Orgadep;
};