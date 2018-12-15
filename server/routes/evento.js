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
                attributes: ['cod', 'nombre', 'descrip', 'imagen', 'fecinicio', 'fecfin', 'contenido', 'costo', 'folleto'],                
                through: { 
                    attributes: { exclude: ['fecregistro', 'estado', 'createdAt', 'updatedAt', 'eventoId', 'depId'] },
                    where: { estado: true } 
                }
                
            }],
            attributes: ['cod','nombre', 'descrip', 'imagen'],
            where: { cod: req.params.depId }
            
        });

        // Se le agrega la ruta 
        if(eventosDepDB.length > 0){

            eventosDepDB[0].imagen = `${ process.env.ROUTE_IMG_DEPENDENCIAS }${ eventosDepDB[0].imagen }`

            //Se configura el path de la imagen agregando el ubicación en el servidor antes de ser enviado al frontEnd
            for (let i = 0; i < eventosDepDB[0].depEvento.length; i++) {

                eventosDepDB[0].depEvento[i].imagen = `${ process.env.ROUTE_IMG_EVENTOS }${ eventosDepDB[0].depEvento[i].imagen }`
                eventosDepDB[0].depEvento[i].folleto = `${ process.env.ROUTE_IMG_FOLLETOS }${ eventosDepDB[0].depEvento[i].folleto }`

            }

        }

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

        //extensiones permitidas para las imagenes y folletos
        const extensionesValidasImagen = ['png','jpg','jpeg'];
        const extensionesValidasFolleto = ['png','jpg','jpeg','pdf'];

        // Validar si se envió una imagen
        if(!req.files){
            return res.status(400).json({
                ok:false,
                message: 'No ha cargado ningún archivo'
            });
        }

        if(!req.files.imagen){
            return res.status(400).json({
                ok:false,
                message: 'Favor cargar la imagen del evento'
            });
        }

        //archivo físico
        let imagen = req.files.imagen;

        const nomImagenExt = await getNomArhivoAndExtension(imagen);

        // Se validan las extensiones de los archivos
        await validarExtension(extensionesValidasImagen, nomImagenExt.ext, res);

        //Se envian las imanges a las rutas correspondientes de las carpetas en el servidor
        await moverArchivo(imagen, nomImagenExt.nombre, res, 'eventos');

        const eventoDB = await require('../models').Evento.create({

            nombre: body.nombre.trim(),
            descrip: body.descrip.trim(),
            imagen: nomImagenExt.nombre.trim(),
            fecinicio: body.fecinicio,
            fecfin: body.fecfin,
            invitadoId: body.invitadoId,
            contenido: body.contenido.trim(),
            costo: body.costo.trim(),            
            estado: true

        });
        
        // Si el usuario envia el folleto
        if(req.files.folleto){

        	//archivo físico
        	let folleto = req.files.folleto;

        	//Se traer en nombre del archivo y la extension
        	const nomFolletoExt = await getNomArhivoAndExtension(folleto);

        	//Se valida que la extension sea correcta
        	await validarExtension(extensionesValidasFolleto, nomFolletoExt.ext, res);

        	//Se envian las imanges a las rutas correspondientes de las carpetas en el servidor
        	await moverArchivo(folleto, nomFolletoExt.nombre, res, 'folletos');

            await eventoDB.update({
                
                folleto: nomFolletoExt.nombre.trim()

            });

        }

        return res.status(200).json({
            ok: true,
            message: 'Evento registrado correctamente'
        });

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

        //extensiones permitidas para las imagenes y folletos
        const extensionesValidasImagen = ['png','jpg','jpeg'];
        const extensionesValidasFolleto = ['png','jpg','jpeg','pdf'];

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

        // si no envian ningun archivo guarda el resto de la información
        if(!req.files){

            await eventoDB.update({

                nombre: body.nombre.trim(),
                descrip: body.descrip.trim(),
                fecinicio: body.fecinicio,
                fecfin: body.fecfin,
                invitadoId: body.invitadoId,
                contenido: body.contenido.trim(),
                costo: body.costo.trim(),
                estado: body.estado

            });

        }else if( req.files.imagen && req.files.folleto ){

                //archivo físico
                let imagen = req.files.imagen;
                let folleto = req.files.folleto;

                const nomImagenExt = await getNomArhivoAndExtension(imagen);
                const nomFolletoExt = await getNomArhivoAndExtension(folleto);

                // Se validan las extensiones de los archivos
                await validarExtension(extensionesValidasImagen, nomImagenExt.ext, res);
                await validarExtension(extensionesValidasFolleto, nomFolletoExt.ext, res);

                //Se envian las imanges a las rutas correspondientes de las carpetas en el servidor
                await moverArchivo(imagen, nomImagenExt.nombre, res, 'eventos');
                await moverArchivo(folleto, nomFolletoExt.nombre, res, 'folletos');

                //Se borra la imagen anterior
                borrarArchivo(eventoDB.imagen, 'eventos');

                //Se borra el folleto anterior
                borrarArchivo(eventoDB.folleto, 'folletos');

               
                await eventoDB.update({

                	nombre: body.nombre.trim(),
	                descrip: body.descrip.trim(),
	                fecinicio: body.fecinicio,
	                fecfin: body.fecfin,
	                invitadoId: body.invitadoId,
	                contenido: body.contenido.trim(),
	                costo: body.costo.trim(),                
                    imagen: nomImagenExt.nombre.trim(),
                    folleto: nomFolletoExt.nombre.trim(),
                    estado: body.estado

                });

            }else if(req.files.folleto){

                //archivo físico
                let folleto = req.files.folleto;

                // Se valida que el folleto tenga las extensiones permitidas
                const nomFolletoExt = await getNomArhivoAndExtension(folleto);

                // Se validan las extensiones de los archivos
                await validarExtension(extensionesValidasFolleto, nomFolletoExt.ext, res);

                //Se envian las imanges a las rutas correspondientes de las carpetas en el servidor
                await moverArchivo(folleto, nomFolletoExt.nombre, res, 'folletos');

                //Se borra el folleto anterior
                borrarArchivo(eventoDB.folleto, 'folletos');

               
                await eventoDB.update({

                	nombre: body.nombre.trim(),
	                descrip: body.descrip.trim(),
	                fecinicio: body.fecinicio,
	                fecfin: body.fecfin,
	                invitadoId: body.invitadoId,
	                contenido: body.contenido.trim(),
	                costo: body.costo.trim(),                
                    folleto: nomFolletoExt.nombre.trim(),
                    estado: body.estado

                });

            }else if(req.files.imagen){

            	//archivo físico
                let imagen = req.files.imagen;

                // Se valida que el folleto tenga las extensiones permitidas
                const nomImagenExt = await getNomArhivoAndExtension(imagen);

                // Se validan las extensiones de los archivos
                await validarExtension(extensionesValidasImagen, nomImagenExt.ext, res);

                //Se envian las imanges a las rutas correspondientes de las carpetas en el servidor
                await moverArchivo(imagen, nomImagenExt.nombre, res, 'eventos');

                //Se borra la imagen anterior
                borrarArchivo(eventoDB.imagen, 'eventos');
               
                await eventoDB.update({
                    
                    nombre: body.nombre.trim(),
	                descrip: body.descrip.trim(),
	                fecinicio: body.fecinicio,
	                fecfin: body.fecfin,
	                invitadoId: body.invitadoId,
	                contenido: body.contenido.trim(),
	                costo: body.costo.trim(),                
                    imagen: nomImagenExt.nombre.trim(),
                    estado: body.estado

                });            	

            }

		    return res.status(201).json({
		        ok: true,
		        message: 'Evento actualizado correctamente'
		    });


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
            attributes: ['cod', 'nombre', 'descrip', 'imagen', 'fecinicio', 'fecfin', 'contenido', 'costo', 'folleto', 'estado'],
            where: { estado: true }
        });

        // Se le agrega la ruta 
        if(eventosDB.length > 0){

            //Se configura el path de la imagen agregando el ubicación en el servidor antes de ser enviado al frontEnd
            for (let i = 0; i < eventosDB.length; i++) {

                eventosDB[i].imagen = `${ process.env.ROUTE_IMG_EVENTOS }${ eventosDB[i].imagen }`;
                eventosDB[i].folleto = `${ process.env.ROUTE_IMG_FOLLETOS }${ eventosDB[i].folleto }`;
                eventosDB[i].Invitado.imagen = `${ process.env.ROUTE_IMG_INVITADOS }${ eventosDB[i].Invitado.imagen }`;

            }

        }

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
            attributes: ['cod', 'nombre', 'descrip', 'imagen', 'fecinicio', 'fecfin', 'contenido', 'costo', 'folleto', 'estado'],
            where: { cod: req.params.cod, estado: true }
        });

        if(eventoDB){

            eventoDB[0].imagen = `${ process.env.ROUTE_IMG_EVENTOS }${ eventoDB[0].imagen }`;
            eventoDB[0].folleto = `${ process.env.ROUTE_IMG_FOLLETOS }${ eventoDB[0].folleto }`;
            eventoDB[0].Invitado.imagen = `${ process.env.ROUTE_IMG_INVITADOS }${ eventoDB[0].Invitado.imagen }`;

        }

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

// Devuelve el nombre y la extension de un objeto tipo imagen
async function getNomArhivoAndExtension(imagen){

 	//extraemos del nombre del archivo la extension que tiene
    let nombreCortado = imagen.name.split('.');
    let extension = nombreCortado[nombreCortado.length - 1];
    let nomArchivo = nombreCortado[nombreCortado.length - 2];

    //Cambiar nombre al archivo
    let nombreArchivo = `${ nomArchivo }-${ new Date().getMilliseconds() }.${ extension }`;

    let nomArchivoEx = { nombre: nombreArchivo, ext: extension };

    return nomArchivoEx;

}
/* Permite guardar en una carpeta del servidor la imagen y validar que tenga las extensiones permitidas */
async function validarExtension(extValidas, extension, res){

	try {

		if(extValidas.indexOf( extension ) < 0){
         
            return res.status(400).json({
                ok:false,
                message: 'Las extensiones permitidas son: ' + extValidas.join(', ')
            });      

        }

	} catch(e) {

		return res.status(500).json({
            ok:false,
            message: "Error validador de extensiones, favor comunicarse con el administrador"
        });
	}

}
//Envia el archivo a una ruta especifica dentro del servidor
async function moverArchivo(archivo, nombreArchivo, res, tipo){

    try{
            
        await archivo.mv(`../public/uploads/${ tipo }/${ nombreArchivo }`, (err) => {
                
            //retorna error cuando no guarda la imagen en el servidor
            if(err){       

                return res.status(500).json({
                    ok:false,
                    message: 'Error al guardar la imagen o el folleto del evento, favor comunicarse con el administrador'
                });

            }

        });

    } catch(e){

        return res.status(500).json({
            ok:false,
            message: "Error interno al mover un archivo, favor comunicarse con el administrador"
        });
    }

}
/* Permite borrar de la carpeta del servidor la imagen por si se presenta algun error inesperado */
async function borrarArchivo(nombre, tipo){

    try{

        // Validar si el path existe para borrarlo
        let pathArchivo =  path.resolve(__dirname, `../../public/uploads/${ tipo }/${ nombre }`);

        if( fs.existsSync(pathArchivo) ){
            fs.unlinkSync(pathArchivo)
        }

    } catch(e){

        return res.status(500).json({
            ok:false,
            e
        });
    }

}

module.exports = app;