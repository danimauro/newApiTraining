const express = require('express');
const app = express();

// Middelewares
const { verificaToken } = require('../middlewares/autentication');

// Funciones de uso general para el manejo de archivos
const { getNomArhivoAndExtension,
        validarExtension,
        moverArchivo,
        borrarArchivo } = require('../general-functions/managment-files.js');

/*==============
* Registrar invitado
================*/

app.post('/invitado', [verificaToken], async (req, res) => {

    try{

        //Se toman los datos por medio del POST
        let body = req.body;

        //extensiones permitidas
        const extensionesValidas = ['png','jpg','jpeg'];

        if(!req.files){
            return res.status(400).json({
                ok:false,
                message: 'No se ha enviado la imagen'
            });
        }

        //archivo fisico
        let imagen = req.files.imagen;

        // Se envia el objeto imagen y retorna un json con el nombre y la extension de la misma
        const nomImagenExt = await getNomArhivoAndExtension(imagen);

        // Se valida que la extension de la imagen cumpla con las extensiones validas
        let resExt = await validarExtension(extensionesValidas, nomImagenExt.ext);

        if(resExt !== true){
            return res.status(400).json({
                ok:false,
                message: resExt
            });
        }

        // Se guarda la imagen en la carpeta del servidor
        let resMvImg = await moverArchivo(imagen, nomImagenExt.nombre, 'invitados');
        if(resMvImg == false){
            return res.status(500).json({
                ok: false,
                message: 'Error al guardar la imágen, favor comunicarse con el administrador'
            });
        }
        
        // Continua para guardar la  organización
        await require('../models').Invitado.create({

            nombre: body.nombre.trim(),
            apellido: body.apellido.trim(),
            email: body.email.trim(),
            perfil: body.perfil.trim(),
            imagen: nomImagenExt.nombre.trim(),
            estado: true

        });

        return res.status(201).json({
            ok: true,
            message: 'Invitado registrado correctamente'
        });


    } catch(e){

        return res.status(500).json({
            ok: false,
            message: e
        });
    }

});


/*==============
* Traer todos los invitados registrados
================*/

app.get('/invitados',  async (req, res) => {

    
    try{

        const invitadosDB = await require('../models').Invitado.findAll({
            attributes: ['cod', 'nombre', 'apellido', 'perfil', 'email', 'imagen', 'estado'],
            where: { estado: true }
        });

        // Se le agrega la ruta 
        if(invitadosDB.length > 0){

            //Se configura el path de la imagen agregando el ubicación en el servidor antes de ser enviado al frontEnd
            for (let i = 0; i < invitadosDB.length; i++) {

                invitadosDB[i].imagen = `${ process.env.ROUTE_IMG_INVITADOS }${ invitadosDB[i].imagen }`

            }

        }

        return res.status(200).json({
            ok: true,
            invitadosDB
        });

    } catch(e){

        return res.status(500).json({
            ok: false,
            message: e
        });

    }

});


/*==============
* Actualizar Invitado
================*/

app.put('/invitado/:cod', [verificaToken], async (req, res) => {

    try{

         //Se toman los datos por medio del POST
        let body = req.body;

        // Despues de algunas validaciones se traen los datos de la dependencia
        const invitadoDB = await require('../models').Invitado.findOne({
            where: { cod: req.params.cod }
        });

        if(!invitadoDB){
            return res.status(400).json({
                ok: false,
                message: 'Invitado no encontrado'
            });
        }
    
        //extensiones permitidas
        const extensionesValidas = ['png','jpg','jpeg']

        if(!req.files){

            await invitadoDB.update({

                nombre: body.nombre.trim(),
                apellido: body.apellido.trim(),
                perfil: body.perfil.trim(),
                email: body.email.trim(),
                estado: body.estado

            });

            return res.status(201).json({
                ok: true,
                message: 'Invitado actualizado correctamente'
            });

        }else{

                //archivo fisico
                let imagen = req.files.imagen;

                // Se envia el objeto imagen y retorna un json con el nombre y la extension de la misma
                const nomImagenExt = await getNomArhivoAndExtension(imagen);

                // Se valida que la extension de la imagen cumpla con las extensiones validas
                let resExt = await validarExtension(extensionesValidas, nomImagenExt.ext);

                if(resExt !== true){
                    return res.status(400).json({
                        ok:false,
                        message: resExt
                    });
                }

                // Se guarda la imagen en la carpeta del servidor
                let resMvImg = await moverArchivo(imagen, nomImagenExt.nombre, 'invitados');
                if(resMvImg == false){
                    return res.status(500).json({
                        ok: false,
                        message: 'Error al guardar la imágen, favor comunicarse con el administrador'
                    });
                }

                //Se borra la imagen anterior
                borrarArchivo(invitadoDB.imagen, 'invitados');

                if(resMvImg == false){
                    return res.status(500).json({
                        ok: false,
                        message: 'Error al guardar la imágen, favor comunicarse con el administrador'
                    });
                }

                await invitadoDB.update({

                    nombre: body.nombre.trim(),
                    apellido: body.apellido.trim(),
                    perfil: body.perfil.trim(),
                    email: body.email.trim(),
                    imagen: nomImagenExt.nombre.trim(),
                    estado: body.estado

                });

                return res.status(201).json({
                    ok: true,
                    message: 'Invitado actualizado correctamente'
                });

            }

    } catch(e){

        return res.status(500).json({
            ok: false,
            message: e
        });
    }
        
});

/*==============
* Traer invitado por codigo
================*/

app.get('/invitado/:cod',  async (req, res) => {
    
    try{

        const invitadoDB = await require('../models').Invitado.findAll({
            attributes: ['cod', 'nombre', 'apellido', 'perfil', 'email', 'imagen', 'estado'],
            where: { cod: req.params.cod, estado: true }
        });

        // Se le agrega la ruta 
        if(invitadoDB.length > 0){

            //Se configura el path de la imagen agregando el ubicación en el servidor antes de ser enviado al frontEnd
            for (let i = 0; i < invitadoDB.length; i++) {

                invitadoDB[i].imagen = `${ process.env.ROUTE_IMG_INVITADOS }${ invitadoDB[i].imagen }`

            }

        }

        return res.status(200).json({
            ok: true,
            invitadoDB
        });

    } catch(e){

        return res.status(500).json({
            ok: false,
            message: e
        });

    }

});

module.exports = app;