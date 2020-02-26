"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const resolve = (dir) => path_1.join(process.cwd(), dir);
exports.getTsConfig = () => {
    let userConfig;
    try {
        userConfig = require(path_1.join(process.cwd(), 'tsconfig.json'));
    }
    catch (err) {
        userConfig = {};
    }
    const baseUrl = resolve(userConfig.compilerOptions && userConfig.compilerOptions.rootDir
        ? userConfig.compilerOptions.rootDir
        : 'src');
    const modulesPaths = (process.env.NODE_PATH && process.env.NODE_PATH.split(path_1.delimiter)) || [];
    const typesPaths = modulesPaths
        .map(p => path_1.join(path_1.relative(baseUrl, p), '@types/*'))
        .concat(['types/*']);
    return {
        compilerOptions: {
            target: 'es2015',
            module: 'commonjs',
            lib: ['esnext'],
            rootDir: resolve('src'),
            outDir: resolve('lib'),
            moduleResolution: 'node',
            emitDecoratorMetadata: true,
            experimentalDecorators: true,
            allowSyntheticDefaultImports: true,
            baseUrl,
            paths: {
                '*': typesPaths
            },
            typeRoots: modulesPaths.map(p => path_1.join(p, '@types')).concat(['src/types']),
            skipDefaultLibCheck: true
        },
        include: [`${baseUrl}/**/*`],
        pretty: true,
        ...userConfig
    };
};
