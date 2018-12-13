const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

//middelewares
const { verificaToken } = require('../middlewares/autentication');


/*==============
* Traer Organizaciones
================*/

app.get('/organizaciones',  async (req, res) => {

    
    try{

        const organiDB = await require('../models').Organizacion.findAll({
            attributes: ['cod', 'nombre', 'descrip', 'imagen', 'email', 'tel'],
            where: { estado: true }
        });

        // Se le agrega la ruta 
        if(organiDB.length > 0){

            //Se configura el path de la imagen agregando el ubicación en el servidor antes de ser enviado al frontEnd
            for (let i = 0; i < organiDB.length; i++) {

                organiDB[i].imagen = `${ process.env.ROUTE_IMG_ORGANIZACIONES }${ organiDB[i].imagen }`

            }

        }

        return res.status(200).json({
            ok: true,
            organiDB
        });

    } catch(e){

        return res.status(500).json({
            ok: false,
            message: e
        });

    }

});


/*==============
* Registrar organización
================*/

app.post('/organizacion', [verificaToken], async (req, res) => {

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
        const organi = await require('../models').Organizacion.create({

            nombre: body.nombre.trim(),
            descrip: body.descrip.trim(),
            email: body.email.trim(),
            tel: body.tel.trim(),
            // Recuerde que la variable respueta trae el nombre de la imagen
            imagen: respuesta.trim(),
            estado: true

        });

        return res.status(201).json({
            ok: true,
            message: 'Organización guardada correctamente'
        });


    } catch(e){

        return res.status(500).json({
            ok: false,
            message: e
        });
    }

});

/*==============
* Traer una Organización por codigo
================*/

app.get('/organizacion/:cod',  async (req, res) => {

    try {

        const organiDB = await require('../models').Organizacion.findAll({

            attributes: ['cod', 'nombre', 'descrip', 'imagen', 'email', 'tel'],
            where: { cod: req.params.cod, estado: true }

        });

        if(organiDB.length > 0){

            //Se configura el path de la imagen agregando el ubicación en el servidor antes de ser enviado al frontEnd
            for (let i = 0; i < organiDB.length; i++) {

                organiDB[i].imagen = `${ process.env.ROUTE_IMG_ORGANIZACIONES }${ organiDB[i].imagen }`

            }

        }

        return res.status(200).json({
            ok: true,
            organiDB
        });
        
    }catch(e) {

        return res.status(500).json({
            ok: false,
            message: e
        });

    }
});



/*==============
* Actualizar Organización
================*/

app.put('/organizacion/:cod', [verificaToken], async (req, res) => {

    try{

        let body = req.body;

        const organiDB = await require('../models').Organizacion.findOne({
            where: { cod: req.params.cod }
        });

        if(!organiDB){

            return res.status(400).json({
                ok: false,
                message: 'Organización no encontrada'
            });

        }
            
        if(!req.files){

            await organiDB.update({
                nombre: body.nombre.trim(),
                descrip: body.descrip.trim()
            });

            return res.status(201).json({
                ok: true,
                message: 'Organización actualizada correctamente'
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

                let pathImagen =  path.resolve(__dirname, `../../public/uploads/organizaciones/${ organiDB.imagen }`);

                if( fs.existsSync(pathImagen) ){
                    fs.unlinkSync(pathImagen)
                }

                await organiDB.update({

                    nombre: body.nombre.trim(),
                    descrip: body.descrip.trim(),
                    email: body.email.trim(),
                    tel: body.tel.trim(),
                    imagen: respuesta,


                });

                return res.status(201).json({
                    ok: true,
                    message: 'Organización actualizada correctamente'
                });

            }

    } catch(e){

        return res.status(500).json({
            ok: true,
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
            
            await imagen.mv(`../public/uploads/organizaciones/${nombreImagen}`, (err) => {
                
                //retorna error cuando no guarda la imagen en el servidor
                if(err){                    
                    return 'error-img';
                }

            });

            return nombreImagen;

        }


    } catch(e){

        console.log(e)
    }

}

module.exports = app;