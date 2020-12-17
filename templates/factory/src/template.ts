import * as ejs from 'ejs'
import { join } from 'path'
import { Template, utils } from 'fbi'

import Factory from '..'

const { formatName, isValidObject } = utils

export default class Template<%= capitalizedId %> extends Template {
  id = '<%= id %>'
  description = '<%_ if(description) { _%> <%= description %> <%_ } else { _%> template <%= id %> description <%_ } _%>'
  path = join(__dirname, '../../templates/<%= id %>')
  renderer = ejs.render

  constructor(public factory: Factory) {
    super(factory)
  }

  protected async gathering() {
    const defaultName = this.data?.project?.name ?? 'project-demo'

    this.data.factoryVersion = require('../../package.json').version

    this.data.project = await this.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Input the project name',
        initial() {
          return defaultName
        },
        validate(value: any) {
          const name = formatName(value)
          return (name && true) || 'please input a valid project name'
        }
      },
      {
        type: 'input',
        name: 'description',
        message: 'Input project description',
        initial({ state }: any) {
          return `${state.answers.name} description`
        }
      },
      {
        type: 'MultiSelect',
        name: 'features',
        message: `Pick features for your project:`,
        hint: '(Use <space> to select, <return> to submit)',
        choices: [
          { name: 'typescript', value: true },
        ],
        result(names: string[]) {
          return this.map(names)
        }
      }
    ] as any)

    const { factory, project } = this.data
    this.spinner = this.createSpinner(`Creating project...`).start(
      `Creating ${this.style.bold.green(project.name)} via ${factory.id} from ${
        factory.template
      }...`
    )
  }

  protected async writing() {
    const debug = !!this.context.get('debug')
    const { project } = this.data
    this.files = {
      copy: [
        '.editorconfig',
        '.prettierrc',
        '.gitignore',
        project.features.typescript ? 'tsconfig.json' : ''
      ],
      render: [
        'package.json',
        '.fbi.config.js',
        'README.md',
        project.features.typescript ? 'src/index.ts' : 'src/index.js'
      ],
      renderOptions: {
        async: true,
        debug,
        compileDebug: debug
      }
    }
  }

  protected async installing(flags: Record<string, any>) {
    const { project } = this.data
    this.spinner.succeed(`Created project ${this.style.cyan.bold(project.name)}`)

    const { dependencies, devDependencies } = require(join(this.targetDir, 'package.json'))
    if (isValidObject(dependencies) || isValidObject(devDependencies)) {
      const installSpinner = this.createSpinner(`Installing dependencies...`).start()
      try {
        await this.installDeps(this.targetDir, flags.packageManager, false)
        installSpinner.succeed(`Installed dependencies`)
      } catch (err) {
        installSpinner.fail('Failed to install dependencies. You can install them manually.')
        this.error(err)
      }
    }
  }

  protected async ending() {
    const { project } = this.data
    const projectName = this.style.cyan.bold(project.name)
    if (this.errors) {
      this.spinner.fail(`Failed to created project ${projectName}.`)
      this.error(this.errors)
    }

    console.log(`
Next steps:`)

    if (this.data.subDirectory) {
      console.log(`
  $ ${this.style.cyan('cd ' + this.data.subDirectory)}`)
    }

    console.log(`
  $ ${this.style.cyan('fbi list')} ${this.style.dim('show available commands and sub templates')}`)
  }
}
