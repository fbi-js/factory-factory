import { Command } from 'fbi'
import Factory from '..'

export default class Command<%= capitalizedId %> extends Command {
  id = '<%= id %>'
  alias = '<%_ if(alias) { _%><%= alias %><%_ } _%>'
  args = '<%_ if(args) { _%><%= args %><%_ } _%>'
  flags = <% if(flags) { %><%- flags %><% } else { %> [] <% } %>
  description = '<%_ if(description) { _%> <%= description %> <%_ } else { _%> command <%= id %> description <%_ } _%>'

  constructor(public factory: Factory) {
    super()
  }

  public async run(args: any, flags: any) {
    this.debug(`Factory: (${this.factory.id})`, 'from command', `"${this.id}"`)

    const spinner = this.createSpinner(`Start <%= id %>...`).start()

    spinner.succeed('<%= id %> successfully')
  }
}
