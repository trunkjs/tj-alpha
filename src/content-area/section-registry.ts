import {CSSResult, HTMLTemplateResult, TemplateResult} from 'lit';

export type TemplateResultCallback = (current: HTMLElement, layout: Record<string, string>) => TemplateResult<1>;

export type TemplateApplication = {
    /**
     * The template result to be applied.
     */
    html: TemplateResult<1> | TemplateResultCallback;

    css?: CSSResult | CSSResult[];


    classes?: string[];
    layout?: LayoutDefinition

    connectedCallback?: (current: HTMLElement, features: Record<string, string>) => void;
    disconnectedCallback?: (current: HTMLElement, features: Record<string, string>) => void;
}

export type LayoutKeyDefinition = {

    /**
     * The default value of the layout key.
     */
    default?: string | ((name : string, element : HTMLElement) => string);

    /**
     * The description of the layout key.
     */
    description?: string;

    /**
     * The options for the layout key.
     */
    options?: string[] | ((name : string, element : HTMLElement) => string);

    /**
     * If true there will be a css variable "--layout-{key}" set to the value of the layout key.
     */
    publish?: boolean;

}

export type LayoutDefinition = Record<string, LayoutKeyDefinition>;


const sectionRegistryVersion = "1";

declare global {
    interface Window {
        __tj_section_registry_registered: Map<string, {version: string, loader: TemplateApplication}>;
    }
}

if (typeof window !== 'undefined') {
    if (!window.__tj_section_registry_registered) {
        window.__tj_section_registry_registered = new Map<string, {version: string, loader: TemplateApplication}>();
    }
}


export function register_template(id : string, template : TemplateApplication) {

    if (window.__tj_section_registry_registered.has(id)) {
        throw new Error(`Template with id ${id} already registered`);
    }
    window.__tj_section_registry_registered.set(id, {version: sectionRegistryVersion, loader: template as TemplateApplication});
}


/**
 * Usage
 *
 * @example
 * SectionRegistry['#'] = (current, features) => html`<div>...</div>`;
 *
 */
export const sectionRegistry = new Proxy(
    window.__tj_section_registry_registered as Map<string, { version: string, loader: TemplateApplication }>,
    {
        get(target, prop: string) : TemplateApplication {
            if (target.get(prop) === undefined) {
                throw new Error(`SectionRegistry: '${prop}' not found`);
            }
            return (target.get(prop)?.loader) as TemplateApplication;
        },
        set(target, prop: string, value:  TemplateApplication) {
            let callback = value;
            target.set(prop, { version: sectionRegistryVersion, loader: callback as TemplateApplication });
            return true;
        },
        has(target, prop) {
            return target.has(<string>prop);
        },
        deleteProperty(target, prop) {
            return target.delete(<string>prop);
        },
        ownKeys(target) {
            return Array.from(target.keys());
        },
    }
) as unknown as Record<string, TemplateApplication>;

