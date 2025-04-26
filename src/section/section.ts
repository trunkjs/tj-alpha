import {ReactiveElement} from "lit";
import {property} from "lit/decorators";
import {createLayoutAttributeConverter} from "@/mixins/layout-mixin";

/**
 * Property converter for 'layout' attribute.
 * Parses a layout string into an object and serializes object back to string.
 */
export const layoutAttributeConverter = createLayoutAttributeConverter();

