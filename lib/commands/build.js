"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fbi_1 = require("fbi");
const ts = require("typescript");
const path_1 = require("path");
const tsconfig_1 = require("../tsconfig");
class CommandBuild extends fbi_1.Command {
    constructor(factory) {
        super();
        this.factory = factory;
        this.id = 'build';
        this.alias = 'b';
        this.args = '';
        this.flags = [['-e, --env', 'building for the environment', 'prod']];
        this.description = 'build for production (typescript only)';
    }
    async disable() {
        return this.context.get('config.factory.features.typescript')
            ? false
            : 'Because there is no need to compile.';
    }
    async run(flags) {
        this.debug(`Factory: (${this.factory.id})`, 'from command', this.id, flags);
        const spinner = this.createSpinner(`Start compiling...`).start();
        try {
            const config = tsconfig_1.getTsConfig();
            const files = await this.glob('**/*.ts', {
                cwd: config.compilerOptions.rootDir,
                dot: true,
                filesOnly: true
            });
            const { options: tsOptions, errors } = ts.convertCompilerOptionsFromJson(config.compilerOptions, process.cwd());
            if (errors.length) {
                this.error(errors.join('\n'));
            }
            const { code } = this.compile(files.map((f) => path_1.join(config.compilerOptions.rootDir, f)), tsOptions);
            spinner.succeed('Compiled successfully');
        }
        catch (err) {
            spinner.fail(this.style.red(err.message));
            this.exit();
        }
    }
    compile(fileNames, options) {
        const program = ts.createProgram(fileNames, options);
        const emitResult = program.emit();
        const allDiagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);
        allDiagnostics.forEach(diagnostic => {
            if (diagnostic.file) {
                const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start || 0);
                const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
                const relativeFilePath = path_1.relative(process.cwd(), diagnostic.file.fileName);
                this.warn(`${relativeFilePath} (${line + 1},${character + 1}): `);
                this.log(message);
            }
            else {
                this.warn(`${ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')}`);
            }
        });
        return {
            code: emitResult.emitSkipped ? 1 : 0
        };
    }
}
exports.default = CommandBuild;
