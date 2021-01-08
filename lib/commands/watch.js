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
const path_1 = require("path");
const ts = __importStar(require("typescript"));
const tsconfig_1 = require("../tsconfig");
class CommandWatch extends fbi_1.Command {
    constructor(factory) {
        super();
        this.factory = factory;
        this.id = 'watch';
        this.alias = 'w';
        this.description = 'watching for file changes (typescript only)';
        this.formatHost = {
            getCanonicalFileName: (path) => path,
            getCurrentDirectory: ts.sys.getCurrentDirectory,
            getNewLine: () => ts.sys.newLine
        };
    }
    disable() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.context.get('config.factory.features.typescript')
                ? false
                : 'Because there is no need to compile.';
        });
    }
    run(flags, unknow) {
        return __awaiter(this, void 0, void 0, function* () {
            this.debug(`Running command "${this.id}" from factory "${this.factory.id}" with options:`, {
                flags,
                unknow
            });
            const spinner = this.createSpinner('Start watching...').start();
            try {
                const config = tsconfig_1.getTsConfig();
                const files = yield this.glob('**/*.ts', {
                    cwd: config.compilerOptions.rootDir,
                    dot: true,
                    filesOnly: true
                });
                const { options: tsOptions, errors } = ts.convertCompilerOptionsFromJson(config.compilerOptions, process.cwd());
                if (errors.length) {
                    // don't exit
                    console.log();
                    this.error(errors.join('\n'));
                }
                const createProgram = ts.createSemanticDiagnosticsBuilderProgram;
                const host = ts.createWatchCompilerHost(files.map((f) => path_1.join(config.compilerOptions.rootDir, f)), tsOptions, ts.sys, createProgram, 
                // error
                (diagnostic) => {
                    const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
                    if (diagnostic.file && typeof diagnostic.start === 'number') {
                        const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
                        // don't exit
                        console.log();
                        this.error(`[${diagnostic.code}] ${message}`);
                        this.log(`        ${this.style.blue(diagnostic.file.fileName)} ${this.style.yellow(`(${line + 1},${character + 1})`)} \n`);
                    }
                    else {
                        // don't exit
                        console.log();
                        this.error(`[${diagnostic.code}] ${message}`);
                    }
                }, 
                // change
                (diagnostic) => {
                    const msg = ts.formatDiagnostic(diagnostic, this.formatHost);
                    if (msg.includes('Found 0 errors')) {
                        // this.clearConsole()
                        this.clear();
                        spinner.succeed(msg);
                    }
                    else {
                        spinner.fail(msg);
                    }
                });
                // You can technically override any given hook on the host, though you probably
                // don't need to.
                // Note that we're assuming `origCreateProgram` and `origPostProgramCreate`
                // doesn't use `this` at all.
                const origCreateProgram = host.createProgram;
                host.createProgram = (rootNames, options, host, oldProgram) => {
                    return origCreateProgram(rootNames, options, host, oldProgram);
                };
                const origPostProgramCreate = host.afterProgramCreate;
                host.afterProgramCreate = (program) => {
                    if (origPostProgramCreate) {
                        origPostProgramCreate(program);
                    }
                };
                // `createWatchProgram` creates an initial program, watches files, and updates
                // the program over time.
                ts.createWatchProgram(host);
            }
            catch (err) {
                spinner.fail(this.style.red(err.message));
                this.exit();
            }
        });
    }
}
exports.default = CommandWatch;
