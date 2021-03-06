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
        this.flags = [['-c, --clear-dist', 'remove dist folder before compiling', true]];
    }
    disable() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.context.get('config.factory.features.typescript')
                ? false
                : 'Because there is no need to compile.';
        });
    }
    run(flags, unknow) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            this.debug(`Running command "${this.id}" from factory "${this.factory.id}" with options:`, {
                flags,
                unknow
            });
            const spinner = this.createSpinner('Start compiling...').start();
            try {
                const cwd = process.cwd();
                const config = tsconfig_1.getTsConfig();
                if (flags.clearDist) {
                    const outDir = (_a = config.compilerOptions) === null || _a === void 0 ? void 0 : _a.outDir;
                    if (outDir) {
                        // remove outDir
                        yield this.fs.remove(path_1.join(cwd, outDir));
                    }
                }
                const files = yield this.glob('**/*.ts', {
                    cwd: config.compilerOptions.rootDir,
                    dot: true,
                    filesOnly: true
                });
                const { options: tsOptions, errors } = ts.convertCompilerOptionsFromJson(config.compilerOptions, cwd);
                if (errors.length) {
                    this.error(`\ntsconfig error:`);
                    for (const err of errors) {
                        if (err && err.messageText) {
                            this.error(err.messageText);
                        }
                    }
                }
                this.compile(files.map((f) => path_1.join(config.compilerOptions.rootDir, f)), tsOptions);
                console.log();
                files.map(f => this.debug(f));
                spinner.succeed('Compiled successfully');
            }
            catch (err) {
                spinner.fail(this.style.red(err.message));
                this.exit();
            }
        });
    }
    compile(fileNames, options) {
        const program = ts.createProgram(fileNames, options);
        const emitResult = program.emit();
        const allDiagnostics = ts
            .getPreEmitDiagnostics(program)
            .concat(emitResult.diagnostics);
        allDiagnostics.forEach(diagnostic => {
            var _a;
            if (diagnostic.file) {
                const { line, character } = diagnostic.file.getLineAndCharacterOfPosition((_a = diagnostic.start) !== null && _a !== void 0 ? _a : 0);
                const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
                const relativeFilePath = path_1.relative(process.cwd(), diagnostic.file.fileName);
                this.warn(`${relativeFilePath} (${line + 1},${character + 1}): `);
                this.log(message);
            }
            else {
                this.warn(`${ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')}`);
            }
        });
    }
}
exports.default = CommandBuild;
