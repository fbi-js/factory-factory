const { Factory } = require('fbi')
<%_ project.commands.forEach(({ id, capitalizedId }) => { _%>
const Command<%= capitalizedId %> = require('./commands/<%= id %>')
<%_ }) _%>
<%_ project.templates.forEach(({ id, capitalizedId }) => { _%>
const Template<%= capitalizedId %> = require('./templates/<%= id %>')
<%_ }) _%>

module.exports = class <%= project.nameCapitalized %> extends Factory {
  constructor() {
    super(...arguments)
    this.id = '<%= project.name %>'
    this.description = '<%= project.description %>'
    this.commands = [
      <%_ project.commands.forEach(({ id, capitalizedId }) => { _%>
      new Command<%= capitalizedId %>(this),
      <%_ }) _%>
    ]
    this.templates = [
      <%_ project.templates.forEach(({ id, capitalizedId }) => { _%>
      new Template<%= capitalizedId %>(this),
      <%_ }) _%>
    ]
  }
}
