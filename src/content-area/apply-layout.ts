import {hydrateKeyValueString} from "@/tools/key-value-string-parser";
import {TjSection} from "@/content-area/tj-section";

export function applyLayout(node : HTMLElement) : HTMLElement | null {
    let attributes : Record<string, string> = {};
    node.getAttributeNames().forEach((name) => {
        attributes[name] = node.getAttribute(name) ?? "";
    });

    let layout = attributes["layout"];
    if (layout === undefined) {
        // Only parse the first layer of layout nodes
        Array.from(node.childNodes).forEach(child => {
            if (child instanceof HTMLElement) {
                applyLayout(child);
            }
        });
        return null;
    }


    let layoutHydrated = hydrateKeyValueString(layout ?? "");

    let use = layoutHydrated["use"];
    if (use !== undefined) {
        let replacementElement = null;
        if (use.startsWith("#")) {
            try {
                replacementElement =  new TjSection({layout: layoutHydrated, attributes, content: node.children});
            } catch (e) {
                console.error("Error creating section with use: ", use, "on node", node, "\n", e );
                return null;
            }

        } else {
            replacementElement = document.createElement(use);
            for(let attributeName in attributes) {
                replacementElement.setAttribute(attributeName, attributes[attributeName]);
            }
        }
        // Append all children to the new element
        while (node.firstChild) {
            replacementElement.appendChild(node.firstChild);
        }
        node.replaceWith(replacementElement!);
    }

    return node;

}
