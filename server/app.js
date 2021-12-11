const express = require('express');
const apiRouter = require('./Router/api.js')

const app = express();

app.use(express.json());
app.use(apiRouter);

module.exports = app;