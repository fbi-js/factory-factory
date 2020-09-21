import { Factory } from 'fbi';
import CommandBuild from './commands/build';
import CommandWatch from './commands/watch';
import TemplateFactory from './templates/factory';
export default class FactoryFactory extends Factory {
    id: string;
    description: string;
    commands: (CommandBuild | CommandWatch)[];
    templates: TemplateFactory[];
}
