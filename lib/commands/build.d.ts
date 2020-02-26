import { Command } from 'fbi';
import Factory from '..';
export default class CommandBuild extends Command {
    factory: Factory;
    id: string;
    alias: string;
    args: string;
    flags: string[][];
    description: string;
    constructor(factory: Factory);
    disable(): Promise<false | "Because there is no need to compile.">;
    run(flags: any): Promise<void>;
    private compile;
}
