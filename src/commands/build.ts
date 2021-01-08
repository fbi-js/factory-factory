import { Command } from 'fbi'
import * as ts from 'typescript'
import { join, relative } from 'path'

import Factory from '..'
import { getTsConfig } from '../tsconfig'

export default class CommandBuild extends Command {
  id = 'build'
  alias = 'b'
  description = 'build for production (typescript only)'
  flags = [['-c, --clear-dist', 'remove dist folder before compiling', true]]

  constructor (public factory: Factory) {
    super()
  }

  public async disable (): Promise<boolean | string> {
    return this.context.get('config.factory.features.typescript')
      ? false
      : 'Because there is no need to compile.'
  }

  public async run (flags: any, unknow: any) {
    this.debug(
      `Running command "${this.id}" from factory "${this.factory.id}" with options:`,
      {
        flags,
        unknow
      }
    )
    const spinner = this.createSpinner('Start compiling...').start()
    try {
      const cwd = process.cwd()
      const config = getTsConfig()

      if (flags.clearDist) {
        const outDir = config.compilerOptions?.outDir
        if (outDir) {
          // remove outDir
          await this.fs.remove(join(cwd, outDir))
        }
      }

      const files = await this.glob('**/*.ts', {
        cwd: config.compilerOptions.rootDir,
        dot: true,
        filesOnly: true
      })

      const { options: tsOptions, errors } = ts.convertCompilerOptionsFromJson(
        config.compilerOptions,
        cwd
      )

      if (errors.length) {
        this.error(errors.join('\n'))
      }

      this.compile(
        files.map((f: string) => join(config.compilerOptions.rootDir, f)),
        tsOptions
      )
      console.log()
      files.map(f => this.debug(f))
      spinner.succeed('Compiled successfully')
    } catch (err) {
      spinner.fail(this.style.red(err.message))
      this.exit()
    }
  }

  private compile (fileNames: string[], options: ts.CompilerOptions) {
    const program = ts.createProgram(fileNames, options)
    const emitResult = program.emit()
    const allDiagnostics = ts
      .getPreEmitDiagnostics(program)
      .concat(emitResult.diagnostics)

    allDiagnostics.forEach(diagnostic => {
      if (diagnostic.file) {
        const {
          line,
          character
        } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start ?? 0)
        const message = ts.flattenDiagnosticMessageText(
          diagnostic.messageText,
          '\n'
        )
        const relativeFilePath = relative(
          process.cwd(),
          diagnostic.file.fileName
        )
        this.warn(`${relativeFilePath} (${line + 1},${character + 1}): `)
        this.log(message)
      } else {
        this.warn(
          `${ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')}`
        )
      }
    })
  }
}
