"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const ejs = __importStar(require("ejs"));
const path_1 = require("path");
const fbi_1 = require("fbi");
const { capitalizeEveryWord } = fbi_1.utils;
class TemplateCommand extends fbi_1.Template {
    constructor(factory) {
        super(factory);
        this.factory = factory;
        this.id = 'command';
        this.description = 'template for factory command';
        this.path = path_1.join(__dirname, '../../../templates/factory');
        this.renderer = ejs.render;
    }
    async gathering() {
        const { command } = (await this.prompt({
            type: 'Form',
            name: 'command',
            message: 'Please provide the following information:',
            choices: [
                { name: 'id', message: 'ID' },
                { name: 'alias', message: 'Alias' },
                { name: 'description', message: 'Description' }
            ],
            validate({ id }) {
                return !!id.trim() || 'ID is required. e.g.: serve, build';
            }
        }));
        this.data.command = command || {};
        this.data.command.capitalizedId = capitalizeEveryWord(command.id);
        const factory = this.context.get('config.factory');
        this.features = (factory === null || factory === void 0 ? void 0 : factory.features) || {};
        this.spinner = this.createSpinner(`Creating command...`).start(`Creating command ${this.style.bold.green(command.id)} via ${this.id} from ${factory.template}...`);
    }
    async writing() {
        const debug = !!this.context.get('debug');
        this.targetDir = process.cwd();
        const { command } = this.data;
        const from = this.features.typescript ? 'src/command.ts' : 'lib/command.js';
        const to = this.features.typescript
            ? `src/commands/${command.id}.ts`
            : `lib/commands/${command.id}.js`;
        // check file exist
        if (await this.fs.pathExists(path_1.join(this.targetDir, to))) {
            this.spinner.stop();
            const { action } = (await this.prompt({
                type: 'select',
                name: 'action',
                message: `Command "${command.id}" already exist, please choose an action:`,
                choices: ['Cancel', 'Override']
            }));
            if (action === 'Cancel') {
                this.exit();
            }
        }
        this.files = {
            render: [
                {
                    from,
                    to,
                    data: command
                }
            ],
            renderOptions: {
                async: true,
                debug,
                compileDebug: debug
            }
        };
        this.spinner.succeed(`Created command ${this.style.cyan.bold(this.data.command.id)}`);
    }
    async ending() {
        const { command } = this.data;
        const commandFullId = `Command${command.capitalizedId}`;
        if (this.errors) {
            this.spinner.fail(`Failed to created command ${this.style.cyan.bold(command.id)}.`);
            this.error(this.errors);
        }
        let extraInfo = '';
        try {
            const { name } = require(path_1.join(this.targetDir, 'package.json'));
            if (name) {
                extraInfo = `
  ${this.style.bold('$')} ${this.style.cyan(`fbi list ${name}`)} to check command registration`;
            }
        }
        catch (err) { }
        this.log(`
Next steps:
  add${this.style.cyan(`
    import ${commandFullId} from './commands/${command.id}'`)}
  and${this.style.cyan(`
    new ${commandFullId}(this)`)}
  to "src/index.${this.features.typescript ? 'ts' : 'js'}".

  ${this.style.bold('$')} ${this.style.cyan('fbi build')}
  ${this.style.bold('$')} ${this.style.cyan('fbi link')}${extraInfo}
    `);
    }
}
exports.default = TemplateCommand;
