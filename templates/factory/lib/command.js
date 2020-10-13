const { Command } = require('fbi')

module.exports = class Command<%= capitalizedId %> extends Command {
  constructor(factory) {
    super()
    this.factory = factory
    this.id = '<%= id %>'
    this.alias = '<%_ if(alias) {_%><%= alias %><%_ } _%>'
    this.args = ''
    this.flags = []
    this.description = '<%_ if(description) {_%><%= description %> <%_ } else { _%> command <%= id %> description <%_ } _%>'
  }

  async run(flags, unknow) {
    this.debug(`Running command "${this.id}" from factory "${this.factory.id}" with options:`, {
      flags,
      unknow
    })
    const spinner = this.createSpinner(`Start <%= id %>...`).start()
    spinner.succeed('<%= id %> successfully')
  }
}
