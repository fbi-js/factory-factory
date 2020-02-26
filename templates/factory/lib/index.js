const { Factory } = require('fbi')
<%_ project.commands.forEach(({ id, capitalizedId }) => { _%>
const Command<%= capitalizedId %> = require('./commands/<%= id %>')
<%_ }) _%>
<%_ project.templates.forEach(({ id, capitalizedId }) => { _%>
const Template<%= capitalizedId %> = require('./templates/<%= id %>')
<%_ }) _%>

module.exports = class <%= project.nameCapitalized %> extends Factory {
  id = '<%= project.name %>'
  description = '<%= project.description %>'
  commands = [
    <%_ project.commands.forEach(({ id, capitalizedId }) => { _%>
    new Command<%= capitalizedId %>(this),
    <%_ }) _%>
  ]
  templates = [
    <%_ project.templates.forEach(({ id, capitalizedId }) => { _%>
    new Template<%= capitalizedId %>(this),
    <%_ }) _%>
  ]

  factoryMethod1() {
    this.log(`Factory: (${this.id})`, 'from factoryMethod1')
  }
}
