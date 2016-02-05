
module.exports = function (){
    this.modules = {};
    this.jss = {};
};

module.exports.prototype.require = function (module, name){
    return this.modules[module][name];
};

module.exports.prototype.atach = function (module, name, obj){
    this.modules[module] = {};
    this.modules[module][name] = obj;    
};

module.exports.prototype.addJS = function (module, name, JS){
    this.jss[module] = {};
    this.jss[module][name] = JS;
};

module.exports.prototype.getJS = function (module, name, JS){
    return this.jss[module][name];
};

