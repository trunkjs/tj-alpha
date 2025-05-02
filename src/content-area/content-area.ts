import {ReactiveElement} from "lit";
import {customElement} from "lit/decorators.js";
import {ContentBuilder} from "@/content-area/content-builder";


@customElement('tj-content-area')
export class ContentArea extends ReactiveElement {
    static get is() {
        return 'content-area';
    }

    protected createRenderRoot(): HTMLElement | DocumentFragment {
        return this;
    }

    static get properties() {
        return {

        };
    }

    constructor() {
        super();

    }

    async connectedCallback() {
        super.connectedCallback();

        console.log("ContentArea connectedCallback");
        let contentBuilder = new ContentBuilder(this as HTMLElement);
        contentBuilder.arrange(Array.from(this.children));

    }
}
