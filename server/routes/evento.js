const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

//middelewares
const { verificaToken } = require('../middlewares/autentication');



/* ======================= 
* Asignar eventos a una dependencia
==========================*/

app.post('/add-evento-depen', [verificaToken],  async (req, res) => {

    try{

        //Se toman los datos por medio del POST
        let body = req.body;

        const depeventoDB = await require('../models').Depevento.create({

            eventoId: body.eventoId,
            depId: body.depId,
            fecregistro: new Date(),
            estado: true

        });

        if(depeventoDB){

            return res.status(200).json({
                ok: true,
                message: 'Evento asignado correctamente'
            });

        }

    }catch(e){

        return res.status(500).json({
            ok: false,
            message: e
        });
    }

});


/* ======================= 
* Get eventos de una dependencia
==========================*/

app.get('/eventos-dep/:depId', async (req, res) => {
    
   
    try{

        const eventosDepDB = await require('../models').Dependencia.findAll({
            // Se agrega a la consulta la tabla Dependencias y Orgadeps
            include:[{ 
                model: require('../models').Evento,
                as: 'depEvento',
                attributes: ['cod', 'nombre', 'descrip', 'imagen', 'fecinicio', 'fecfin'],                
                through: { 
                    attributes: { exclude: ['fecregistro', 'estado', 'createdAt', 'updatedAt', 'eventoId', 'depId'] },
                    where: { estado: true } 
                }
                
            }],
            attributes: ['cod','nombre', 'descrip', 'imagen'],
            where: { cod: req.params.depId }
            
        });

        return res.status(200).json({
            ok: true,
            eventosDepDB
        });


    }catch(e){

        return res.status(500).json({
            ok: false,
            message: e
        });

    }

});


/* ======================= 
* Registrar eventos
==========================*/

app.post('/evento', [verificaToken],  async (req, res) => {

    try{

        //Se toman los datos por medio del POST
        let body = req.body;

        // Validar si se envió una imagen
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

        const eventoDB = await require('../models').Evento.create({

            nombre: body.nombre.trim(),
            descrip: body.descrip.trim(),
            imagen: respuesta.trim(),
            fecinicio: body.fecinicio,
            fecfin: body.fecfin,
            invitadoId: body.invitadoId,
            estado: true

        });


        if(eventoDB){

            return res.status(200).json({
                ok: true,
                message: 'Evento registrado correctamente'
            });

        }

    }catch(e){

        return res.status(500).json({
            ok: false,
            message: e
        });
    }

});


/* ======================= 
* Actualizar un evento
==========================*/

app.put('/evento/:cod', [verificaToken],  async (req, res) => {

    try{

        //Se toman los datos por medio del POST
        let body = req.body;

        // Consultar evento por cod
        const eventoDB = await require('../models').Evento.findOne({
            where: { cod: req.params.cod }
        });


        if(!eventoDB){

            return res.status(400).json({
                ok: false,
                message: 'Evento no encontrado'
            });

        }

        if(!req.files){

            await eventoDB.update({

                nombre: body.nombre.trim(),
                descrip: body.descrip.trim(),
                fecinicio: body.fecinicio,
                fecfin: body.fecfin,
                invitadoId: body.invitadoId,
                estado: body.estado

            });

            return res.status(201).json({
                ok: true,
                message: 'Evento actualizado correctamente'
            });

        }else{

            //archivo físico
            let imagen = req.files.imagen;

            //extensiones permitidas
            let extensionesValidas = ['png','jpg','jpeg'];

            // Se valida que tenga una extension permitida y se traslada la imagen a la ruta public/uploads/eventos
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

            // Validar si el path existe para borrarlo

            let pathImagen =  path.resolve(__dirname, `../../public/uploads/eventos/${ eventoDB.imagen }`);

            if( fs.existsSync(pathImagen) ){
                fs.unlinkSync(pathImagen)
            }

            await eventoDB.update({

                nombre: body.nombre.trim(),
                descrip: body.descrip.trim(),
                imagen: respuesta,
                fecinicio: body.fecinicio,
                fecfin: body.fecfin,
                invitadoId: body.invitadoId,
                estado: body.estado

            });

            return res.status(201).json({
                ok: true,
                message: 'Evento actualizado correctamente'
            });

        }

    }catch(e){

        return res.status(500).json({
            ok: false,
            message: e
        });
    }

});

/* =============
* Get eventos
==============*/

app.get('/eventos', [verificaToken],  async (req, res) => {

    try{

        const eventosDB = await require('../models').Evento.findAll({
            include:[{ 
                model: require('../models').Invitado,
                attributes: ['cod', 'nombre', 'apellido', 'email', 'perfil', 'imagen', 'estado'],
                where: { estado: true }
            }],
            attributes: ['cod', 'nombre', 'descrip', 'imagen', 'fecinicio', 'fecfin', 'estado'],
            where: { estado: true }
        });

        return res.status(200).json({
            ok:true,
            eventosDB
        });

    }catch(e){

        return res.status(500).json({
            ok:false,
            e
        });
    }


});


/* =============
* Get evento: devuelve un evento por su codigo correspondiente
==============*/

app.get('/evento/:cod',  async (req, res) => {

    try{

        const eventoDB = await require('../models').Evento.findAll({
            include:[{ 
                model: require('../models').Invitado,
                attributes: ['cod', 'nombre', 'apellido', 'email', 'perfil', 'imagen', 'estado'],
                where: { estado: true }
            }],
            attributes: ['cod', 'nombre', 'descrip', 'imagen', 'fecinicio', 'fecfin', 'estado'],
            where: { cod: req.params.cod, estado: true }
        });

        return res.status(200).json({
            ok:true,
            eventoDB
        });

    }catch(e){

        return res.status(500).json({
            ok:false,
            e
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
            
            await imagen.mv(`../public/uploads/eventos/${nombreImagen}`, (err) => {
                
                //retorna error cuando no guarda la imagen en el servidor
                if(err){                    
                    return 'error-img';
                }

            });

            return nombreImagen;

        }


    } catch(e){

        return res.status(500).json({
            ok:false,
            e
        });
    }

}


module.exports = app;