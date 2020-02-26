import { Factory } from 'fbi'
import CommandBuild from './commands/build'
import CommandWatch from './commands/watch'
import TemplateFactory from './templates/factory'

export default class FactoryFactory extends Factory {
  id = 'factory'
  description = 'factorty for fbi factory development'
  commands = [new CommandBuild(this), new CommandWatch(this)]
  templates = [new TemplateFactory(this)]

  factoryMethod1() {
    this.log(`Factory: (${this.id})`, 'from factoryMethod1')
  }
}
