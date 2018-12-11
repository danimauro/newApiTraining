const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

// Middelewares
const { verificaToken } = require('../middlewares/autentication');


/*==============
* Registrar invitado
================*/

app.post('/invitado', [verificaToken], async (req, res) => {

    try{

        //Se toman los datos por medio del POST
        let body = req.body;


        if(!req.files){
            return res.status(400).json({
                ok:false,
                message: 'No se ha enviado la imagen'
            });
        }

        //archivo fisico
        let imagen = req.files.imagen;

        //extensiones permitidas
        let extensionesValidas = ['png','jpg','jpeg'];

        /*
         * Se envia la imagen y las extensiones validas, la funcion guarda la imagen en una carpeta en el servidor
         * despues de validar que la extensión sea la correcta
        */
        const respuesta = await moverImagen(imagen,extensionesValidas);


        // La variable respuesta puede contener un false, "error-img" o el nombre de a imagen a guardar
        // Si la respuessta el false hay un error con la extension
        if(!respuesta){
            return res.status(400).json({
                ok:false,
                message: 'Las extensiones permitidas son' + extensionesValidas.join(', ')
            });
        }

        // Si la respuesta es "error-img" quiere decir que se presento un error al guardar la imagen en la carpeta del servidor
        if(respuesta === "error-img"){

            return res.status(500).json({
                ok:false,
                message: 'Error al guardar la imágen, favor comunicarse con el administrador'
            });

        }
        
        // Continua para guardar la  organización
        await require('../models').Invitado.create({

            nombre: body.nombre.trim(),
            apellido: body.apellido.trim(),
            email: body.email.trim(),
            perfil: body.perfil.trim(),
            // Recuerde que la variable respueta trae el nombre de la imagen
            imagen: respuesta.trim(),
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

        let body = req.body;

        const invitadoDB = await require('../models').Invitado.findOne({
            where: { cod: req.params.cod }
        });

        if(!invitadoDB){

            return res.status(400).json({
                ok: false,
                message: 'Invitado no encontrado'
            });

        }
            
        if(!req.files){

            await invitadoDB.update({

                nombre: body.nombre.trim(),
                apellido: body.apellido.trim(),
                perfil: body.perfil.trim(),
                email: body.email.trim()

            });

            return res.status(201).json({
                ok: true,
                message: 'Invitado actualizado correctamente'
            });

        }else{

                //archivo físico
                let imagen = req.files.imagen;

                //extensiones permitidas
                let extensionesValidas = ['png','jpg','jpeg'];

                const respuesta = await moverImagen(imagen,extensionesValidas);

                // La variable respuesta puede contener un false, "error-img" o el nombre de a imagen a guardar
                // Si la respuessta el false hay un error con la extension
                if(!respuesta){
                    return res.status(400).json({
                        ok:false,
                        message: 'Las extensiones permitidas son: ' + extensionesValidas.join(', ')
                    });
                }

                // Si la respuesta es "error-img" quiere decir que se presento un error al guardar la imagen en la carpeta del servidor
                if(respuesta === "error-img"){

                    return res.status(500).json({
                        ok:false,
                        message: 'Error al guardar la imágen, favor comunicarse con el administrador'
                    });

                }

                let pathImagen =  path.resolve(__dirname, `../../public/uploads/invitados/${ invitadoDB.imagen }`);

                if( fs.existsSync(pathImagen) ){
                    fs.unlinkSync(pathImagen)
                }

                await invitadoDB.update({

                    nombre: body.nombre.trim(),
                    apellido: body.apellido.trim(),
                    perfil: body.perfil.trim(),
                    email: body.email.trim(),
                    imagen: respuesta

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

/* Permite guardar en una carpeta del servidor la imagen y validar que tenga las extensiones permitidas */

async function moverImagen(imagen, extensionesValidas){

    try{

        //extraemos del nombre del archivo la extension que tiene
        let nombreCortado = imagen.name.split('.');
        let extension = nombreCortado[nombreCortado.length - 1];
        let nomImagen = nombreCortado[nombreCortado.length - 2];


        //se valida la extension de la imagen con las permitidas por el sistema
        if(extensionesValidas.indexOf( extension ) < 0){

            //retorna false cuando detecta que la extension de la imagen no es la permitida
            return false;            

        }else{            

            //Cambiar nombre al archivo
            let nombreImagen = `${ nomImagen }-${ new Date().getMilliseconds() }.${ extension }`;
            
            await imagen.mv(`public/uploads/invitados/${nombreImagen}`, (err) => {
                
                //retorna error cuando no guarda la imagen en el servidor
                if(err){                    
                    return 'error-img';
                }

            });

            return nombreImagen;

        }


    } catch(e){

        return res.status(500).json({
            ok: false,
            message: e
        });
    }

}

module.exports = app;