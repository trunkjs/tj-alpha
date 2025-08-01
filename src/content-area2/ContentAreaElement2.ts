import {ReactiveElement} from "lit";
import {customElement} from "lit/decorators.js";
import {domContentLoaded} from "../tools/event-promise";
import {SectionTreeBuilder} from "./lib/SectionTreeBuilder";
import {Stopwatch} from "../tools/Stopwatch";
import {sleep} from "../tools/sleep";


@customElement('tj-content-area2')
export class ContentAreaElement2 extends ReactiveElement {
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
    let sw = new Stopwatch("SectionTreeBuilder");

    await domContentLoaded();

    super.connectedCallback();


    let sectionTreeBuilder = new SectionTreeBuilder(this as HTMLElement);
    // Start with the first 3 children - wait and then add the rest

    let children = Array.from(this.children);

    sectionTreeBuilder.arrange(children);


    sw.lap("after arrange");
  }
}
