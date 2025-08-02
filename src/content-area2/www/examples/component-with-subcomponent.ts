
import { customElement } from 'lit/decorators.js';
import {ManualBeforeLayoutElement} from "../../lib/apply-layout";
import {attrAssign} from "../../lib/attrAssign";
import {isSectionTreeElement} from "../../lib/SectionTreeBuilder";
import {LitElement} from "lit";
import {html} from "lit/static-html.js";


@customElement('component-with-subcomponent')
export class ComponentWithSubcomponent extends LitElement implements ManualBeforeLayoutElement{

  static get is() {
    return 'component-with-subcomponent';
  }

  constructor() {
    super();
  }

  beforeLayoutCallback(origElement: HTMLElement, instance: this, children: Element[]): void | boolean {
    let hi = 3;
    if (isSectionTreeElement(origElement)) {
      hi = origElement.__IT.hi ?? 3; // Default to 3 if not defined
    }
    attrAssign(origElement, `:scope > section`, {layout: "sub-component"});
  }


  render() {
    return html`
      <h1>Component with Subcomponent</h1>
      <slot></slot>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    // You can add any additional setup here if needed
  }
}
