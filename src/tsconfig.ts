import { join, relative, delimiter } from 'path'
import baseConfig from '@fbi-js/tsconfig/base.json'

const resolve = (dir: string, cwd = process.cwd()): string => join(cwd, dir)
const defaultRootDir = 'src'
const defaultOutDir = 'lib'

export const getTsConfig = (cwd = process.cwd()): Record<string, any> => {
  let userConfig

  try {
    userConfig = require(resolve('tsconfig.json', cwd))
  } catch (err) {
    userConfig = {}
  }

  const rootDir = userConfig.compilerOptions?.rootDir ?? defaultRootDir
  const outDir = userConfig.compilerOptions?.outDir ?? defaultOutDir
  const baseUrl = resolve(rootDir)
  const modulesPaths = process.env.NODE_PATH ? process.env.NODE_PATH.split(delimiter) : []

  const typesPaths = modulesPaths
    .map(p => join(relative(baseUrl, p), '@types/*'))
    .concat(['types/*'])

  return {
    ...baseConfig,
    ...userConfig,
    compilerOptions: {
      ...baseConfig.compilerOptions,
      ...userConfig,
      paths: {
        '*': typesPaths
      },
      typeRoots: modulesPaths.map(p => join(p, '@types')).concat(['src/types']),
      baseUrl: './',
      rootDir: baseUrl,
      outDir,
      tsBuildInfoFile: 'node_modules/.cache/tsconfig.tsbuildinfo'
    }
  }
}
