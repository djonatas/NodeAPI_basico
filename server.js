var http = require('http');
var app = require('./config/express')();
require('./config/database.js')('mongodb://localhost/APITest');


http.createServer(app).listen(app.get('port'), function (){
    console.log('Tudo funcionando :) -  Porta:'+ app.get('port'));
});