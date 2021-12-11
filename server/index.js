const express = require('express')

const port = 3000;
const app = require('./app.js')

app.use(express.json());

app.listen(port, () => {
    console.log('Server is up on port ' + port);
})