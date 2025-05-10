import {ReactiveElement} from "lit";
import {property} from "lit/decorators";
import {hydrateKeyValueString, dehydrateKeyValueString} from "@/tools/key-value-string-parser";
import {Constructor} from "@/tools/types";

/**
 * Property converter for 'layout' attribute.
 * Parses a layout string into an object and serializes object back to string.
 */
export const layoutAttributeConverter = {
    fromAttribute(value: string | null): Record<string, string> {
        if (!value) return {};
        return hydrateKeyValueString(value);
    },
    toAttribute(value: Record<string, string> | null): string | null {
        if (!value || typeof value !== 'object') return null;
        return dehydrateKeyValueString(value);
    },
};


/**
 * LayoutMixin
 *
 * Adds a `layout` property to a Lit ReactiveElement. The property is backed by the
 * 'layout' attribute, parsed and serialized via `layoutAttributeConverter`.
 *
 * @example
 * class MyComponent extends LayoutMixin(LitElement) {
 *   // now has .layout: Record<string,string>
 * }
 */
export function LayoutMixin<TBase extends Constructor<ReactiveElement>>(
    Base: TBase,
    options?: { allowedKeys?: string[] }
) : TBase {


    return class LayoutMixed extends Base {
        public layout: Record<string, string> = {};

        static get properties() {
            return {
                layout: {
                    type: Object,
                    attribute: 'layout',
                    converter: layoutAttributeConverter,
                    reflect: true
                }
            };
        }
    };
}
