import {ReactiveElement} from "lit";
import {customElement} from "lit/decorators.js";
import {ContentBuilder} from "./ContentBuilder";
import {sleep} from "@/tools/sleep";
import {TjResponsive} from "@/respnsive/responsive";
import {domContentLoaded} from "@/tools/event-promise";


@customElement('tj-content-area')
export class ContentAreaElement extends ReactiveElement {
  static get is() {
    return 'tj-content-area';
  }

  protected createRenderRoot(): HTMLElement | DocumentFragment {
    return this;
  }

  static get properties() {
    return {};
  }

  constructor() {
    super();

  }

  async connectedCallback() {
    await domContentLoaded();

    super.connectedCallback();

    let contentBuilder = new ContentBuilder(this as HTMLElement);
    // Start with the first 3 children - wait and then add the rest

    let children = Array.from(this.children);

    contentBuilder.arrange(children);
  }
}
