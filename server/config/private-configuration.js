process.env.ROUTE_IMG_ORGANIZACIONES = 'http://localhost:3000/uploads/organizaciones/';
process.env.ROUTE_IMG_DEPENDENCIAS = 'http://localhost:3000/uploads/dependencias/';
process.env.ROUTE_IMG_EVENTOS = 'http://localhost:3000/uploads/eventos/';
process.env.ROUTE_IMG_INVITADOS = 'http://localhost:3000/uploads/invitados/';

// ============================
//  Puerto
// ============================

process.env.PORT = process.env.PORT || 3001;

// ============================
// Estado de la aplicacion
// ============================

process.env.NODE_ENV = "test";

// ============================
//  Vencimiento del token
// ============================

process.env.CADUCIDAD_TOKEN = '4h';

// ============================
//  SEED de autenticacion
// ============================

process.env.SEED = process.env.SEED || 'este_seed_production_2019';
