const express = require('express');
const app = express();
const bcrypt = require('bcrypt');

// Importar el modelo usuarios
const Usuario = require('../models').Usuario;

// Middelewares
const { verificaToken } = require('../middlewares/autentication');

/*==============
* Devuelve un arreglo con todos los datos de los usuarios, con su organizacion correspondiente asociada
================*/

app.get('/usuarios/:cod', [verificaToken], async (req, res) => {


    try {

        const usuarioDB = await Usuario.findAll({          
            attributes: ['cod', 'identidad', 'nombre', 'apellido', 'tel', 'email', 'estado'],
            where: { cod: req.params.cod }
        });

        return res.status(200).json({
            ok: true,
            usuarioDB
        });


    } catch(e){

        return res.status(500).json({
            ok: false,
            message: e
        });
    }

});

/*===============
* Activar usuario SuperAdmin
=================*/

app.put('/active-usuario', async (req, res) => {

    try {

        //Se toman los datos por medio del POST
        let body = req.body;

        const usuarioDB = await Usuario.findOne({

            attributes: { exclude: ['password'] },
            where: { identidad: body.identidad, email: body.email }

        });

        //se valida que se encuentre un usuario con los datos ingresados por el usuario
        if (! usuarioDB ) {
            return res.status(403).json({
                ok: false,
                message: 'No se encontro el usuario con los datos ingresados'
            });
        }

        //se valida que el usuario ya este activado en el sistema
        if (usuarioDB.estado == 1) {
            return res.status(401).json({
                ok: false,
                message: 'El proceso de activacion ya se ejecuto anteriormente, favor comunicarse con el administrador del sistema'
            });
        }

        // Se actualiza el estado del usuario y se encripta el password
        await usuarioDB.update({
            password: bcrypt.hashSync(body.password, 10),
            estado: 1
        });


        if (usuarioDB) {
            return res.status(200).json({
                ok: true,
                message: 'Usuario activado correctamente'
            });
        }

    } catch(e){

        return res.status(500).json({
                ok: true,
                message: e
        });

    }


});

/*===============
* Ruta pera provar direccionamiento de api en producción
=================*/

app.get('/test', (req, res) => {

    return res.status(200).json({
        ok:true,
        message: 'test ok'
    });

});

module.exports = app;
