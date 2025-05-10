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


    protected copyAttributes(originalNode : HTMLElement, newNode : HTMLElement, isHr : boolean = false) {
        // copy all attributes starting with "section-" or layout to new Node

        let attributeNames = originalNode.getAttributeNames();
        for(let attrName of attributeNames) {
            if (attrName.startsWith("section-")) {
                newNode.setAttribute(attrName.substring(8), originalNode.getAttribute(attrName)!);
                originalNode.removeAttribute(attrName);
            } else if (attrName.startsWith("layout-")) {
                newNode.setAttribute(attrName.substring(7), originalNode.getAttribute(attrName)!);
                originalNode.removeAttribute(attrName);
            } else if (attrName === "i") {
                continue;
            } else if (attrName === "layout"){
                newNode.setAttribute("layout", originalNode.getAttribute(attrName)!);
                originalNode.removeAttribute(attrName);
            } else if (attrName.startsWith("layout-")) {
                newNode.setAttribute(attrName.substring(7), originalNode.getAttribute(attrName)!);
                originalNode.removeAttribute(attrName);
            } else if (isHr) {
                // if the node is a hr and has a section-hr attribute, set it to the new container node
                newNode.setAttribute(attrName, originalNode.getAttribute(attrName)!);
                originalNode.removeAttribute(attrName);
            }
        }
    }


    protected createNewContainerNode(originalNode : HTMLElement, i : ElementI) : HTMLElement {
        let newContainerNode = create_element("section", {i: i.getNasString()});
        // copy all attributes starting with "section-" or layout to new Node
        let newContainerAttributes = originalNode.getAttributeNames()


        this.copyAttributes(originalNode, newContainerNode, originalNode.tagName === "HR");
        return newContainerNode;
    }


    protected arrangeSingleNode(node : HTMLElement, i: ElementI) {
        let j = 0;
        for(j = 0; j < this.containerIndex.length; j++) {
            if (this.containerIndex[j] >= i.getNasInt()) {
                break;
            }
        }



        let containerNode = null;
        if (i.getModifier() === IModifier.APPEND) {
            containerNode = this.containerPath[j]
        } else {
            containerNode = this.createNewContainerNode(node, i);
        }

        let curContainer = this.containerPath[j-1];
        this.containerPath.length = j;
        this.containerIndex.length = j;
        // Create new Node and apply attributes from original node

        containerNode.appendChild(create_element("p", {}, JSON.stringify({integ: i.getNasInt(), string: i.getNasString(), mod: i.getModifier()})));
        containerNode.appendChild(node);
        curContainer.appendChild(containerNode);

        // Hide HR Elements with i-attribute
        if (node.tagName === "HR" && node.hasAttribute("i")) {
            // hr shortcut. Move all attributes to the new container node. If there are any attributes if append modifier - trigger a warning and ignore them

            // if the node is a hr and has a section-hr attribute, set it to the new container node
            node.setAttribute("hidden", "true");

        }



        this.containerPath.push(containerNode);
        this.containerIndex.push(i.getNasInt());
        this.currentContainerNode = containerNode;

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
