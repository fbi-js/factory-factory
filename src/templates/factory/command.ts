import * as ejs from 'ejs'
import { join } from 'path'
import { Template, utils } from 'fbi'

import Factory from '../..'

const { capitalizeEveryWord } = utils

export default class TemplateCommand extends Template {
  id = 'command'
  description = 'template for factory command'
  path = 'templates/factory'
  renderer = ejs.render

  constructor(public factory: Factory) {
    super()
  }

  protected async gathering() {
    const { command } = (await this.prompt({
      type: 'Form',
      name: 'command',
      message: 'Please provide the following information:',
      choices: [
        { name: 'id', message: 'ID' },
        { name: 'alias', message: 'Alias' },
        { name: 'description', message: 'Description' }
      ],
      validate({ id }: any) {
        return !!id.trim() || 'ID is required. e.g.: serve, build'
      }
    } as any)) as any
    this.data.command = command || {}
    this.data.command.capitalizedId = capitalizeEveryWord(command.id)

    const factory = this.context.get('config.factory')
    this.features = factory?.features || {}

    this.spinner = this.createSpinner(`Creating command...`).start(
      `Creating command ${this.style.bold.green(command.id)} via ${this.id} from ${
        factory.template
      }...`
    )
  }

  protected async writing() {
    const debug = !!this.context.get('debug')
    this.targetDir = process.cwd()
    const { command } = this.data
    const from = this.features.typescript ? 'src/command.ts' : 'lib/command.js'
    const to = this.features.typescript
      ? `src/commands/${command.id}.ts`
      : `lib/commands/${command.id}.js`

    // check file exist
    if (await this.fs.pathExists(join(this.targetDir, to))) {
      this.spinner.stop()
      const { action } = (await this.prompt({
        type: 'select',
        name: 'action',
        message: `Command "${command.id}" already exist, please choose an action:`,
        choices: ['Cancel', 'Override']
      })) as any

      if (action === 'Cancel') {
        this.exit()
      }
    }

    this.files = {
      render: [
        {
          from,
          to,
          data: command
        }
      ],
      renderOptions: {
        async: true,
        debug,
        compileDebug: debug
      }
    }
    this.spinner.succeed(`Created command ${this.style.cyan.bold(this.data.command.id)}`)
  }

  protected async ending() {
    const { command } = this.data
    const commandFullId = `Command${command.capitalizedId}`
    if (this.errors) {
      this.spinner.fail(`Failed to created command ${this.style.cyan.bold(command.id)}.`)
      this.error(this.errors)
    }

    let extraInfo = ''
    try {
      const { name } = require(join(this.targetDir, 'package.json'))
      if (name) {
        extraInfo = `
  ${this.style.bold('$')} ${this.style.cyan(`fbi list ${name}`)} to check command registration`
      }
    } catch (err) {}

    this.log(`
Next steps:
  add${this.style.cyan(`
    import ${commandFullId} from './commands/${command.id}'`)}
  and${this.style.cyan(`
    new ${commandFullId}(this)`)}
  to "src/index.${this.features.typescript ? 'ts' : 'js'}".

  ${this.style.bold('$')} ${this.style.cyan('fbi build')}
  ${this.style.bold('$')} ${this.style.cyan('fbi link')}${extraInfo}
    `)
  }
}
