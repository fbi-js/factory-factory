import * as ejs from 'ejs';
import { Template } from 'fbi';
import Factory from '../..';
export default class TemplateCommand extends Template {
    factory: Factory;
    id: string;
    description: string;
    path: string;
    renderer: typeof ejs.render;
    constructor(factory: Factory);
    protected gathering(): Promise<void>;
    protected writing(): Promise<void>;
    protected ending(): Promise<void>;
}
