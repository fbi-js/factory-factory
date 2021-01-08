import { Command } from 'fbi'
import { join } from 'path'
import * as ts from 'typescript'

import Factory from '..'
import { getTsConfig } from '../tsconfig'

export default class CommandWatch extends Command {
  id = 'watch'
  alias = 'w'
  description = 'watching for file changes (typescript only)'
  formatHost: ts.FormatDiagnosticsHost = {
    getCanonicalFileName: (path) => path,
    getCurrentDirectory: ts.sys.getCurrentDirectory,
    getNewLine: () => ts.sys.newLine
  }

  constructor (public factory: Factory) {
    super()
  }

  public async disable (): Promise<boolean | string> {
    return this.context.get('config.factory.features.typescript')
      ? false
      : 'Because there is no need to compile.'
  }

  public async run (flags: any, unknow: any): Promise<void> {
    this.debug(`Running command "${this.id}" from factory "${this.factory.id}" with options:`, {
      flags,
      unknow
    })

    const spinner = this.createSpinner('Start watching...').start()
    try {
      const config = getTsConfig()
      const files = await this.glob('**/*.ts', {
        cwd: config.compilerOptions.rootDir,
        dot: true,
        filesOnly: true
      })
      const { options: tsOptions, errors } = ts.convertCompilerOptionsFromJson(
        config.compilerOptions,
        process.cwd()
      )
      if (errors.length) {
        // don't exit
        console.log()
        this.error(errors.join('\n'))
      }

      const createProgram = ts.createSemanticDiagnosticsBuilderProgram
      const host = ts.createWatchCompilerHost(
        files.map((f: string) => join(config.compilerOptions.rootDir, f)),
        tsOptions,
        ts.sys,
        createProgram,
        // error
        (diagnostic: ts.Diagnostic) => {
          const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')
          if (diagnostic.file && typeof diagnostic.start === 'number') {
            const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(
              diagnostic.start
            )
            // don't exit
            console.log()
            this.error(`[${diagnostic.code}] ${message}`)
            this.log(
              `        ${this.style.blue(diagnostic.file.fileName)} ${this.style.yellow(
                `(${line + 1},${character + 1})`
              )} \n`
            )
          } else {
            // don't exit
            console.log()
            this.error(`[${diagnostic.code}] ${message}`)
          }
        },
        // change
        (diagnostic: ts.Diagnostic) => {
          const msg = ts.formatDiagnostic(diagnostic, this.formatHost)
          if (msg.includes('Found 0 errors')) {
            // this.clearConsole()
            this.clear()
            spinner.succeed(msg)
          } else {
            spinner.fail(msg)
          }
        }
      )

      // You can technically override any given hook on the host, though you probably
      // don't need to.
      // Note that we're assuming `origCreateProgram` and `origPostProgramCreate`
      // doesn't use `this` at all.
      const origCreateProgram = host.createProgram
      host.createProgram = (
        rootNames: readonly string[] | undefined,
        options,
        host,
        oldProgram
      ) => {
        return origCreateProgram(rootNames, options, host, oldProgram)
      }
      const origPostProgramCreate = host.afterProgramCreate
      host.afterProgramCreate = (program) => {
        if (origPostProgramCreate) {
          origPostProgramCreate(program)
        }
      }

      // `createWatchProgram` creates an initial program, watches files, and updates
      // the program over time.
      ts.createWatchProgram(host)
    } catch (err) {
      spinner.fail(this.style.red(err.message))
      this.exit()
    }
  }
}
