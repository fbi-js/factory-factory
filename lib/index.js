"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateFactory = exports.CommandWatch = exports.CommandBuild = void 0;
const fbi_1 = require("fbi");
const build_1 = __importDefault(require("./commands/build"));
exports.CommandBuild = build_1.default;
const watch_1 = __importDefault(require("./commands/watch"));
exports.CommandWatch = watch_1.default;
const factory_1 = __importDefault(require("./templates/factory"));
exports.TemplateFactory = factory_1.default;
const { name, description } = require('../package.json');
class FactoryFactory extends fbi_1.Factory {
    constructor() {
        super(...arguments);
        this.id = name;
        this.description = description;
        this.commands = [new build_1.default(this), new watch_1.default(this)];
        this.templates = [new factory_1.default(this)];
    }
}
exports.default = FactoryFactory;
