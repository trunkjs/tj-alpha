import {LitElement} from "lit";


class ItemClickEvent {
    constructor(public item: string){};
}

route("/demo-event-bus/{projektid}/", {)
class SomeComponent extends messageBusMixin(LitElement) {


    @messageBus.subscribe(ItemClickEvent)
    public onItemClick(i: ItemClickEvent) {

    }


    async public onClick() {
        // Emit an event
        await this.emit(new ItemClickEvent("Hello World"));
    }


}
