const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const cors = require('./config/cors.js');
//Variables de entorno o configuraciones globales
require('./config/private-configuration');

//habilitar la carpeta public para que se pueda acceder externamente
app.use(express.static(path.resolve(__dirname, '../public')));

//default options
app.use(fileUpload());

//CORS
app.use(cors.permisos);


//parse aplication /x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

//parse aplication/json
app.use(bodyParser.json());

//rutas
app.use(require('./routes/index'));

app.listen(process.env.PORT, () => {
    console.log("escuchando el puerto: ", process.env.PORT);
});