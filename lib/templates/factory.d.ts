import { Template } from 'fbi';
import * as ejs from 'ejs';
import Factory from '..';
import SubTemplateCommand from './factory/command';
import SubTemplateTemplate from './factory/template';
export default class TemplateFactory extends Template {
    factory: Factory;
    id: string;
    description: string;
    path: string;
    renderer: typeof ejs.render;
    templates: (SubTemplateCommand | SubTemplateTemplate)[];
    constructor(factory: Factory);
    protected gathering(): Promise<void>;
    protected writing(): Promise<void>;
    protected installing(flags: Record<string, any>): Promise<void>;
    protected ending(): Promise<void>;
}
