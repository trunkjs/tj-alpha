import { TemplateResult } from 'lit';

export type RegistryLoader = (current: HTMLElement, features: Map<string, string>) => TemplateResult<1>;
const sectionRegistryVersion = "1";

declare global {
    interface Window {
        __tj_section_registry_registered: Map<string, {version: string, loader: RegistryLoader}>;
    }
}

if (typeof window !== 'undefined') {
    if (!window.__tj_section_registry_registered) {
        window.__tj_section_registry_registered = new Map<string, {version: string, loader: RegistryLoader}>();
    }
}

/**
 * Usage
 *
 * @example
 * SectionRegistry['#'] = (current, features) => html`<div>...</div>`;
 *
 */
export const sectionRegistry = new Proxy(
    window.__tj_section_registry_registered as Map<string, { version: string, loader: RegistryLoader }>,
    {
        get(target, prop: string) {
            return (target.get(prop)?.loader) ?? undefined;
        },
        set(target, prop: string, value: RegistryLoader) {
            target.set(prop, { version: sectionRegistryVersion, loader: value });
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
) as unknown as Record<string, RegistryLoader>;

