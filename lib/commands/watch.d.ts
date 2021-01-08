import { Command } from 'fbi';
import * as ts from 'typescript';
import Factory from '..';
export default class CommandWatch extends Command {
    factory: Factory;
    id: string;
    alias: string;
    description: string;
    formatHost: ts.FormatDiagnosticsHost;
    constructor(factory: Factory);
    disable(): Promise<boolean | string>;
    run(flags: any, unknow: any): Promise<void>;
}
