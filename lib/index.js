"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fbi_1 = require("fbi");
const build_1 = __importDefault(require("./commands/build"));
const watch_1 = __importDefault(require("./commands/watch"));
const factory_1 = __importDefault(require("./templates/factory"));
class FactoryFactory extends fbi_1.Factory {
    constructor() {
        super(...arguments);
        this.id = require('../package.json').name;
        this.description = 'factory for fbi factory development';
        this.commands = [new build_1.default(this), new watch_1.default(this)];
        this.templates = [new factory_1.default(this)];
    }
}
exports.default = FactoryFactory;
