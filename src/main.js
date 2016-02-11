#!/usr/bin/env node

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');
var http = require('http');
var session = require('express-session');

var Orquestration = require('./orchestration');

_global = new Orquestration();

var app = express();
var server = http.createServer(app);

var pathModules = process.env.MODULES || process.env.HOME + '/modules/';

app.set('port', process.env.PORT || 3000);

app.set('view engine', 'jade');
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(session({secret: 'session'}));

var blackList = ['node_modules'];

var verifyBlackList = function (module) {
    for (i in blackList) {
        if (blackList[i] == module) {
            return false;
        }
    }
    return true;
};

var mkdir = function (pathMkdir) {
    if (!fs.existsSync(pathMkdir)) {
        fs.mkdirSync(pathMkdir);
    }
};

mkdir(pathModules);

var modules = fs.readdirSync(pathModules);

if (modules.length == 0) {
    console.log('Não existe modulos. Para adicionar:');
    console.log('1)\t', '(sudo npm install express-generator -g)');
    console.log('2)\t', '(express ' + pathModules + '/mymodule)');
    console.log('3)\t', '(http://localhost:3000/mymodule)');
}

for (var i in modules) {
    var module = modules[i];
    if (!verifyBlackList(module))
        continue;
    registerView(module);
}
console.log('---------------------------------------------------------------------------------');

for (var i in modules) {
    var module = modules[i];
    if (!verifyBlackList(module))
        continue;
    registerRule(module);
}
console.log('---------------------------------------------------------------------------------');

for (var i in modules) {
    var module = modules[i];
    if (!verifyBlackList(module))
        continue;
    registerRouter(module);
}
console.log('---------------------------------------------------------------------------------');

for (var i in modules) {
    var module = modules[i];
    if (!verifyBlackList(module))
        continue;
    registerDone(module);
}
console.log('---------------------------------------------------------------------------------');

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Não encontrado. Verifique o modulo');
    err.status = 404;
    next(err);
});

if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        if (err.status != 404)
            console.trace(err);
        res.status(err.status || 500);
        res.json({
            message: err.message,
            error: err
        });
    });
}

app.use(function (err, req, res, next) {
    if (err.status != 404)
        console.trace(err);
    res.status(err.status || 500);
    res.json({
        message: err.message,
        error: {}
    });
});

if (modules.length > 0)
    server.listen(app.get('port'));

function registerRule(moduleName) {
    var pathMkdir = pathModules + moduleName + '/rules/';    
    
    mkdir(pathMkdir);
    
    var rules = fs.readdirSync(pathMkdir);

    var _path = pathModules + moduleName;

    console.log('Scan rule');

    for (var i in rules) {
        var ruleName = rules[i];
        console.log('\t', moduleName + ':  ', _path + '/routes/' + ruleName);
        var _requireRule = require(_path + '/rules/' + ruleName);
        _global.atach(moduleName, ruleName, _requireRule);
    }
}
;

function registerRouter(moduleName) {
    
    var pathMkdir = pathModules + moduleName + '/routes/';
    
    mkdir(pathMkdir);

    var routes = fs.readdirSync(pathMkdir);

    var _path = pathModules + moduleName;

    console.log('Scan router');

    for (var i in routes) {
        var routeName = routes[i];
        console.log('\t', moduleName + ':  ', _path + '/routes/' + routeName);
        var _requireRouter = require(_path + '/routes/' + routeName);
        app.set('views', path.join(_path, 'views'));
        app.use('/' + moduleName, _requireRouter);
        app.use('/' + moduleName, express.static(_path + '/public/'));
    }
    console.log('\t', 'public: ', _path + '/public/');
    console.log('\t', 'views:  ', path.join(_path, 'views'));
}
;


function registerView(moduleName) {
    
    var pathMkdir = pathModules + moduleName + '/views/';
    
    mkdir(pathMkdir);

    var views = fs.readdirSync(pathMkdir);

    var _path = pathModules + moduleName;

    console.log('Scan views');

    console.log('\t', moduleName + ':  ', _path + '/views/');
    _global.addView(moduleName, _path + '/views/');
}
;

function registerDone(moduleName) {
    
    var pathMkdir = pathModules + moduleName + '/register.js';
    
    console.log('Scan registerDone');
    
    if(fs.existsSync(pathMkdir)){
        console.log('\t', moduleName + ':  ', pathMkdir);
        require(pathMkdir);        
    }    
}
;