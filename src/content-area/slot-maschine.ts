


function multiQuery (selector : string, rootElement : HTMLElement) {
   for (let s of selector.split("||")) {
        const elements = rootElement.querySelectorAll(s.trim());
        if (elements.length > 0) {
          return Array.from(elements);
        }
   }
    console.warn("No elements found for selector", selector, "in", rootElement);
   return [];
}


export function arrangeSlots(rootElement : HTMLElement, slotRoot? : HTMLElement) {
    if (!slotRoot) {
        slotRoot = rootElement.shadowRoot! as any;
    }

    const slots = slotRoot!.querySelectorAll('slot[select]');

    // sort by attribute "select-priority" from lowest number to highest
    const sortedSlots = Array.from(slots).sort((a, b) => {
        const aPriority = parseInt(a.getAttribute('select-priority') || '99', 10);
        const bPriority = parseInt(b.getAttribute('select-priority') || '99', 10);
        return aPriority - bPriority;
    }) as HTMLSlotElement[];

    for (let slot of sortedSlots) {
        const select = slot.getAttribute('select') || "";
        const slotName = slot.getAttribute('name');
        if (!slotName) {
            console.warn("Slot without name-attribute found", slot);
            continue;
        }
        if (select === "") {
            console.warn("Slot without select-attribute found", slot);
            continue;
        }

        const slotElements = multiQuery(select, rootElement);
        if (slotElements.length === 0) {
            continue;
        }

        // the slot can have child-* attributes. They are set on each child element
        let childAttributes: Record<string, string> = {};
        for (let attr of slot.attributes) {
            if (attr.name.startsWith("child-")) {
                childAttributes[attr.name.substring(6)] = attr.value;
            }
        }


        for (let e of slotElements) {
            if (e.hasAttribute("slot")) {
                continue; // already in a slot
            }

            e.setAttribute("slot", slotName);
            for (let attrName in childAttributes) {
                e.setAttribute(attrName, childAttributes[attrName]);
            }

            // Seems to be subelement. Move it to the main element
            if (e.parentElement !== rootElement) {
                rootElement.appendChild(e);
            }
        }

        // check if the slot is empty - if so, add a hidden attribute

    }

    for(let slot of sortedSlots) {
        if (slot.assignedNodes({flatten: true}).length === 0) {
            slot.setAttribute("hidden", "no content");
        } else {
            slot.removeAttribute("hidden");
        }
    }

}
