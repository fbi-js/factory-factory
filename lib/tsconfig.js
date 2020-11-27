"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTsConfig = void 0;
const path_1 = require("path");
const fbi_1 = require("fbi");
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
    const modulesPaths = (process.env.NODE_PATH && process.env.NODE_PATH.split(path_1.delimiter)) || [];
    const typesPaths = modulesPaths
        .map((p) => path_1.join(path_1.relative(baseUrl, p), '@types/*'))
        .concat(['types/*']);
    return fbi_1.utils.merge({
        compilerOptions: {
            target: 'es2017',
            module: 'commonjs',
            lib: ['esnext'],
            rootDir: baseUrl,
            outDir,
            moduleResolution: 'node',
            emitDecoratorMetadata: true,
            experimentalDecorators: true,
            allowSyntheticDefaultImports: true,
            baseUrl,
            paths: {
                '*': typesPaths
            },
            typeRoots: modulesPaths.map((p) => path_1.join(p, '@types')).concat(['src/types']),
            skipDefaultLibCheck: true
        },
        include: [`${baseUrl}/**/*`, 'package.json'],
        pretty: true
    }, userConfig);
};
exports.getTsConfig = getTsConfig;
