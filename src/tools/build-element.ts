import {TjDataElement} from "@/TjElement/TjDataElement";
import {create_element} from "@/tools/create-element";

export type SlotDefinition = string | string[] | HTMLElement | HTMLElement[] | (() => string | string[] | HTMLElement | HTMLElement[]);

export type ElementDefinition<TAttributes extends Record<string, string|boolean>, TLayout extends Record<string, string>, TSlots extends Record<string, SlotDefinition>> = {
    attributes?: TAttributes;
    layout?: TLayout;
    slots?: TSlots;
    content?: string | string[] | HTMLElement | HTMLCollection | HTMLElement[] | ((element : HTMLElement, definition: ElementDefinition<any, any, any>) => string | string[] | HTMLElement | HTMLElement[] | HTMLCollection);
}



export function update_element(element : HTMLElement, definition : ElementDefinition<any, any, any> | undefined) {
    if ( ! definition) {
        return;
    }
    // Set Attributes
    if (definition.attributes) {
        for (const key in definition.attributes) {
            element.setAttribute(key, definition.attributes[key]);
        }
    }
    // Set Layout
    if (definition.layout) {
        (element as any)["layout"] = definition.layout;
    }

    // Set Slots
    if (definition.slots) {
        Object.keys(definition.slots).forEach((key) => {
            let slot = definition.slots[key];
            if (typeof slot === "function") {
                slot = slot(element, definition);
            }
            if (typeof slot === "string") {
                slot = create_element("p", {slot: key}, [slot]);
            }
            if (Array.isArray(slot)) {
                slot.forEach((s: HTMLElement) => {
                    s.setAttribute("slot", key);
                    element.append(s);
                });
            } else {
                element.append(slot);
            }
        });
    }

    // Set Content
    if (definition.content) {
        let content = definition.content;
        if (typeof content === "function") {
            content = content(element, definition);
        }
        if (Array.isArray(content)) {
            content.forEach((c) => {
                element.append(c);
            });
        } else if (content instanceof HTMLCollection) {
            element.append(...Array.from(content));
        } else {
            throw new Error("Content must be a string, HTMLElement, or an array of them.");
        }
    }
}

