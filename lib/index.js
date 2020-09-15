"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const fbi_1 = require("fbi");
const build_1 = tslib_1.__importDefault(require("./commands/build"));
const watch_1 = tslib_1.__importDefault(require("./commands/watch"));
const factory_1 = tslib_1.__importDefault(require("./templates/factory"));
class FactoryFactory extends fbi_1.Factory {
    constructor() {
        super(...arguments);
        this.id = 'factory-factory';
        this.description = 'factorty for fbi factory development';
        this.commands = [new build_1.default(this), new watch_1.default(this)];
        this.templates = [new factory_1.default(this)];
    }
    factoryMethod1() {
        this.log(`Factory: (${this.id})`, 'from factoryMethod1');
    }
}
exports.default = FactoryFactory;
