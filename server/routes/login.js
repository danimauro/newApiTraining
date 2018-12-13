const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const Usuario = require('../models').Usuario;


app.post('/login', async (req, res) => {

    try{

        let body = req.body;

        //se busca por medio del modelo Usuario

        const usuarioDB = await Usuario.findOne({
            attributes: ['cod', 'nombre', 'apellido', 'email', 'password', 'estado'],
            where: { email: body.email },
        });

        if (!usuarioDB) {
            return res.status(401).json({
                ok: false,
                message: '(Usuario) o contraseña incorrectos'
            });
        }

        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(401).json({
                ok: false,
                message: 'Usuario o (contraseña) incorrectos'
            });
        }

        if (usuarioDB.estado == 0) {
            return res.status(403).json({
                ok: false,
                message: 'Usuario en estado: Inactivo'
            });
        }

        usuarioDB.password = null;

        let token = await jwt.sign({
            usuario: usuarioDB
        }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

        return res.status(200).json({
            ok: true,
            usuarioDB,
            token
        });

    }catch(e){

        return res.status(500).json({
            ok: false,
            message: e
        });

    }

});

module.exports = app;