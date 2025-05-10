import {HTMLTemplateResult, ReactiveElement} from "lit";
import {property} from "lit/decorators.js";
import {hydrateKeyValueString} from "@/tools/key-value-string-parser";
import {LayoutMixin} from "@/mixins/layout-mixin";
import {sectionRegistry, TemplateApplication} from "@/section/section-registry";
import {customElement} from "lit/decorators.js";
import {litTemplateToString} from "@/tools/lit-tools";
import {applyLayout} from "@/content-area/apply-layout";
import {arrangeSlots} from "@/content-area/slot-maschine";
import {TjDataElement} from "@/TjElement/TjDataElement";
import {ElementDefinition, update_element} from "@/tools/build-element";



type TjSectionDefinition = ElementDefinition<{ debug?: boolean}, { use?: string }, any>

@customElement('tj-section')
export class TjSection extends LayoutMixin(ReactiveElement, {allowedKeys: ['use']}) {



    static get is() {
        return 'tj-section';
    }


    declare protected templateApplication: TemplateApplication | undefined;

    constructor(elementDefinition?: TjSectionDefinition) {
        super();

        let shadowRoot = this.createRenderRoot();
        // Set attributes, layout and slots
        update_element(this, elementDefinition);

        let use = this.layout["use"];
        let tpl = sectionRegistry[use];

        let templateApplication = tpl(this, {} as Record<string, string>) as TemplateApplication;
        this.templateApplication = templateApplication;

        // Always set the name of the section as class
        this.setAttribute("class", use.substring(1) + " " + (this.getAttribute("class") ?? ""));

        //this.attachShadow({ mode: 'open' });
        this.shadowRoot!.innerHTML = litTemplateToString(templateApplication.html);



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
