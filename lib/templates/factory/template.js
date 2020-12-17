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
class TemplateTemplate extends fbi_1.Template {
    constructor(factory) {
        super(factory);
        this.factory = factory;
        this.id = 'template';
        this.description = 'template for factory template';
        this.path = path_1.join(__dirname, '../../../templates/factory');
        this.renderer = ejs.render;
    }
    async gathering() {
        const { template } = (await this.prompt({
            type: 'Form',
            name: 'template',
            message: 'Please provide the following information:',
            choices: [
                { name: 'id', message: 'ID' },
                { name: 'description', message: 'Description' }
            ],
            validate({ id }) {
                return !!id.trim() || 'ID is required. e.g.: vue, react';
            }
        }));
        this.data.template = template || {};
        this.data.template.capitalizedId = capitalizeEveryWord(template.id);
        const factory = this.context.get('config.factory');
        this.features = (factory === null || factory === void 0 ? void 0 : factory.features) || {};
    }
    async checking() {
        const { factory, template } = this.data;
        this.targetDir = process.cwd();
        const dirExist = await this.fs.pathExists(path_1.join(this.targetDir, 'templates', template.id));
        const fileExist = await this.fs.pathExists(path_1.join(this.targetDir, this.features.typescript ? 'src' : 'lib', template.id + this.features.typescript ? 'ts' : 'js'));
        if (dirExist) {
            this.error(`template directory "${template.id}" already exist`).exit();
        }
        if (fileExist) {
            this.error(`template file "${template.id}" already exist`).exit();
        }
        this.spinner = this.createSpinner(`Creating template...`).start(`Creating template ${this.style.bold.green(template.id)} via ${this.id} from ${factory.template}...`);
    }
    async writing() {
        const debug = !!this.context.get('debug');
        const { template } = this.data;
        const from = this.features.typescript ? 'src/template.ts' : 'lib/template.js';
        const to = this.features.typescript
            ? `src/templates/${template.id}.ts`
            : `lib/templates/${template.id}.js`;
        this.files = {
            render: [
                {
                    from,
                    to,
                    data: template
                }
            ],
            copy: [
                {
                    from: 'templates/default',
                    to: `templates/${template.id}`
                }
            ],
            renderOptions: {
                async: true,
                debug,
                compileDebug: debug
            }
        };
        this.spinner.succeed(`Created template ${this.style.cyan.bold(this.data.template.id)}`);
    }
    async ending() {
        const { template } = this.data;
        const templateFullId = `Template${template.capitalizedId}`;
        if (this.errors) {
            this.spinner.fail(`Failed to created template ${this.style.cyan.bold(template.id)}.`);
            this.error(this.errors);
        }
        let extraInfo = '';
        try {
            const { name } = require(path_1.join(this.targetDir, 'package.json'));
            if (name) {
                extraInfo = `
  ${this.style.bold('$')} ${this.style.cyan(`fbi list ${name}`)} to check template registration`;
            }
        }
        catch (err) { }
        if (this.features.typescript) {
            this.log(`
Next steps:
  add${this.style.cyan(`
    import ${templateFullId} from './templates/${template.id}'`)}
  and${this.style.cyan(`
    new ${templateFullId}(this)`)}
  to "src/index.ts".

  ${this.style.bold('$')} ${this.style.cyan('fbi build')}
  ${this.style.bold('$')} ${this.style.cyan('fbi link')}${extraInfo}
    `);
        }
        else {
            this.log(`
Next steps:
  add${this.style.cyan(`
    const ${templateFullId} = require('./templates/${template.id}')`)}
  and${this.style.cyan(`
    new ${templateFullId}(this)`)}
  to "lib/index.js".

  ${this.style.bold('$')} ${this.style.cyan('fbi link')}${extraInfo}
    `);
        }
    }
}
exports.default = TemplateTemplate;
