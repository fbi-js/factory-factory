"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTsConfig = void 0;
const path_1 = require("path");
const base_json_1 = __importDefault(require("@fbi-js/tsconfig/base.json"));
const resolve = (dir, cwd = process.cwd()) => path_1.join(cwd, dir);
const defaultRootDir = 'src';
const defaultOutDir = 'lib';
const getTsConfig = (cwd = process.cwd()) => {
    var _a, _b, _c, _d;
    let userConfig;
    try {
        userConfig = require(resolve('tsconfig.json', cwd));
    }
    catch (err) {
        userConfig = {};
    }
    const rootDir = (_b = (_a = userConfig.compilerOptions) === null || _a === void 0 ? void 0 : _a.rootDir) !== null && _b !== void 0 ? _b : defaultRootDir;
    const outDir = (_d = (_c = userConfig.compilerOptions) === null || _c === void 0 ? void 0 : _c.outDir) !== null && _d !== void 0 ? _d : defaultOutDir;
    const baseUrl = resolve(rootDir);
    const modulesPaths = process.env.NODE_PATH ? process.env.NODE_PATH.split(path_1.delimiter) : [];
    const typesPaths = modulesPaths
        .map(p => path_1.join(path_1.relative(baseUrl, p), '@types/*'))
        .concat(['types/*']);
    return Object.assign(Object.assign(Object.assign({}, base_json_1.default), userConfig), { compilerOptions: Object.assign(Object.assign(Object.assign({}, base_json_1.default.compilerOptions), userConfig), { paths: {
                '*': typesPaths
            }, typeRoots: modulesPaths.map(p => path_1.join(p, '@types')).concat(['src/types']), baseUrl: './', rootDir: baseUrl, outDir, tsBuildInfoFile: 'node_modules/.cache/tsconfig.tsbuildinfo' }) });
};
exports.getTsConfig = getTsConfig;
