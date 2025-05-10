import {SlotsMixin, Slots} from "@/mixins/slots-mixin";
import {LayoutMixin} from "@/mixins/layout-mixin";
import {ReactiveElement} from "lit";






abstract class TjElement<TSlots extends Slots> extends SlotsMixin<TSlots>()(ReactiveElement) {
    constructor(slots?: TSlots) {
        super();
        this.slots = slots || {} as TestSlots;
    }
}


type TestSlots = {
    "test"?: string | HTMLElement
    "test2"?: string | HTMLElement
    "test3"?: string | HTMLElement

}
