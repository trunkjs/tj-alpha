import "./test.scss";
import {register_template, sectionRegistry, TemplateApplication} from "@/section/section-registry";
import {css, html, unsafeCSS} from "lit";
export {ContentArea} from "../src/content-area/content-area";


import style from "./test1.scss?inline";
import {qhtml} from "@/qhtml/qhtml";

const tpl = html`
    <div class="test">
        <h1>Welcome Junge!</h1>
        <slot name="header" select="h1,h2"></slot>
        <slot></slot>
    </div>
`;


register_template("#test1", (current: HTMLElement, layout: Record<string, string>) : TemplateApplication => {

    return {
        html: tpl,
        css: unsafeCSS(style),
        connectedCallback: (current: HTMLElement, features: Record<string, string>) => {
            console.log("connected", current, features);
        },
        disconnectedCallback: (current: HTMLElement, features: Record<string, string>) => {
            console.log("disconnected", current, features);
        }
    } as TemplateApplication

})

