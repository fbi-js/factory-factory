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
const fbi_1 = require("fbi");
const ts = __importStar(require("typescript"));
const path_1 = require("path");
const tsconfig_1 = require("../tsconfig");
class CommandBuild extends fbi_1.Command {
    constructor(factory) {
        super();
        this.factory = factory;
        this.id = 'build';
        this.alias = 'b';
        this.description = 'build for production (typescript only)';
    }
    async disable() {
        return this.context.get('config.factory.features.typescript')
            ? false
            : 'Because there is no need to compile.';
    }
    async run(flags, unknow) {
        this.debug(`Running command "${this.id}" from factory "${this.factory.id}" with options:`, {
            flags,
            unknow
        });
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
            this.compile(files.map((f) => path_1.join(config.compilerOptions.rootDir, f)), tsOptions);
            console.log();
            files.map((f) => this.debug(f));
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
        allDiagnostics.forEach((diagnostic) => {
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
