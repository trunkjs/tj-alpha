import style from "./details-accorion.scss?inline";
import {html, css, LitElement, unsafeCSS} from "lit";
import {customElement, property} from "lit/decorators.js";
import {arrangeSlots} from "@/content-area/slot-maschine";

import { classMap } from 'lit/directives/class-map.js';


@customElement("details-accordion")
export class DetailsAccordionElement extends LitElement {


    static styles = css`${unsafeCSS(style)}`;

    @property({type: Boolean, reflect: true})
    public  open = false;

        render() {
          return html`
            <details class=${classMap({open: this.open})}>
              <summary part="summary" @click=${() => (this.open = !this.open)} "><slot name="summary" select="h3"></summary>
              <slot id="main"></slot>
            </details>`;
        }
        firstUpdated() {
          arrangeSlots(this); // Important: Will assign gthe slot names to the children
        }

}
