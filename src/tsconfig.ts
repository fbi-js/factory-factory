import { join, relative, delimiter } from 'path'

const resolve = (dir: string) => join(process.cwd(), dir)

export const getTsConfig = () => {
  let userConfig

  try {
    userConfig = require(join(process.cwd(), 'tsconfig.json'))
  } catch (err) {
    userConfig = {}
  }

  const baseUrl = resolve(
    userConfig.compilerOptions && userConfig.compilerOptions.rootDir
      ? userConfig.compilerOptions.rootDir
      : 'src'
  )
  const modulesPaths = (process.env.NODE_PATH && process.env.NODE_PATH.split(delimiter)) || []

  const typesPaths = modulesPaths
    .map(p => join(relative(baseUrl, p), '@types/*'))
    .concat(['types/*'])

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
      typeRoots: modulesPaths.map(p => join(p, '@types')).concat(['src/types']),
      skipDefaultLibCheck: true
    },
    include: [`${baseUrl}/**/*`],
    pretty: true,
    ...userConfig
  }
}
