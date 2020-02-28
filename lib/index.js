"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fbi_1 = require("fbi");
const build_1 = require("./commands/build");
const watch_1 = require("./commands/watch");
const factory_1 = require("./templates/factory");
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
