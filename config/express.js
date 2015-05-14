// config/express.js

var express = require('express');
var load = require('express-load');


module.exports = function(){
    var app = express();
    app.set('port', 3000);

    app.use(express.static('./public'));

    app.set('view engine', 'ejs');
    app.set('views', './app/views');


    // o CWD altera o diretorio, por default ele utiliza o diretorio raiz
    load('models', {cwd: 'app'})
        .then('controllers')
        .then('routes')
        .into(app);

    return app;
};

