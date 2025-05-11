import style from "./details-accorion.scss?inline";
import {html, unsafeCSS} from "lit";
import {register_template, TemplateApplication, TemplateResultCallback} from "../../src/section/section-registry";




register_template("#accordion-element", {

        html: (element, layout) => html`
        <details>
            <summary part="summary"><slot name="summary" select="${layout["summary-selector"]}"></summary><slot id="main"></slot>
        </details>`,

        css: unsafeCSS(style),
        layout: {
            "automation": {
                default: "first-open",
                options: ["first-open", "all-open", "all-closed"],
                publish: true,
            },
            "indicator-flow": {
                default: "row",
                options: ["row", "row-reverse"],
                publish: true,
            },
            "summary-selector": {
                default: "h1,h2,h3,h4,h5,h6",
            }
        },
        connectedCallback: (current: HTMLElement, features: Record<string, string>) => {
            let details = current.shadowRoot?.firstElementChild as HTMLDetailsElement;
            let summary = details.querySelector("summary") as HTMLElement;
            const mainSlot = details.querySelector("#main") as HTMLElement;


            // init
            console.log("connected", current, features);
           // body.style.opacity   = details.open ? "1" : "0";

            mainSlot.addEventListener("transitionend", (e) => {
                console.log("transitionend", e);
                 if ( ! details.classList.contains("open")) {
                     details.open = false
                 }
            });

            summary.addEventListener("click", (e) => {
                details.style.setProperty("--accordion-max-height", `${mainSlot.scrollHeight}px`);
                e.preventDefault();
                const isOpen = details.open;
                if ( ! isOpen) {
                    details.open = true;
                    details.classList.add("open");
                    details.classList.remove("close");
                } else {
                    details.classList.remove("open");
                    details.classList.add("close");
                }

            });
        },
        disconnectedCallback: (current: HTMLElement, features: Record<string, string>) => {
            console.log("disconnected", current, features);
        }
});
