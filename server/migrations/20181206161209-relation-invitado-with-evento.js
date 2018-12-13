'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addConstraint('Eventos', ['invitadoId'], {

        type: 'FOREIGN KEY',
        name: 'FK_Invitados_evento_1',
        references: {
          table: 'Invitados',
          field: 'cod',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',

      });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeConstraint('Eventos', 'FK_Invitados_evento_1');
  }
};
