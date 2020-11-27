import { join, relative, delimiter } from 'path'
import { utils } from 'fbi'

const resolve = (dir: string, cwd = process.cwd()) => join(cwd, dir)
const defaultRootDir = 'src'
const defaultOutDir = 'lib'

export const getTsConfig = (cwd = process.cwd()) => {
  let userConfig

  try {
    userConfig = require(resolve('tsconfig.json', cwd))
  } catch (err) {
    userConfig = {}
  }

  const rootDir = userConfig.compilerOptions?.rootDir ?? defaultRootDir
  const outDir = userConfig.compilerOptions?.outDir ?? defaultOutDir
  const baseUrl = resolve(rootDir)
  const modulesPaths = (process.env.NODE_PATH && process.env.NODE_PATH.split(delimiter)) || []

  const typesPaths = modulesPaths
    .map((p) => join(relative(baseUrl, p), '@types/*'))
    .concat(['types/*'])

  return utils.merge(
    {
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
        typeRoots: modulesPaths.map((p) => join(p, '@types')).concat(['src/types']),
        skipDefaultLibCheck: true
      },
      include: [`${baseUrl}/**/*`, 'package.json'],
      pretty: true
    },
    userConfig
  )
}
