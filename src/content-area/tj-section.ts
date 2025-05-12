import {HTMLTemplateResult, ReactiveElement} from "lit";
import {property} from "lit/decorators.js";
import {hydrateKeyValueString} from "@/tools/key-value-string-parser";
import {LayoutMixin} from "@/mixins/layout-mixin";
import {sectionRegistry, TemplateApplication} from "@/content-area/section-registry";
import {customElement} from "lit/decorators.js";
import {litTemplateToString} from "@/tools/lit-tools";
import {applyLayout} from "@/content-area/apply-layout";
import {arrangeSlots} from "@/content-area/slot-maschine";
import {TjDataElement} from "@/TjElement/TjDataElement";
import {ElementDefinition, update_element} from "@/tools/build-element";
import {TjResponsive} from "@/respnsive/responsive";



type TjSectionDefinition = ElementDefinition<{ debug?: boolean}, { use?: string }, any>

@customElement('tj-section')
export class TjSection extends LayoutMixin(ReactiveElement, {allowedKeys: ['use']}) {



    static get is() {
        return 'tj-section';
    }


    declare protected templateApplication: TemplateApplication | undefined;

    constructor(elementDefinition?: TjSectionDefinition) {
        super();

        let use = elementDefinition?.layout?.use;
        if (! use) {
            throw new Error("The layout key 'use' is not set.");
        }
        let templateApplication = sectionRegistry[use];
        this.templateApplication = templateApplication;



        let layoutVars = elementDefinition?.layout || {} as any;
        Object.keys(templateApplication.layout || {}).forEach((key) => {

            if (layoutVars && layoutVars[key] !== undefined) {
                return;
            }
            let defaultVal = templateApplication.layout![key].default;
            if (typeof defaultVal === "function") {
                defaultVal = defaultVal(key, this);
            }
            if (typeof defaultVal === "string") {
                layoutVars[key] = defaultVal;
            } else {
                throw new Error("LayoutDefault must be a string or a function.");
            }

            // Check for publish
            if (templateApplication.layout![key].publish) {
                this.style.setProperty(`--layout-${key}`, layoutVars[key]);
            }

        })

        let shadowRoot = this.createRenderRoot();
        // Set attributes, layout and slots
        update_element(this, elementDefinition);



        // Always set the name of the section as class
        this.setAttribute("class", use.substring(1) + " " + (this.getAttribute("class") ?? ""));


        let html = templateApplication.html;
        if (typeof html === "function") {
            html = html(this, this.layout);
        }
        //this.attachShadow({ mode: 'open' });
        this.shadowRoot!.innerHTML = litTemplateToString(html);
        // The CSS Styles are set in connectedCallback below!


        let responsiveParser = new TjResponsive();
        responsiveParser.observe(this.shadowRoot!);

        arrangeSlots(this);

        // Apply layout to all children
        Array.from(this.children).forEach(child => {
            if (child instanceof HTMLElement) {
                applyLayout(child);
            }
        });
    }

    connectedCallback() {
        super.connectedCallback();
        let templateApplication = this.templateApplication;
        if (templateApplication?.css) {
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
        this.templateApplication?.connectedCallback?.(this, this.layout);
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.templateApplication?.disconnectedCallback?.(this, this.layout);
    }
}
