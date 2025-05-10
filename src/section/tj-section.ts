import {HTMLTemplateResult, ReactiveElement} from "lit";
import {property} from "lit/decorators";
import {hydrateKeyValueString} from "@/tools/key-value-string-parser";
import {LayoutMixin} from "@/mixins/layout-mixin";
import {sectionRegistry, TemplateApplication} from "@/section/section-registry";
import {customElement} from "lit/decorators.js";
import {litTemplateToString} from "@/tools/lit-tools";
import {applyLayout} from "@/content-area/apply-layout";
import {arrangeSlots} from "@/content-area/slot-maschine";



@customElement('tj-section')
export class TjSection extends LayoutMixin(ReactiveElement, {allowedKeys: ['use']}) {



    static get is() {
        return 'tj-section';
    }

    constructor(layout ? : Record<string, string>, attributes?: Record<string, string>, children ? : HTMLCollection) {
        super();

        if (layout)
            this.layout = layout

        let use = this.layout["use"];
        let tpl = sectionRegistry[use];

        let templateApplication = tpl(this, {} as Record<string, string>) as TemplateApplication;

        if (attributes) {
            Object.keys(attributes).forEach((key) => {
                this.setAttribute(key, attributes[key]);
            });
        }
        // Always set the name of the section as class
        this.setAttribute("class", use.substring(1) + " " + (this.getAttribute("class") ?? ""));

        console.log("TjSection", use, this.layout, this.getAttribute("class"));



        this.attachShadow({ mode: 'open' });
        this.shadowRoot!.innerHTML = litTemplateToString(templateApplication.html);

        if (templateApplication.css) {
            let adopt : CSSStyleSheet[] = [];

            if ( ! Array.isArray(templateApplication.css)) {
                templateApplication.css = [templateApplication.css];
            }
            templateApplication.css.forEach((css) => {
                if (css.styleSheet !== undefined) {
                    adopt.push(css.styleSheet);
                }
            });

            this.shadowRoot!.adoptedStyleSheets = adopt;
        }


        if (children) {
            this.append(...Array.from(children));
        }

        arrangeSlots(this);

        Array.from(this.children).forEach(child => {
            if (child instanceof HTMLElement) {
                applyLayout(child);
            }
        });
    }

    connectedCallback() {

    }
}
