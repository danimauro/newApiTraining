const uuid = require('uuid/v4');
'use strict';
module.exports = {
     up: (queryInterface, Sequelize) => {
        
        return queryInterface.createTable('Usuarios', {

            cod: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.UUID,
                defaultValue: uuid()
            },

            identidad: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },

            nombre: {
                type: Sequelize.STRING,
                allowNull: false
            },

            apellido: {
                type: Sequelize.STRING,
                allowNull: false
            },

            tel: {
                type: Sequelize.STRING,
                allowNull: false
            },

            email: {
                type: Sequelize.STRING,
                unique: true,
                allowNull: false
            },
            
            password: {
                type: Sequelize.STRING,
                allowNull: false
            },

            fecregistro: {
                type: Sequelize.DATEONLY,
                allowNull: false
            },

            estado: {
                type: Sequelize.BOOLEAN,
            },

            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },

            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }

        })
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.dropTable('Usuarios');
    }
};