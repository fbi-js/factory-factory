import { Factory } from 'fbi'

import CommandBuild from './commands/build'
import CommandWatch from './commands/watch'
import TemplateFactory from './templates/factory'

const { name, description } = require('../package.json')

export default class FactoryFactory extends Factory {
  id: string = name
  description: string = description
  commands = [new CommandBuild(this), new CommandWatch(this)]
  templates = [new TemplateFactory(this)]
}

export { CommandBuild, CommandWatch, TemplateFactory }
