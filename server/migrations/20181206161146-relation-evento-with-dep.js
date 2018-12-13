'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addConstraint('Depeventos', ['eventoId'], {

        type: 'FOREIGN KEY',
        name: 'FK_Depeventos_evento_1',
        references: {
          table: 'Eventos',
          field: 'cod',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',

      });
     
  },

  down: (queryInterface, Sequelize) => {
    
    return queryInterface.removeConstraint('Depeventos', 'FK_Depeventos_evento_1');
    
  }
};
