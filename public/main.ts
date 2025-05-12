import "./test.scss";
import {register_template, sectionRegistry, TemplateApplication} from "@/content-area/section-registry";
import {css, html, unsafeCSS} from "lit";
export {ContentArea} from "../src/content-area/content-area";


import style from "./test1.scss?inline";
import {qhtml} from "@/qhtml/qhtml";

import "../demo/details-accordion/details-accorion";

const tpl = html`
    <div class="test">
        <h1>Welcome Junge!</h1>
        <slot name="header" select="h1,h2"></slot>
        <slot></slot>
    </div>
`;


register_template("#test1", {

        html: tpl,
        css: unsafeCSS(style),
        connectedCallback: (current: HTMLElement, features: Record<string, string>) => {
            console.log("connected", current, features);
        },
        disconnectedCallback: (current: HTMLElement, features: Record<string, string>) => {
            console.log("disconnected", current, features);
        }

})

