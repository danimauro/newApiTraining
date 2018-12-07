const uuid = require('uuid/v4');

'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Dependencia', {

      cod: {
        allowNull: false,
        primaryKey: true,
        Sequelize.UUID
        defaultValue: uuid()
      },

      nombre: {
        type: Sequelize.STRING,
        allowNull: false
      },

      imagen: {
        type: Sequelize.STRING
      },

      descrip: {
        type: Sequelize.STRING
      },

      orgaId: {
        type: Sequelize.UUID
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
    return queryInterface.dropTable('Dependencia');
  }
};