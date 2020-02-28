"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const fbi_1 = require("fbi");
const ejs = require("ejs");
const utils_1 = require("fbi/lib/utils");
class TemplateCommand extends fbi_1.Template {
    constructor(factory) {
        super();
        this.factory = factory;
        this.id = 'command';
        this.description = 'template for factory command';
        this.path = 'templates/factory';
        this.renderer = ejs.render;
    }
    async gathering() {
        const { command } = await this.prompt({
            type: 'Form',
            name: 'command',
            message: 'Please provide the following information:',
            choices: [
                { name: 'id', message: 'ID', initial: 'my-command' },
                { name: 'alias', message: 'Alias', initial: '' },
                { name: 'description', message: 'Description', initial: '' },
                { name: 'args', message: 'Arguments', initial: '' },
                // TODO:
                { name: 'flags', message: 'Flags', initial: '' }
            ]
        });
        this.data.command = command || {};
        this.data.command.capitalizedId = utils_1.capitalizeEveryWord(command.id);
        const factory = this.context.get('config.factory');
        this.features = (factory === null || factory === void 0 ? void 0 : factory.features) || {};
        this.spinner = this.createSpinner(`Creating command...`).start(`Creating command ${this.style.bold.green(command.id)} via ${this.id} from ${factory.template}...`);
    }
    async writing() {
        this.targetDir = process.cwd();
        const { command } = this.data;
        const from = this.features.typescript ? 'src/command.ts' : 'lib/command.js';
        const to = this.features.typescript
            ? `src/commands/${command.id}.ts`
            : `lib/commands/${command.id}.js`;
        // check file exist
        if (await this.fs.pathExists(path_1.join(this.targetDir, to))) {
            this.spinner.stop();
            const { action } = await this.prompt({
                type: 'select',
                name: 'action',
                message: `Command "${command.id}" already exist, please choose an action:`,
                choices: ['Cancel', 'Override']
            });
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
            ]
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
