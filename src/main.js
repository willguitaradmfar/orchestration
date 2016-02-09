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

if (!fs.existsSync(pathModules)) {
    fs.mkdirSync(pathModules);
}

var modules = fs.readdirSync(pathModules);

if (modules.length == 0) {
    console.log('Não existe modulos. Para adicionar:');
    console.log('1)\t', '(sudo npm install express-generator -g)');
    console.log('2)\t', '(express ' + pathModules + '/mymodule)');
    console.log('3)\t', '(http://localhost:3000/mymodule)');
}

for (var i in modules) {
    var module = modules[i];
    console.log('Importing module', '(' + module + ')', '...');    
    registerView(module);    
}

for (var i in modules) {
    var module = modules[i];
    console.log('Importing module', '(' + module + ')', '...');
    registerRule(module);    
}

for (var i in modules) {
    var module = modules[i];
    console.log('Importing module', '(' + module + ')', '...');    
    registerCSS(module);    
}

for (var i in modules) {
    var module = modules[i];
    console.log('Importing module', '(' + module + ')', '...');    
    registerJS(module);
}

for (var i in modules) {
    var module = modules[i];
    console.log('Importing module', '(' + module + ')', '...');    
    registerRouter(module);    
}

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Não encontrado. Verifique o modulo');
    err.status = 404;
    next(err);
});

if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        if(err.status != 404)
            console.trace(err);
        res.status(err.status || 500);
        res.json({
            message: err.message,
            error: err
        });
    });
}

app.use(function (err, req, res, next) {
    if(err.status != 404)
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

    if (!fs.existsSync(pathModules + moduleName + '/rules/')) {
        fs.mkdirSync(pathModules + moduleName + '/rules/');
    }
    var rules = fs.readdirSync(pathModules + moduleName + '/rules/');

    var _path = pathModules + moduleName;
    
    console.log('\t', 'rule');

    for (var i in rules) {        
        var ruleName = rules[i];
        console.log('\t\t', 'rules:  ', _path + '/routes/' + ruleName);
        var _requireRule = require(_path + '/rules/' + ruleName);
        _global.atach(moduleName, ruleName, _requireRule);        
    }   
    
    console.log('---------------------------------------------------------------------------------');
};

function registerRouter(moduleName) {

    var routes = fs.readdirSync(pathModules + moduleName + '/routes/');
    
    var _path = pathModules + moduleName;
    
    console.log('\t', 'router');

    for (var i in routes) {
        var routeName = routes[i];
        console.log('\t\t', 'rotas:  ', _path + '/routes/' + routeName);
        var _requireRouter = require(_path + '/routes/' + routeName);
        app.set('views', path.join(_path, 'views'));
        app.use('/' + moduleName, _requireRouter);
        app.use('/' + moduleName, express.static(_path + '/public/'));        
    }
    console.log('\t\t', 'public: ', _path + '/public/');
    console.log('\t\t', 'views:  ', path.join(_path, 'views'));
    console.log('---------------------------------------------------------------------------------');
};

function registerCSS(moduleName) {
    
    var csss = fs.readdirSync(pathModules + moduleName + '/public/stylesheets/');
    
    var _path = pathModules + moduleName;
    
    console.log('\t', 'css');
    
    for (var i in csss) {
        var cssName = csss[i];
        console.log('\t\t', 'csss:  ', _path + '/public/stylesheets/' + cssName);
        _global.addCSS(moduleName , cssName, '/' + moduleName + '/stylesheets/' + cssName);        
    }   
    
    console.log('---------------------------------------------------------------------------------');
};

function registerJS(moduleName) {
    
    var jss = fs.readdirSync(pathModules + moduleName + '/public/javascripts/');    
    
    var _path = pathModules + moduleName;
    
    console.log('\t', 'jss');
    
    for (var i in jss) {
        var jsName = jss[i];
        console.log('\t\t', 'jss:  ', _path + '/public/javascripts/' + jsName);        
        _global.addJS(moduleName , jsName, '/' +moduleName + '/javascripts/' + jsName);
    }
    
    console.log('---------------------------------------------------------------------------------');
};

function registerView(moduleName) {
    
    var views = fs.readdirSync(pathModules + moduleName + '/views/');    
    
    var _path = pathModules + moduleName;
    
    console.log('\t', 'views');
    
    console.log('\t\t', 'views:  ', _path + '/views/');
    _global.addView(moduleName, _path + '/views/');
    
    
    console.log('---------------------------------------------------------------------------------');
};