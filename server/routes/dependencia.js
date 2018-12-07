const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();


//middelewares
const { verificaToken } = require('../middlewares/autentication');



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
                attributes: ['cod', 'nombre', 'descrip', 'imagen'],                
                through: { 
                    attributes: { exclude: ['fecregistro', 'estado', 'createdAt', 'updatedAt', 'depId', 'orgaId'] },
                    where: { estado: true } 
                }
                
            }],
            attributes: ['cod','nombre', 'descrip', 'imagen'],
            where: { cod: req.params.ordaId, estado: true }
            
        });

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
            attributes: ['cod', 'nombre', 'descrip', 'imagen']
        });

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

        const dependenciaDB = await require('../models').Dependencia.create({

           nombre: body.nombre.trim(),
           descrip: body.descrip.trim(),
           imagen: respuesta.trim()

        });

        if(dependenciaDB){
            return res.status(201).json({
                ok: true,
                message: 'Dependencia guardada correctamente'
            }); 
        }       

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
            
            await imagen.mv(`../public/uploads/dependencias/${nombreImagen}`, (err) => {
                
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