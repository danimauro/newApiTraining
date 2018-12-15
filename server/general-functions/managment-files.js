
/* ===============================
* Las funciones de esta documentos son de uso general para el manejo de archivos como imagenes, pdf, entre otras
==================================*/

const fs = require('fs');
const path = require('path');

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
async function validarExtension(extValidas, extension){
	
    if(extValidas.indexOf( extension ) < 0){         
        return 'Las extensiones permitidas son: ' + extValidas.join(', ');
    }
    return true;

}
//Envia el archivo a una ruta especifica dentro del servidor
async function moverArchivo(archivo, nombreArchivo, tipo){
        
    await archivo.mv(`../public/uploads/${ tipo }/${ nombreArchivo }`, (err) => {
                
        //retorna error cuando no guarda la imagen en el servidor
        if(err){       
            return false;
        }

        return true;

    });

}
/* Permite borrar de la carpeta del servidor la imagen por si se presenta algun error inesperado */
async function borrarArchivo(nombre, tipo){

    // Validar si el path existe para borrarlo
    let pathArchivo =  path.resolve(__dirname, `../../public/uploads/${ tipo }/${ nombre }`);

    if( fs.existsSync(pathArchivo) ){
        fs.unlinkSync(pathArchivo)
    }

}

module.exports = {

    getNomArhivoAndExtension,
    validarExtension,
    moverArchivo,
    borrarArchivo
}