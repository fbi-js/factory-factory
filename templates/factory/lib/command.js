const { Command } = require('fbi')

module.exports = class Command<%= capitalizedId %> extends Command {
  id = '<%= id %>'
  alias = '<%_ if(alias) {_ %><%= alias %><%_ } else { _%>  <%_ } _%>'
  args = '<%_ if(args) {_ %><%= args %><%_ } else { _%>  <%_ } _%>'
  flags = <%_ if(flags) {_ %><%= flags %><%_ } else { _%> [] <%_ } _%>

  description = '<%_ if(description) {_ %> <%= description %> <%_ } else { _%> command <%= id %> description <%_ } _%>'

  constructor(factory) {
    super()
    this.factory = factory
  }

  async run(args, flags) {
    this.debug(`Factory: (${this.factory.id})`, 'from command', `"${this.id}"`)

    this.factory.factoryMethod1()

    const spinner = this.createSpinner(`Start <%= id %>...`).start()

    spinner.succeed('<%= id %> successfully')
  }
}
