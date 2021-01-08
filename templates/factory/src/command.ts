import { Command } from 'fbi'
import Factory from '..'

export default class Command<%= capitalizedId %> extends Command {
  id = '<%= id %>'
  alias = '<%_ if(alias) { _%><%= alias %><%_ } _%>'
  args = ''
  flags = []
  description = '<%_ if(description) { _%> <%= description %> <%_ } else { _%> command <%= id %> description <%_ } _%>'

  constructor (public factory: Factory) {
    super()
  }

  public async run (flags: any, unknow: any) {
    this.debug(`Running command "${this.id}" from factory "${this.factory.id}" with options:`, {
      flags,
      unknow
    })
    const spinner = this.createSpinner(`Start <%= id %>...`).start()
    spinner.succeed('<%= id %> successfully')
  }
}
