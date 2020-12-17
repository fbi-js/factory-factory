import { Factory } from 'fbi'
<%_ project.commands.forEach(({ id, capitalizedId }) => { _%>
import Command<%= capitalizedId %> from './commands/<%= id %>'
<%_ }) _%>
<%_ project.templates.forEach(({ id, capitalizedId }) => { _%>
import Template<%= capitalizedId %> from './templates/<%= id %>'
<%_ }) _%>

const { name, description } = require('../package.json')

export default class <%= project.nameCapitalized %> extends Factory {
  id = name
  description = description
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

export {
  <%_ project.commands.forEach(({ id, capitalizedId }) => { _%>
  Command<%= capitalizedId %>,
  <%_ }) _%>
  <%_ project.templates.forEach(({ id, capitalizedId }) => { _%>
  Template<%= capitalizedId %>,
  <%_ }) _%>
}
