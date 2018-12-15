const express = require('express');
const app = express();

//middelewares
const { verificaToken } = require('../middlewares/autentication');

// Funciones de uso general para el manejo de archivos
const { getNomArhivoAndExtension,
        validarExtension,
        moverArchivo,
        borrarArchivo } = require('../general-functions/managment-files.js');

/* ======================= 
* Asignar dependencias a una organización
==========================*/

app.post('/add-dep-organi', [verificaToken],  async (req, res) => {

    try{

        //Se toman los datos por medio del POST
        let body = req.body;

        const OrgadepDB = await require('../models').Orgadep.create({

            orgaId: body.orgaId,
            depId: body.depId,
            fecregistro: new Date(),
            estado: true

        });

        if(OrgadepDB){

            return res.status(200).json({
                ok: true,
                message: 'Dependencia asignada correctamente'
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
* Get dependencias de una organizacion
==========================*/

app.get('/dependencias/:ordaId', async (req, res) => {

    try{

        const organiDB = await require('../models').Organizacion.findAll({
            // Se agrega a la consulta la tabla Dependencias y Orgadeps
            include:[{ 
                model: require('../models').Dependencia,
                as: 'organiDep',
                attributes: ['cod', 'nombre', 'descrip', 'imagen', 'estado'],                
                through: { 
                    attributes: { exclude: ['fecregistro', 'estado', 'createdAt', 'updatedAt', 'depId', 'orgaId'] },
                    where: { estado: true } 
                },
                where: { estado: true }
                
            }],
            attributes: ['cod','nombre', 'descrip', 'imagen', 'estado'],
            where: { cod: req.params.ordaId, estado: true }
            
        });

        // Se le agrega la ruta 
        if(organiDB.length > 0){

            organiDB[0].imagen = `${ process.env.ROUTE_IMG_ORGANIZACIONES }${ organiDB[0].imagen }`

            //Se configura el path de la imagen agregando el ubicación en el servidor antes de ser enviado al frontEnd
            for (let i = 0; i < organiDB[0].organiDep.length; i++) {

                organiDB[0].organiDep[i].imagen = `${ process.env.ROUTE_IMG_DEPENDENCIAS }${ organiDB[0].organiDep[i].imagen }`
            }

        }

        return res.status(200).json({
            ok: true,
            organiDB
        });


    }catch(e){

        return res.status(500).json({
            ok: false,
            message: e
        });

    }

});


/* ======================= 
* Get dependencias
==========================*/

app.get('/dependencias', [verificaToken], async (req, res) => {

    try{

        const dependenciaDB = await require('../models').Dependencia.findAll({
            attributes: ['cod', 'nombre', 'descrip', 'imagen', 'estado'],
            where: { estado: true }
        });

        // Se le agrega la ruta 
        if(dependenciaDB.length > 0){
            //Se configura el path de la imagen agregando el ubicación en el servidor antes de ser enviado al frontEnd
            for (let i = 0; i < dependenciaDB.length; i++) {

                dependenciaDB[i].imagen = `${ process.env.ROUTE_IMG_DEPENDENCIAS }${ dependenciaDB[i].imagen }`
            }
        }

        return res.status(200).json({
            ok: true,
            dependenciaDB
        });


    }catch(e){

        return res.status(500).json({
            ok: false,
            message: e
        });

    }

});


/* ======================= 
* Get traer una dependencia por codigo
==========================*/

app.get('/dependencia/:cod', [verificaToken], async (req, res) => {

    try{

        const dependenciaDB = await require('../models').Dependencia.findAll({
            attributes: ['cod', 'nombre', 'descrip', 'imagen', 'estado'],
            where: { cod: req.params.cod, estado: true }
        });

        // Se le agrega la ruta 
        if(dependenciaDB.length > 0){

            //Se configura el path de la imagen agregando el ubicación en el servidor antes de ser enviado al frontEnd
            for (let i = 0; i < dependenciaDB.length; i++) {

                dependenciaDB[i].imagen = `${ process.env.ROUTE_IMG_DEPENDENCIAS }${ dependenciaDB[i].imagen }`
            }
        }

        return res.status(200).json({
            ok: true,
            dependenciaDB
        });

    }catch(e){

        return res.status(500).json({
            ok: false,
            message: e
        });

    }

});

/*==============
* Registrar dependencias
================*/

app.post('/dependencia', [verificaToken], async (req, res) => {
    
    try{

        //Se toman los datos por medio del POST
        let body = req.body;

        //extensiones permitidas
        const extensionesValidas = ['png','jpg','jpeg'];

        // Se valida que la imagen este en la petición
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
        let resMvImg = await moverArchivo(imagen, nomImagenExt.nombre, 'dependencias');
        if(resMvImg == false){
            return res.status(500).json({
                ok: false,
                message: 'Error al guardar la imágen, favor comunicarse con el administrador'
            });
        }

        await require('../models').Dependencia.create({

           nombre: body.nombre.trim(),
           descrip: body.descrip.trim(),
           imagen: nomImagenExt.nombre.trim(),
           estado: true

        });

        return res.status(201).json({
            ok: true,
            message: 'Dependencia guardada correctamente'
        });  

    } catch(e){

        return res.status(500).json({
            ok: false,
            message: e
        });

    }

});

/*==============
* Actualizar dependencias
================*/

app.put('/dependencia/:cod', [verificaToken], async (req, res) => {
    
    try{

        //Se toman los datos por medio del POST
        let body = req.body;

        // se traen los datos de la dependencia
        const dependenciaDB = await require('../models').Dependencia.findAll({
            attributes: ['cod', 'nombre', 'descrip', 'imagen', 'estado'],
            where: { cod: req.params.cod, estado: true }
        });

        if(!dependenciaDB){
            return res.status(400).json({
                ok:false,
                message: 'No se encontro la dependencia'
            });  
        }
       
        //extensiones permitidas
        const extensionesValidas = ['png','jpg','jpeg'];

        // Se valida que la imagen este en la petición
        if(!req.files){
            
            await require('../models').Dependencia.update({
                nombre: body.nombre.trim(),
                descrip: body.descrip.trim(),
                estado: body.estado
            });

            return res.status(201).json({
                ok: true,
                message: 'Dependencia actualizada correctamente'
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
            let resMvImg = await moverArchivo(imagen, nomImagenExt.nombre, 'dependencias');
            if(resMvImg == false){

                return res.status(500).json({
                    ok: false,
                    message: 'Error al guardar la imagen, favor comunicarse con el administrador'
                }); 

            }

            //Se borra la imagen anterior
            borrarArchivo(dependenciaDB.imagen, 'dependencias');

            await require('../models').Dependencia.create({

               nombre: body.nombre.trim(),
               descrip: body.descrip.trim(),
               imagen: nomImagenExt.nombre.trim(),
               estado: body.estado

            });

            return res.status(201).json({
                ok: true,
                message: 'Dependencia actualizada correctamente'
            });  

        }

    } catch(e){

        return res.status(500).json({
            ok: false,
            message: e
        });

    }

});

module.exports = app;