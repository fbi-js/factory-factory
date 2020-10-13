import * as ejs from 'ejs'
import { join } from 'path'
import { Template, utils } from 'fbi'

import Factory from '../..'

const { capitalizeEveryWord } = utils

export default class TemplateTemplate extends Template {
  id = 'template'
  description = 'template for factory template'
  path = 'templates/factory'
  renderer = ejs.render

  constructor(public factory: Factory) {
    super()
  }

  protected async gathering() {
    const { template } = (await this.prompt({
      type: 'Form',
      name: 'template',
      message: 'Please provide the following information:',
      choices: [
        { name: 'id', message: 'ID' },
        { name: 'description', message: 'Description' }
      ],
      validate({ id }: any) {
        return !!id.trim() || 'ID is required. e.g.: vue, react'
      }
    } as any)) as any
    this.data.template = template || {}
    this.data.template.capitalizedId = capitalizeEveryWord(template.id)

    const factory = this.context.get('config.factory')
    this.features = factory?.features || {}
  }

  protected async checking() {
    const { factory, template } = this.data
    this.targetDir = process.cwd()
    const dirExist = await this.fs.pathExists(join(this.targetDir, 'templates', template.id))
    const fileExist = await this.fs.pathExists(
      join(
        this.targetDir,
        this.features.typescript ? 'src' : 'lib',
        template.id + this.features.typescript ? 'ts' : 'js'
      )
    )
    if (dirExist) {
      this.error(`template directory "${template.id}" already exist`).exit()
    }
    if (fileExist) {
      this.error(`template file "${template.id}" already exist`).exit()
    }

    this.spinner = this.createSpinner(`Creating template...`).start(
      `Creating template ${this.style.bold.green(template.id)} via ${this.id} from ${
        factory.template
      }...`
    )
  }

  protected async writing() {
    const debug = !!this.context.get('debug')
    const { template } = this.data
    const from = this.features.typescript ? 'src/template.ts' : 'lib/template.js'
    const to = this.features.typescript
      ? `src/templates/${template.id}.ts`
      : `lib/templates/${template.id}.js`

    this.files = {
      render: [
        {
          from,
          to,
          data: template
        }
      ],
      copy: [
        {
          from: 'templates/default',
          to: `templates/${template.id}`
        }
      ],
      renderOptions: {
        async: true,
        debug,
        compileDebug: debug
      }
    }
    this.spinner.succeed(`Created template ${this.style.cyan.bold(this.data.template.id)}`)
  }

  protected async ending() {
    const { template } = this.data
    const templateFullId = `Template${template.capitalizedId}`
    if (this.errors) {
      this.spinner.fail(`Failed to created template ${this.style.cyan.bold(template.id)}.`)
      this.error(this.errors)
    }

    let extraInfo = ''
    try {
      const { name } = require(join(this.targetDir, 'package.json'))
      if (name) {
        extraInfo = `
  ${this.style.bold('$')} ${this.style.cyan(`fbi list ${name}`)} to check template registration`
      }
    } catch (err) {}

    if (this.features.typescript) {
      this.log(`
Next steps:
  add${this.style.cyan(`
    import ${templateFullId} from './templates/${template.id}'`)}
  and${this.style.cyan(`
    new ${templateFullId}(this)`)}
  to "src/index.ts".

  ${this.style.bold('$')} ${this.style.cyan('fbi build')}
  ${this.style.bold('$')} ${this.style.cyan('fbi link')}${extraInfo}
    `)
    } else {
      this.log(`
Next steps:
  add${this.style.cyan(`
    const ${templateFullId} = require('./templates/${template.id}')`)}
  and${this.style.cyan(`
    new ${templateFullId}(this)`)}
  to "lib/index.js".

  ${this.style.bold('$')} ${this.style.cyan('fbi link')}${extraInfo}
    `)
    }
  }
}
