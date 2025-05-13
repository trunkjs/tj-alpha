import {MarkdownBlockElement} from "@/markdown/types";
import {create_element} from "@/tools/create-element";





function buildAttributes(element: MarkdownBlockElement) : Record<string, string> {
    let ret = {} as Record<string, string>;
    for (let curAttr of element.kramdown ?? []) {
        if (curAttr.valueType === "id") {
            ret["id"] = curAttr.value ?? "";
            continue;
        }
        if (curAttr.valueType === "class") {
            if (!ret["class"])
                ret["class"] = curAttr.value!;
            else
                ret["class"] += " " + curAttr.value;
        }
        if ( ! ret[curAttr.key!])
            ret[curAttr.key!] = curAttr.value ?? "";
        else
            ret[curAttr.key!] += " " + (curAttr.value ?? "");

    }
    return ret;
}

export function astToHtml(input : MarkdownBlockElement[]) : DocumentFragment {
    const fragment = document.createDocumentFragment();
    const tpl = document.createElement("div");
    for (let curBElement of input) {

        switch (curBElement.type) {
            case "heading":
                const heading = document.createElement("h" + curBElement.heading_level);
                heading.innerHTML = curBElement.content_raw;
                fragment.appendChild(heading);
                break;
            case "list":
                const list = document.createElement("ul");
                list.innerHTML = curBElement.content_raw;
                fragment.appendChild(list);
                break;
            case "code":
                const code = document.createElement("code");
                const pre = document.createElement("pre");
                code.appendChild(pre);
                pre.textContent = curBElement.content_raw;
                fragment.appendChild(code);
                break;
            case "quote":
                const quote = document.createElement("blockquote");
                quote.innerHTML = curBElement.content_raw;
                fragment.appendChild(quote);
                break;
            case "html":
                tpl.innerHTML = curBElement.content_raw;
                for (let curChild of Array.from(tpl.children)) {
                    fragment.appendChild(curChild);
                }
                break;
            case "paragraph":
            default:
                const paragraph = document.createElement("p");
                paragraph.innerHTML = curBElement.content_raw;
                fragment.appendChild(paragraph);

        }
    }
    return fragment;
}
