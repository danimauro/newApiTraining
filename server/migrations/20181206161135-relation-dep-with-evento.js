'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return  queryInterface.addConstraint('Depeventos', ['depId'], {

        type: 'FOREIGN KEY',
        name: 'FK_Depeventos_dependencia_1',
        references: {
          table: 'Dependencia',
          field: 'cod',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });

  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeConstraint('Depeventos', 'FK_Depeventos_dependencia_1');
  }
};
