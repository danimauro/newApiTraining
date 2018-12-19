const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer'); 
const handlebars = require('handlebars');

//middelewares
const { verificaToken } = require('../middlewares/autentication');

// Funciones de uso general para el manejo de archivos
const { getNomArhivoAndExtension,
        validarExtension,
        moverArchivo,
        borrarArchivo } = require('../general-functions/managment-files.js');

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
                attributes: ['cod', 'nombre', 'descrip', 'imagen', 'fecinicio', 'fecfin', 'contenido', 'costo', 'folleto', 'estado'],                
                through: { 
                    attributes: { exclude: ['fecregistro', 'estado', 'createdAt', 'updatedAt', 'eventoId', 'depId'] },
                    where: { estado: true } 
                }
                
            }],
            attributes: ['cod','nombre', 'descrip', 'imagen', 'estado'],
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
        let folleto = req.files.folleto;

        if(req.files.imagen && req.files.folleto){

            const nomImagenExt = await getNomArhivoAndExtension(imagen);
            const nomFolletoExt = await getNomArhivoAndExtension(folleto);

            // Se validan las extensiones de los archivos
            let resExtImg = await validarExtension(extensionesValidasImagen, nomImagenExt.ext);
            let resExtFolleto = await validarExtension(extensionesValidasFolleto, nomFolletoExt.ext);

            // Si la respuesta no es true se sale del sistema informando las extensiones válidas
            if(resExtImg !== true){

                return res.status(400).json({
                    ok: false,
                    message: resExtImg
                });
            
            }else if(resExtFolleto !== true){

                return res.status(400).json({
                    ok: false,
                    message: resExtFolleto
                });
            
            }

            //Se envian las imanges a las rutas correspondientes de las carpetas en el servidor
            let resImg = await moverArchivo(imagen, nomImagenExt.nombre, 'eventos');
            let resfolleto = await moverArchivo(folleto, nomFolletoExt.nombre, 'folletos');

            // retorna true cuando logra mover la imagen a la carpeta 'eventos' del servidor y false cuando se presenta un error
            if(resImg == false){
                return res.status(500).json({
                    ok: false,
                    message: 'Error al guardar la imágen, favor comunicarse con el administrador'
                }); 
            } else if(resfolleto == false){
                return res.status(500).json({
                    ok: false,
                    message: 'Error al guardar el folleto, favor comunicarse con el administrador'
                }); 
            }

            const eventoDB = await require('../models').Evento.create({

                nombre: body.nombre.trim(),
                descrip: body.descrip.trim(),
                imagen: nomImagenExt.nombre.trim(),
                fecinicio: body.fecinicio,
                fecfin: body.fecfin,
                invitadoId: body.invitadoId,
                folleto: nomFolletoExt.nombre.trim(),
                contenido: body.contenido.trim(),
                costo: body.costo.trim(),            
                estado: true

            });

        // Si el usuario envia el folleto
        }else if(req.files.folleto){

        	//archivo físico
        	let folleto = req.files.folleto;

        	//Se traer en nombre del archivo y la extension
        	const nomFolletoExt = await getNomArhivoAndExtension(folleto);

        	//Se valida que la extension sea correcta
        	let resExt = await validarExtension(extensionesValidasFolleto, nomFolletoExt.ext);
        
            if(resExt !== true){
                return res.status(400).json({
                    ok: false,
                    message: resExt
                });
            }

        	//Se envian las imanges a las rutas correspondientes de las carpetas en el servidor
        	let resArchivo = await moverArchivo(folleto, nomFolletoExt.nombre, 'folletos');

            // retorna true cuando logra mover la imagen a la carpeta 'eventos' del servidor y false cuando se presenta un error
            if(resArchivo == false){

                return res.status(500).json({
                    ok: false,
                    message: 'Error al guardar el folleto, favor comunicarse con el administrador'
                }); 
            }

            await eventoDB.update({
                
                nombre: body.nombre.trim(),
                descrip: body.descrip.trim(),
                fecinicio: body.fecinicio,
                fecfin: body.fecfin,
                invitadoId: body.invitadoId,
                folleto: nomFolletoExt.nombre.trim(),
                contenido: body.contenido.trim(),
                costo: body.costo.trim(),            
                estado: true

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
                let resExtImg = await validarExtension(extensionesValidasImagen, nomImagenExt.ext);
                let resExtFolleto = await validarExtension(extensionesValidasFolleto, nomFolletoExt.ext);

                if(resExtImg !== true){

                    return res.status(400).json({
                        ok:false,
                        message: resExtImg
                    }); 

                }else if(resExtFolleto  !== true){

                    return res.status(400).json({
                        ok:false,
                        message: resExtFolleto
                    }); 
                }

                //Se envian las imanges a las rutas correspondientes de las carpetas en el servidor
                let resMvImg = await moverArchivo(imagen, nomImagenExt.nombre, 'eventos');
                let resMvFolleto = await moverArchivo(folleto, nomFolletoExt.nombre, 'folletos');

                if(resMvImg == false){

                    return res.status(500).json({
                        ok: false,
                        message: 'Error al guardar la imagen, favor comunicarse con el administrador'
                    }); 

                }else if(resMvFolleto == false){

                    return res.status(500).json({
                        ok: false,
                        message: 'Error al guardar el folleto, favor comunicarse con el administrador'
                    }); 
                }

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
                let resExtFolleto = await validarExtension(extensionesValidasFolleto, nomFolletoExt.ext);
                
                if(resExtFolleto !== true){

                    return res.status(400).json({
                        ok:false,
                        message: resExtFolleto
                    });
                }

                //Se envian las imanges a las rutas correspondientes de las carpetas en el servidor
                let resMvFolleto = await moverArchivo(folleto, nomFolletoExt.nombre, 'folletos');

                if(resMvFolleto == false){

                    return res.status(500).json({
                        ok: false,
                        message: 'Error al guardar el folleto, favor comunicarse con el administrador'
                    }); 
                }

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
                let resExtImg = await validarExtension(extensionesValidasImagen, nomImagenExt.ext);

                if(resExtImg !== true){

                    return res.status(400).json({
                        ok:false,
                        message: resExtImg
                    });
                }

                //Se envian las imanges a las rutas correspondientes de las carpetas en el servidor
                let resMvImg = await moverArchivo(imagen, nomImagenExt.nombre, 'eventos');

                if(resMvImg == false){

                    return res.status(500).json({
                        ok: false,
                        message: 'Error al guardar el folleto, favor comunicarse con el administrador'
                    }); 
                }

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



/* =============
* get: Envia un correo electrónico con los datos de un usuario que esta solicitando infomación de un evento a la organización que lo publico
==============*/

app.post('/request-info/:codEvento',  async (req, res) => {

    try{

        //Se toman los datos por medio del POST
        let body = req.body;

        // Se consulta la dependencia a la que pertenece el evento codigo que envia el usuario
        const codDepen = await require('../models').Dependencia.findAll({
            include:[{ 
                model: require('../models').Evento,
                as: 'depEvento',
                through: { 
                    attributes: { exclude: ['fecregistro', 'estado', 'createdAt', 'updatedAt', 'eventoId', 'depId'] },
                    where: { eventoId: req.params.codEvento, estado: true } 
                },
                attributes: { exclude: [ 'cod', 'nombre', 'descrip', 'contenido', 'imagen', 'costo', 'estado', 'folleto', 'fecinicio', 'fecfin', 'invitadoId', 'createdAt', 'updatedAt', 'depId'] },
                where: { cod: req.params.codEvento, estado: true }
            }],
            attributes: ['cod'],
            where: { estado: true }
        });

        // Si devuelve un arreglo sin datos se retorna un mensaje de error
        if(!codDepen){
            return res.status(400).json({
                ok:false,
                message: 'Error al enviar el su solicitud, favor comunicarse con el administrador del sistema'
            }); 
        }

        // Si consulta por medio de la dependencia que se ubico anteriormente la organizacion a la cual pertenece para traer el dato del correo electrónico
        const organizacionDB = await require('../models').Organizacion.findAll({

            include:[{
                model: require('../models').Dependencia,
                as: 'organiDep',
                through: { 
                    attributes: { exclude: ['orgaId', 'depId', 'fecregistro', 'updatedAt', 'createdAt', 'estado'] },
                    where: { depId: codDepen[0].cod, estado: true } 
                },
                attributes: { exclude: [ 'cod', 'nombre', 'descrip', 'contenido', 'imagen', 'estado', 'createdAt', 'updatedAt'] },
                where: { cod: codDepen[0].cod, estado: true }
            }],
            attributes: ['email'],
            where: { estado: true }

        });

        // Si devuelve un arreglo sin datos se retorna un mensaje de error
        if(!organizacionDB){
            return res.status(400).json({
                ok:false,
                message: 'Error al enviar el su solicitud, favor comunicarse con el administrador del sistema'
            }); 
        }

        // Se lee un documento html donde se rendirizaran los datos que se enviaran por correo electrónico
        let readHTMLFile = function(path, callback) {

            fs.readFile(path, {encoding: 'utf-8'}, function (err, html) {
                if (err) {
                    throw err;
                    callback(err);
                }
                else {
                    callback(null, html);
                }
            });

        };

        // Se reemplazan los elementos que desea cambiar en la cadena html usando handlebars
        readHTMLFile(path.resolve(__dirname, `../templates/email/request-info.html`), (err, html) => {

            // se llama el template
            let template = handlebars.compile(html);

            // se crea un objeto con los datos para la template
            let replacements = {
                nombre: body.nombre,
                apellido: body.apellido,
                tel: body.tel,
                email: body.email,
                mensaje: body.mensaje,
                nomEvento: body.nomEvento
            };

            // se renderiza el template con los datos del objeto anterior
            let htmlToSend = template(replacements);

            // Se crea un objeto transporter con los datos del correo principal
            const transporter = nodemailer.createTransport({

                service: 'Gmail',
                    auth: {
                        user: process.env.EMAIL,
                        pass: process.env.PASSWORD
                    }
            });

            // Se definen los datos del correo destino y el asunto correspondiente
            let mailOptions = {
                to: 'dmgutierrez7@misena.edu.co',
                subject: 'Solicitud de información',
                html : htmlToSend
            };

            //se envia el correo electrónico
            transporter.sendMail(mailOptions, (error) => {

                if (error){

                return res.status(500).json({
                    ok:false,
                    message: error
                }); 

                } else {

                    return res.status(200).json({
                        ok:true,
                        message: 'El mensaje se envió correctamente.'
                    });

                }
            });

        });

    }catch(e){

        return res.status(500).json({
            ok:false,
            e
        });
    }

});

module.exports = app;