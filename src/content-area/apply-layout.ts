import {hydrateKeyValueString} from "@/tools/key-value-string-parser";
import {TjSection} from "@/section/tj-section";

export function applyLayout(node : HTMLElement) : HTMLElement | null {
    if ( ! node.hasAttribute('layout')) {
        // Only parse the first layer of layout nodes
        Array.from(node.childNodes).forEach(child => {
            if (child instanceof HTMLElement) {
                applyLayout(child);
            }
        });
        return null;
    }

    let layout = node.getAttribute('layout')!;
    let layoutHydrated = hydrateKeyValueString(layout);

    let use = layoutHydrated["use"];
    if (use !== undefined) {
        let replacementElement = null;
        if (use.startsWith("#")) {
            try {
                replacementElement =  new TjSection(layoutHydrated, node.children);
            } catch (e) {
                console.error("Error creating section with use: ", use, "on node", node, "\n", e );
                return null;
            }

        } else {
            replacementElement = document.createElement(use);
        }
        // Append all children to the new element
        while (node.firstChild) {
            replacementElement.appendChild(node.firstChild);
        }
        node.replaceWith(replacementElement!);
    }

    return node;

}
