const ejs = require('ejs')
const { join } = require('path')
const { Template, utils } = require('fbi')
const { formatName, isValidObject } = utils

module.exports = class Template<%= capitalizedId %> extends Template {
  constructor(factory) {
    super()
    this.factory = factory
    this.id = '<%= id %>'
    this.description = '<%_ if(description) { _%> <%= description %> <%_ } else { _%> template <%= id %> description <%_ } _%>'
    this.path = 'templates/<%= id %>'
    this.renderer = ejs.render
    this.templates = []
  }

  async gathering() {
    this.data.project = await this.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Input the project name',
        initial({ enquirer }) {
          return 'project-demo'
        },
        validate(value) {
          const name = formatName(value)
          return (name && true) || 'please input a valid project name'
        }
      },
      {
        type: 'input',
        name: 'description',
        message: 'Input project description',
        initial({ state }) {
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
        result(names) {
          return this.map(names)
        }
      }
    ])

    const { factory, project } = this.data
    this.spinner = this.createSpinner(`Creating project...`).start(
      `Creating ${this.style.bold.green(project.name)} via ${factory.id} from ${
        factory.template
      }...`
    )
  }

  async checking() {}

  async writing() {
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
        project.features.typescript ? 'src/index.ts' : 'lib/index.js'
      ],
      renderOptions: {
        async: true,
        debug,
        compileDebug: debug
      }
    }
  }

  async installing(flags) {
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

  async ending() {
    const { project } = this.data
    const projectName = this.style.cyan.bold(project.name)
    if (this.errors) {
      this.spinner.fail(`Failed to created project ${projectName}.`)
      this.error(this.errors)
    }

    console.log(`
Next steps:
  $ ${this.style.cyan('cd ' + project.name)}
  $ ${this.style.cyan('fbi list')} ${this.style.dim('show available commands and sub templates')}`)
  }
}
