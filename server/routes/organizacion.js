const express = require('express');
const app = express();

//middelewares
const { verificaToken } = require('../middlewares/autentication');

// Funciones de uso general para el manejo de archivos
const { getNomArhivoAndExtension,
        validarExtension,
        moverArchivo,
        borrarArchivo } = require('../general-functions/managment-files.js');

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
        let resMvImg = await moverArchivo(imagen, nomImagenExt.nombre, 'organizaciones');
        if(resMvImg == false){
            return res.status(500).json({
                ok: false,
                message: 'Error al guardar la imágen, favor comunicarse con el administrador'
            });
        }
        
        // Continua para guardar la  organización
        await require('../models').Organizacion.create({

            nombre: body.nombre.trim(),
            descrip: body.descrip.trim(),
            email: body.email.trim(),
            tel: body.tel.trim(),
            imagen: nomImagenExt.nombre.trim(),
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
                descrip: body.descrip.trim(),
                email: body.email.trim(),
                tel: body.tel.trim()
            });

            return res.status(201).json({
                ok: true,
                message: 'Organización actualizada correctamente'
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
                let resMvImg = await moverArchivo(imagen, nomImagenExt.nombre, 'organizaciones');
                if(resMvImg == false){
                    return res.status(500).json({
                        ok: false,
                        message: 'Error al guardar la imágen, favor comunicarse con el administrador'
                    });
                }

                //Se borra la imagen anterior
                borrarArchivo(organiDB.imagen, 'organizaciones');

                if(resMvImg == false){
                    return res.status(500).json({
                        ok: false,
                        message: 'Error al guardar la imágen, favor comunicarse con el administrador'
                    });
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

module.exports = app;