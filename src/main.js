var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');
var http = require('http');

var Orquestration = require('./orchestration');

_global = new Orquestration();

var app = express();
var server = http.createServer(app);

var pathModules = process.env.MODULES || '/home/will/git/orchestration/modules/';

app.set('port', process.env.PORT || 3000);

app.set('view engine', 'jade');
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

if (!fs.existsSync(pathModules)) {
    fs.mkdirSync(pathModules);
}

var modules = fs.readdirSync(pathModules);

if (modules.length == 0) {
    console.log('Não existe modulos. Para adicionar:');
    console.log('1)\t', '(sudo npm install express-generator -g)');
    console.log('2)\t', '(express modules/mymodule)');
    console.log('3)\t', '(http://localhost:3000/mymodule)');
}

for (var i in modules) {
    var module = modules[i];
    console.log('Importing module', '(' + module + ')', '...');
    register(module);
}

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.json({
            message: err.message,
            error: err
        });
    });
}

app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.json({
        message: err.message,
        error: {}
    });
});

if (modules.length > 0)
    server.listen(app.get('port'));


function register(moduleName) {
    
    var jss = fs.readdirSync(pathModules + moduleName + '/public/javascripts/');

    var routes = fs.readdirSync(pathModules + moduleName + '/routes/');

    if (!fs.existsSync(pathModules + moduleName + '/rules/')) {
        fs.mkdirSync(pathModules + moduleName + '/rules/');
    }
    var rules = fs.readdirSync(pathModules + moduleName + '/rules/');

    var _path = pathModules + moduleName;
    
    for (var i in jss) {
        var jsName = jss[i];        
        _global.addJS(moduleName , jsName, moduleName + '/javascripts/' + jsName);
        console.log('\t', 'jss:  ', _path + '/public/javascripts/' + jsName);
    }

    for (var i in rules) {
        var ruleName = rules[i];
        var _requireRule = require(_path + '/rules/' + ruleName);
        _global.atach(moduleName, ruleName, _requireRule);
        console.log('\t', 'rules:  ', _path + '/routes/' + ruleName);
    }

    for (var i in routes) {
        var routeName = routes[i];
        var _requireRouter = require(_path + '/routes/' + routeName);
        app.set('views', path.join(_path, 'views'));
        app.use('/' + moduleName, express.static(_path + '/public/'));
        app.use('/' + moduleName, _requireRouter);
        console.log('\t', 'rotas:  ', _path + '/routes/' + routeName);
    }
    console.log('\t', 'public: ', path + '/public/');
    console.log('\t', 'views:  ', path.join(_path, 'views'));
    console.log('---------------------------------------------------------------------------------');
}
;