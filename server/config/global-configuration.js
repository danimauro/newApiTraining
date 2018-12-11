// ============================
//  Puerto
// ============================
process.env.PORT = process.env.PORT || 3000;
process.env.ROUTE_IMG_ORGANIZACIONES = 'http://localhost:3000/uploads/organizaciones/';
process.env.ROUTE_IMG_DEPENDENCIAS = 'http://localhost:3000/uploads/dependencias/';
process.env.ROUTE_IMG_EVENTOS = 'http://localhost:3000/uploads/eventos/';
process.env.ROUTE_IMG_INVITADOS = 'http://localhost:3000/uploads/invitados/';


// ============================
//  Vencimiento del token
// ============================
// 60 segundos
// 60 minutos
// 24 horas
// 30 dias

process.env.CADUCIDAD_TOKEN = '12h';


// ============================
//  SEED de autenticacion
// ============================

process.env.SEED = process.env.SEED || 'este-es-el-seed-de-desarrollo';


// ============================
//  Google Client ID
// ============================

//process.env.CLIENT_ID = process.env.CLIENT_ID || '170158279383-ctoc0ivo4v0rrupc39m864k08fi9jr9b.apps.googleusercontent.com';