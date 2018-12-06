'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
      
      return queryInterface.addConstraint('Orgadeps', ['orgaId'], {

          type: 'FOREIGN KEY',
          name: 'FK_Orgadeps_organizacion_1',

          references: {
            table: 'Organizacions',
            field: 'cod',
          },

          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',

        });
      
    },

    down: (queryInterface, Sequelize) => {
      return queryInterface.removeConstraint('Orgadeps', 'FK_Orgadeps_organizacion_1');
    }

};
