import { Factory } from 'fbi'
<%_ project.commands.forEach(({ id, capitalizedId }) => { _%>
import Command<%= capitalizedId %> from './commands/<%= id %>'
<%_ }) _%>
<%_ project.templates.forEach(({ id, capitalizedId }) => { _%>
import Template<%= capitalizedId %> from './templates/<%= id %>'
<%_ }) _%>

export default class <%= project.nameCapitalized %> extends Factory {
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
}
