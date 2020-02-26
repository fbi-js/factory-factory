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
    disable(): false | "Because there is no need to compile.";
    run(): Promise<void>;
}
