"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const path_1 = require("path");
const fbi_1 = require("fbi");
const ejs = tslib_1.__importStar(require("ejs"));
const utils_1 = require("fbi/lib/utils");
const command_1 = tslib_1.__importDefault(require("./factory/command"));
const template_1 = tslib_1.__importDefault(require("./factory/template"));
class TemplateFactory extends fbi_1.Template {
    constructor(factory) {
        super();
        this.factory = factory;
        this.id = 'factory';
        this.description = 'template for fbi factory';
        this.path = 'templates/factory';
        this.renderer = ejs.render;
        this.templates = [new command_1.default(this.factory), new template_1.default(this.factory)];
    }
    async gathering() {
        const defaultName = (this.data.project && this.data.project.name) || 'factory-demo';
        this.data.project = await this.prompt([
            {
                type: 'input',
                name: 'name',
                message: 'Input the factory name',
                initial({ enquirer }) {
                    return defaultName;
                },
                validate(value) {
                    const name = utils_1.formatName(value);
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
                message: `Choose features for your project:`,
                hint: '(Use <space> to select, <return> to submit)',
                choices: [{ name: 'typescript', value: true }],
                result(names) {
                    return this.map(names);
                }
            },
            {
                type: 'list',
                name: 'commands',
                message: `Input comma-separated names of the commands to generate:`,
                initial: ['build'],
                result(names) {
                    return [...new Set(utils_1.formatName(names))].map((id) => ({
                        id,
                        capitalizedId: utils_1.capitalizeEveryWord(id),
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
                message: `Input comma-separated names of the templates to generate:`,
                initial: ['default'],
                result(names) {
                    return [...new Set(utils_1.formatName(names))].map((id) => ({
                        id,
                        capitalizedId: utils_1.capitalizeEveryWord(id),
                        description: ''
                    }));
                }
            }
        ]);
        this.data.project.nameCapitalized = utils_1.capitalizeEveryWord(this.data.project.name);
        const { factory, project } = this.data;
        this.spinner = this.createSpinner(`Creating project...`).start(`Creating ${this.style.bold.green(project.name)} via ${factory.id} from ${factory.template}...`);
    }
    async writing() {
        const debug = !!this.context.get('debug');
        const { project } = this.data;
        this.files = {
            copy: [
                '.editorconfig',
                '.prettierrc',
                '.gitignore',
                project.features.typescript ? 'tsconfig.json' : '',
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
                '.fbi.config.js',
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
    }
    async installing(flags) {
        const { project } = this.data;
        this.spinner.succeed(`Created project ${this.style.cyan.bold(project.name)}`);
        const { dependencies, devDependencies } = require(path_1.join(this.targetDir, 'package.json'));
        if (utils_1.isValidObject(dependencies) || utils_1.isValidObject(devDependencies)) {
            const installSpinner = this.createSpinner(`Installing dependencies...`).start();
            try {
                const packageManager = flags.packageManager || this.context.get('config').packageManager;
                const cmds = packageManager === 'yarn' ? [packageManager] : [packageManager, 'install'];
                this.debug(`\nrunning \`${cmds.join(' ')}\` in ${this.targetDir}`);
                await this.exec(cmds[0], cmds.slice(1), {
                    cwd: this.targetDir
                });
                installSpinner.succeed(`Installed dependencies`);
            }
            catch (err) {
                installSpinner.fail('Failed to install dependencies. You can install them manually.');
                this.error(err);
            }
        }
    }
    async ending() {
        const { project } = this.data;
        const projectName = this.style.cyan.bold(project.name);
        if (this.errors) {
            this.spinner.fail(`Failed to created project ${projectName}.`);
            this.error(this.errors);
        }
        console.log(`\nNext steps:\n`);
        if (project.features.typescript) {
            console.log(`
  ${this.style.dim(`1. run the first compile`)}
  $ ${this.style.cyan('fbi build')}

  ${this.style.dim('2. link the factory to the store for testing')}
  $ ${this.style.cyan('fbi link')}

  ${this.style.dim('3. watching for file changes')}
  $ ${this.style.cyan('fbi watch')}

  ${this.style.dim('4. change some code and start testing')}
  $ ${this.style.cyan('cd another/directory')}
  $ ${this.style.cyan('fbi list')} ${this.style.dim(`the factory "${project.name}" should be listed"`)}
  $ ${this.style.cyan(`fbi create`)} ${this.style.dim('select a template you just created')}

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
  $ ${this.style.cyan(`fbi create`)} ${this.style.dim('select a template you just created')}

  ${this.style.dim('3. remove the factory from the store after tested')}
  $ ${this.style.cyan(`fbi remove ${project.name}`)}`);
        }
    }
}
exports.default = TemplateFactory;
