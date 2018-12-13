const express = require('express');
const app = express();

app.use(require('./evento'));
app.use(require('./dependencia'));
app.use(require('./organizacion'));
app.use(require('./invitado'));
app.use(require('./usuario'));
app.use(require('./login'));

module.exports = app;