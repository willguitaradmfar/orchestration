
module.exports = function () {
    this.modules = {};
    this.jss = {};
    this.csss = {};
    this.views = {};
};

module.exports.prototype.require = function (module, name) {
    if (!this.modules[module]) {
        console.trace('Modulo (' + module + ') não existe');
        throw 'Modulo (' + module + ') não existe';
    }
    if (!this.modules[module][name]) {
        console.trace('Rule (' + name + ') não existe');
        throw 'Rule (' + name + ') não existe';
    }
    return this.modules[module][name];
};

module.exports.prototype.atach = function (module, name, obj) {
    if (!this.modules[module])
        this.modules[module] = {};
    this.modules[module][name] = obj;
};

module.exports.prototype.addJS = function (module, name, JS) {
    if (!this.jss[module])
        this.jss[module] = {};
    this.jss[module][name] = JS;
};

module.exports.prototype.getJS = function (module) {
    if (!this.jss[module])
        throw 'Modulo ' + module + ' não existe para JS';
    return this.jss[module];
};

module.exports.prototype.addView = function (module, view) {
    this.views[module] = view;
};

module.exports.prototype.getView = function (module) {
    if (!this.views[module])
        throw 'Modulo ' + module + ' não existe para View ';
    return this.views[module];
};

module.exports.prototype.addCSS = function (module, name, CSS) {
    if (!this.csss[module])
        this.csss[module] = {};
    this.csss[module][name] = CSS;
};

module.exports.prototype.getCSS = function (module) {
    if (!this.csss[module])
        throw 'Modulo ' + module + ' não existe para CSS ';
    return this.csss[module];
};

