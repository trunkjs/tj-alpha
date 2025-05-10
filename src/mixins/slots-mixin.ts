import { ReactiveElement } from "lit";
import { Constructor } from "@/tools/types";
import { create_element } from "@/tools/create-element";

/**
 * Slots map. Every concrete component can extend this
 * with its own named slots in a strongly-typed manner.
 */
export type Slots = {
    [key: string]: string | HTMLElement;
};


type AbstractConstructor<T = {}> = abstract new (...args: any[]) => T;

/**
 * ContentMixin
 *
 * Adds a `slots` property to a Lit ReactiveElement.  The exact
 * shape of the `slots` map is defined by the component that
 * applies the mixin, which enables TypeScript code-completion
 * for the slot names.
 *
 * Usage
 * -----
 *     type MySlots = {
 *         header?: HTMLElement | string;
 *         footer?: HTMLElement | string;
 *     };
 *
 *     class MyElement extends ContentMixin<MySlots>()(LitElement) {}
 *
 * Now `MyElement` instances expose a correctly typed `.slots`
 * property.
 */
export function SlotsMixin<TSlots>() {
    return <TBase extends AbstractConstructor<ReactiveElement>>(Base: TBase) => {
        let slots = {} as TSlots;
        abstract class SlotsClass extends Base {
            public get slots(): TSlots {
                // Casting is safe because users are expected to
                // initialise all required keys before accessing.
                return slots as TSlots;
            }

            public set slots(value: TSlots) {
                for (const key in value) {
                    if (!Object.prototype.hasOwnProperty.call(value, key)) continue;

                    const slotContent = value[key];

                    // Store / update internal map
                    (slots as TSlots)[key] = slotContent;

                    // Remove previously appended element for this slot (if any)
                    const existing = this.querySelector(`[slot="${key}"]`);
                    if (existing) existing.remove();

                    // Append new slotted content
                    if (slotContent instanceof HTMLElement) {
                        slotContent.setAttribute("slot", key);
                        this.append(slotContent);
                    } else if (typeof slotContent === "string") {
                        this.append(
                            create_element("div", { slot: key }, [slotContent])
                        );
                    }
                }
            }

        }
        return SlotsClass;
    };
}




