'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Depeventos', {

      eventoId:{
        type: Sequelize.UUID,
        allowNull: false
      },

      depId:{
        type: Sequelize.UUID,
        allowNull: false
      },

      fecregistro: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },

      estado: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      },
      
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },

      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }

    });

  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Depeventos');
  }
};
