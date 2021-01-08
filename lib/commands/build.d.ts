import { Command } from 'fbi';
import Factory from '..';
export default class CommandBuild extends Command {
    factory: Factory;
    id: string;
    alias: string;
    description: string;
    flags: (string | boolean)[][];
    constructor(factory: Factory);
    disable(): Promise<boolean | string>;
    run(flags: any, unknow: any): Promise<void>;
    private compile;
}
