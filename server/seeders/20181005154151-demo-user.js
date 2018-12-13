const uuid = require('uuid/v4');

'use strict';
module.exports = {
    up: (queryInterface, Sequelize) => {
        /*
         * Tener en cuenta que al ejecutar este seeder estamos creando el primer usuario de la base de datos
         * el cual tendra los permisos de administrador,
         * tambien se debe ejecutar la la ruta /activaradmin con los parametros solicitados: identidad, email para que pueda activar el usuario
         */

        return queryInterface.bulkInsert('Usuarios', [{
            identidad: '1060651521',
            nombre: 'Daniel',
            apellido: 'Gutierrez',
            tel: '3117195533',
            email: 'dmgutierrez7@misena.edu.co',
            password: '1234',
            fecregistro: new Date(),
            estado: false, //Por defecto es false ya que debe ser activado
            createdAt: new Date(),
            updatedAt: new Date()
        }], {});


    },

    down: (queryInterface, Sequelize) => {
        //Borrar seeder
        return queryInterface.bulkDelete('Usuarios', null, {});
    }
};