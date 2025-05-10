import {CSSResult, HTMLTemplateResult, TemplateResult} from 'lit';

export type TemplateApplication = {
    /**
     * The template result to be applied.
     */
    html: TemplateResult<1>;

    css?: CSSResult | CSSResult[];


    classes?: string[];
    layout?: Record<string, string>;

    connectedCallback?: (current: HTMLElement, features: Record<string, string>) => void;
    disconnectedCallback?: (current: HTMLElement, features: Record<string, string>) => void;
}


export type TemplateApplicationLoader = (current: HTMLElement, layout: Record<string, string>) => TemplateApplication;
const sectionRegistryVersion = "1";

declare global {
    interface Window {
        __tj_section_registry_registered: Map<string, {version: string, loader: TemplateApplicationLoader}>;
    }
}

if (typeof window !== 'undefined') {
    if (!window.__tj_section_registry_registered) {
        window.__tj_section_registry_registered = new Map<string, {version: string, loader: TemplateApplicationLoader}>();
    }
}


export function register_template(id : string, template : TemplateApplication | TemplateApplicationLoader) {
    // If template is not al loadder, convert it to a loader
    if (template && typeof template === 'object' && 'template' in template) {
        template = ((e, f) => template) as TemplateApplicationLoader;
    }
    if (window.__tj_section_registry_registered.has(id)) {
        throw new Error(`Template with id ${id} already registered`);
    }
    window.__tj_section_registry_registered.set(id, {version: sectionRegistryVersion, loader: template as TemplateApplicationLoader});
}


/**
 * Usage
 *
 * @example
 * SectionRegistry['#'] = (current, features) => html`<div>...</div>`;
 *
 */
export const sectionRegistry = new Proxy(
    window.__tj_section_registry_registered as Map<string, { version: string, loader: TemplateApplicationLoader }>,
    {
        get(target, prop: string) : TemplateApplicationLoader {
            if (target.get(prop) === undefined) {
                throw new Error(`SectionRegistry: '${prop}' not found`);
            }
            return (target.get(prop)?.loader) as TemplateApplicationLoader;
        },
        set(target, prop: string, value: TemplateApplicationLoader | TemplateApplication) {
            let callback = value;
            if (value && typeof value === 'object' && 'template' in value) {
                callback = ((e, f) => value) as TemplateApplicationLoader;
            }
            target.set(prop, { version: sectionRegistryVersion, loader: callback as TemplateApplicationLoader });
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
) as unknown as Record<string, TemplateApplicationLoader>;

