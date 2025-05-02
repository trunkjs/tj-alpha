import {ElementI, IModifier} from "@/content-area/element-i";
import {create_element} from "@/tools/create-element";


const autoIElements = ["h1", "h2", "h3", "h4", "h5", "h6", "hr"];


export class ContentBuilder {


    constructor(rootNode : HTMLElement) {
        this.currentContainerNode = this.rootNode = rootNode;
        this.containerPath.push(this.rootNode);
    }

    private detectI(element : HTMLElement) : ElementI | null {
        // check if the element tag is in the autoIElements or the element has a i-attribute - if not return null
        if (! autoIElements.includes(element.tagName.toLowerCase()) && ! element.hasAttribute("i"))
            return null;

        let i = element.getAttribute("i") || "";

        if (i === "" && /^h[1-6]$/.test(element.tagName.toLowerCase())) {
            // if the element has no i-attribute, take it from the tag name
            i = element.tagName.substring(1);
            if (i === "1") {
                i = "2"; // Tread h1 as h2
            }
        }

        let ret = new ElementI(i);
        return ret;
    }


    private rootNode : HTMLElement;
    private currentContainerNode : HTMLElement | null = null;
    private containerPath : HTMLElement[] = [];
    private containerIndex : number[] = [0];


    protected createNewContainerNode(originalNode : HTMLElement, i : ElementI) : HTMLElement {
        console.log(i);
        let newContainerNode = create_element("section", {i: i.getNasString()});
        // copy all attributes starting with "section-" or layout to new Node
        let newContainerAttributes = originalNode.getAttributeNames()

        if (originalNode.hasAttribute("layout")) {
            newContainerNode.setAttribute("layout", originalNode.getAttribute("layout")!);
        }
        for(let attr of newContainerAttributes) {
            if (attr.startsWith("section-")) {
                newContainerNode.setAttribute(attr.substring(8), originalNode.getAttribute(attr)!);
            }
        }
        return newContainerNode;
    }


    protected arrangeSingleNode(node : HTMLElement, i: ElementI) {
        let j = 0;
        for(j = 0; j < this.containerIndex.length; j++) {
            if (this.containerIndex[j] > i.getNasInt()) {
                break;
            }
        }

        j = j-1;

        let curContainer = this.containerPath[j];
        this.containerPath.length = j+1;
        this.containerIndex.length = j+1;

        // Create new Node and apply attributes from original node
        let newContainerNode = this.createNewContainerNode(node, i);
        newContainerNode.appendChild(node);
        curContainer.appendChild(newContainerNode);

        this.containerPath.push(newContainerNode);
        this.containerIndex.push(i.getNasInt());
        this.currentContainerNode = newContainerNode;

    }

    private appendToCurrentContainer(node : Node) {
        if (this.currentContainerNode === null) {
            throw new Error("No current container node set");
        }
        this.currentContainerNode.appendChild(node);
    }


    public arrange(nodes : Node[]) {

        for(let curNode of nodes) {
            if (curNode.nodeType !== Node.ELEMENT_NODE) {
                this.appendToCurrentContainer(curNode);
                continue;
            }
            const element = curNode as HTMLElement;
            let i = this.detectI(element);
            if (i?.getModifier() === IModifier.NONE || i === null) {
                // skip this node
                this.appendToCurrentContainer(curNode);
                continue;
            }


            this.arrangeSingleNode(element, i!);


        }


    }

}
