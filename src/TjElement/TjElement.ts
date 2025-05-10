import {SlotsMixin, Slots} from "@/mixins/slots-mixin";
import {LayoutMixin} from "@/mixins/layout-mixin";
import {ReactiveElement} from "lit";
import {ElementDefinition} from "@/tools/build-element";






abstract class TjElement<TSlots extends Slots> extends SlotsMixin<TSlots>()(ReactiveElement) {
    constructor(definition?: ElementDefinition<any, any, any>) {
        super();
        this.slots = slots || {} as TestSlots;
    }
}


type TestSlots = {
    "test"?: string | HTMLElement
    "test2"?: string | HTMLElement
    "test3"?: string | HTMLElement

}
