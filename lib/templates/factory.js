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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ejs = __importStar(require("ejs"));
const path_1 = require("path");
const fbi_1 = require("fbi");
const command_1 = __importDefault(require("./factory/command"));
const template_1 = __importDefault(require("./factory/template"));
const { formatName, capitalizeEveryWord, isValidObject } = fbi_1.utils;
class TemplateFactory extends fbi_1.Template {
    constructor(factory) {
        super(factory);
        this.factory = factory;
        this.id = 'factory';
        this.description = 'template for fbi factory';
        this.path = path_1.join(__dirname, '../../templates/factory');
        this.renderer = ejs.render;
        this.templates = [new command_1.default(this.factory), new template_1.default(this.factory)];
    }
    gathering() {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            const defaultName = (_c = (_b = (_a = this.data) === null || _a === void 0 ? void 0 : _a.project) === null || _b === void 0 ? void 0 : _b.name) !== null && _c !== void 0 ? _c : 'factory-demo';
            this.data.factoryVersion = require('../../package.json').version;
            this.data.project = yield this.prompt([
                {
                    type: 'input',
                    name: 'name',
                    message: 'Input the factory name',
                    initial() {
                        return defaultName;
                    },
                    validate(value) {
                        const name = formatName(value);
                        return (name && true) || 'please input a valid factory name';
                    }
                },
                {
                    type: 'input',
                    name: 'description',
                    message: 'Input factory description',
                    initial({ state }) {
                        return `factory ${state.answers.name} description`;
                    }
                },
                {
                    type: 'MultiSelect',
                    name: 'features',
                    message: 'Choose features for your project:',
                    hint: '(Use <space> to select, <return> to submit)',
                    choices: [{ name: 'typescript', value: true }],
                    result(names) {
                        return this.map(names);
                    }
                },
                {
                    type: 'list',
                    name: 'commands',
                    message: 'Input comma-separated names of the commands to generate:',
                    initial: ['build'],
                    result(names) {
                        return [...new Set(formatName(names))].map((id) => ({
                            id,
                            capitalizedId: capitalizeEveryWord(id),
                            alias: '',
                            args: '',
                            flags: '',
                            description: ''
                        }));
                    }
                },
                {
                    type: 'list',
                    name: 'templates',
                    message: 'Input comma-separated names of the templates to generate:',
                    initial: ['default'],
                    result(names) {
                        return [...new Set(formatName(names))].map((id) => ({
                            id,
                            capitalizedId: capitalizeEveryWord(id),
                            description: ''
                        }));
                    }
                }
            ]);
            this.data.project.nameCapitalized = capitalizeEveryWord(this.data.project.name);
            const { factory, project } = this.data;
            this.spinner = this.createSpinner('Creating project...').start(`Creating ${this.style.bold.green(project.name)} via ${factory.id} from ${factory.template}...`);
        });
    }
    writing() {
        return __awaiter(this, void 0, void 0, function* () {
            const debug = !!this.context.get('debug');
            const { project } = this.data;
            this.files = {
                copy: [
                    '.editorconfig',
                    '.gitignore',
                    ...project.templates.map(({ id }) => ({
                        from: 'templates/default',
                        to: `templates/${id}`,
                        options: {
                        // Docs: https://github.com/jprichardson/node-fs-extra/blob/master/docs/copy.md#copysrc-dest-options-callback
                        // - overwrite <boolean>: overwrite existing file or directory, default is true. Note that the copy operation will silently fail if you set this to false and the destination exists. Use the errorOnExist option to change this behavior.
                        // - errorOnExist <boolean>: when overwrite is false and the destination exists, throw an error. Default is false.
                        // - dereference <boolean>: dereference symlinks, default is false.
                        // - preserveTimestamps <boolean>: When true, will set last modification and access times to the ones of the original source files. When false, timestamp behavior is OS-dependent. Default is false.
                        // - filter <Function>: Function to filter copied files. Return true to include, false to exclude. Can also return a Promise that resolves to true or false (or pass in an async function).
                        // filter: (from: string, to: string) => {
                        //   console.log('filter:', { from, to })
                        //   return true
                        // }
                        }
                    }))
                ],
                render: [
                    'package.json',
                    'README.md',
                    project.features.typescript ? 'src/index.ts' : 'lib/index.js',
                    ...project.commands.map((data) => ({
                        from: project.features.typescript ? 'src/command.ts' : 'lib/command.js',
                        to: project.features.typescript
                            ? `src/commands/${data.id}.ts`
                            : `lib/commands/${data.id}.js`,
                        data
                    })),
                    ...project.templates.map((data) => ({
                        from: project.features.typescript ? 'src/template.ts' : 'lib/template.js',
                        to: project.features.typescript
                            ? `src/templates/${data.id}.ts`
                            : `lib/templates/${data.id}.js`,
                        data
                    }))
                ],
                renderOptions: {
                    async: true,
                    debug,
                    compileDebug: debug
                }
            };
        });
    }
    installing(flags) {
        return __awaiter(this, void 0, void 0, function* () {
            const { project } = this.data;
            this.spinner.succeed(`Created project ${this.style.cyan.bold(project.name)}`);
            const { dependencies, devDependencies } = require(path_1.join(this.targetDir, 'package.json'));
            if (isValidObject(dependencies) || isValidObject(devDependencies)) {
                const installSpinner = this.createSpinner('Installing dependencies...').start();
                try {
                    yield this.installDeps(this.targetDir, flags.packageManager, false);
                    installSpinner.succeed('Installed dependencies');
                }
                catch (err) {
                    installSpinner.fail('Failed to install dependencies. You can install them manually.');
                    this.error(err);
                }
            }
        });
    }
    ending() {
        return __awaiter(this, void 0, void 0, function* () {
            const { project } = this.data;
            const projectName = this.style.cyan.bold(project.name);
            if (this.errors) {
                this.spinner.fail(`Failed to created project ${projectName}.`);
                this.error(this.errors);
            }
            console.log('\nNext steps:');
            if (this.data.subDirectory) {
                console.log(`
  $ ${this.style.cyan(`cd ${this.data.subDirectory}`)}`);
            }
            if (project.features.typescript) {
                console.log(`
  ${this.style.dim('1. run the first compile')}
  $ ${this.style.cyan('fbi build')}

  ${this.style.dim('2. link the factory to the store for testing')}
  $ ${this.style.cyan('fbi link')}

  ${this.style.dim('3. watching for file changes')}
  $ ${this.style.cyan('fbi watch')}

  ${this.style.dim('4. change some code and start testing')}
  $ ${this.style.cyan('cd another/directory')}
  $ ${this.style.cyan('fbi list')} ${this.style.dim(`the factory "${project.name}" should be listed"`)}
  $ ${this.style.cyan('fbi create')} ${this.style.dim('select a template you just created')}

  ${this.style.dim('5. remove the factory from the store after tested')}
  $ ${this.style.cyan(`fbi remove ${project.name}`)}`);
            }
            else {
                console.log(`
  ${this.style.dim('1. link the factory to the store for testing')}
  $ ${this.style.cyan('fbi link')}

  ${this.style.dim('2. change some code and start testing')}
  $ ${this.style.cyan('cd another/directory')}
  $ ${this.style.cyan('fbi list')} ${this.style.dim(`the factory "${project.name}" should be listed"`)}
  $ ${this.style.cyan('fbi create')} ${this.style.dim('select a template you just created')}

  ${this.style.dim('3. remove the factory from the store after tested')}
  $ ${this.style.cyan(`fbi remove ${project.name}`)}`);
            }
        });
    }
}
exports.default = TemplateFactory;
