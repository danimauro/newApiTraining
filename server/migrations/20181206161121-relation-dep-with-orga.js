'use strict';

module.exports = {
  
  up: (queryInterface, Sequelize) => {
    return  queryInterface.addConstraint('Orgadeps', ['depId'], {

          type: 'FOREIGN KEY',
          name: 'FK_Orgadeps_dependencia_1',
          references: {
            table: 'Dependencia',
            field: 'cod',
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',

        });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeConstraint('Orgadeps', 'FK_Orgadeps_dependencia_1');
  }
};
