import {ElementI, IModifier} from "@/content-area/helper/ElementI";
import {create_element} from "@/tools/create-element";
import {Layout, LayoutParser} from "@/content-area/helper/LayoutParser";


const autoIElements = ["h1", "h2", "h3", "h4", "h5", "h6", "hr"];


type ElementLayout = {
  layout: Layout;
  i: ElementI;
}


export class ContentBuilder {
  private rootNode: HTMLElement;
  private currentContainerNode: HTMLElement | null = null;
  private containerPath: HTMLElement[] = [];
  private containerIndex: number[] = [0];
  private layoutParser : LayoutParser;
  constructor(rootNode: HTMLElement, public debug: boolean = false) {
    this.currentContainerNode = this.rootNode = rootNode;
    this.containerPath.push(this.rootNode);
    this.layoutParser = new LayoutParser();
  }

  private detectLayout(element: HTMLElement): ElementLayout | null {
    // check if the element tag is in the autoIElements or the element has a i-attribute - if not return null
    if (!autoIElements.includes(element.tagName.toLowerCase()) && !element.hasAttribute("layout"))
      return null;


    let layout = this.layoutParser.parse(element.getAttribute("layout") || "");
    let detectedI = layout.i;


    if (detectedI === null && /^h[1-6]$/.test(element.tagName.toLowerCase())) {
      // if the element has no i-attribute, take it from the tag name
      detectedI = element.tagName.substring(1);
      if (detectedI === "1") {
        detectedI = "2"; // Tread h1 as h2
      }
    }

    return {
      layout: layout,
      i: new ElementI(detectedI || "2")
    }
  }





  protected createNewContainerNode(originalNode: HTMLElement, layout: ElementLayout): HTMLElement {
    // Join all layout classes
    let attributes = layout.layout.attributes;
    if (layout.layout.inlineClasses.length > 0) {
      if (!attributes.class) {
        attributes.class = "";
      }
      attributes.class += " " + layout.layout.inlineClasses.join(" ");
      attributes.i = layout.i.getNasString();
    }
    if (layout.layout.id) {
      if (attributes.id) {
        console.warn("Layout has an id attribute, but the original node already has an id. This will be overwritten. in ", originalNode);
      }
      attributes.id = layout.layout.id;
    }

    let newContainerNode = create_element(layout.layout.tag || 'section', attributes);
    // copy all attributes starting with "section-" or layout to new Node
    let newContainerAttributes = originalNode.getAttributeNames()


    return newContainerNode;
  }


  protected arrangeSingleNode(node: HTMLElement, layout: ElementLayout) {
    let i = layout.i;
    let j = 0;
    for (j = 0; j < this.containerIndex.length; j++) {
      if (this.containerIndex[j] >= i.getNasInt()) {
        break;
      }
    }


    let containerNode = null;
    if (i.getModifier() === IModifier.APPEND) {
      containerNode = this.containerPath[j]
    } else {
      containerNode = this.createNewContainerNode(node, layout);
    }

    let curContainer = this.containerPath[j - 1];
    this.containerPath.length = j;
    this.containerIndex.length = j;
    // Create new Node and apply attributes from original node

    if (this.debug) {
      containerNode.appendChild(create_element("p", {}, JSON.stringify({
        integ: i.getNasInt(),
        string: i.getNasString(),
        mod: i.getModifier()
      })));
    }

    containerNode.appendChild(node);
    curContainer.appendChild(containerNode);

    // Hide HR Elements with i-attribute
    if (node.tagName === "HR" && node.hasAttribute("layout")) {
      // hr shortcut. Move all attributes to the new container node. If there are any attributes if append modifier - trigger a warning and ignore them

      // if the node is a hr and has a section-hr attribute, set it to the new container node
      node.setAttribute("hidden", "");

    }


    this.containerPath.push(containerNode);
    this.containerIndex.push(i.getNasInt());
    this.currentContainerNode = containerNode;

  }





  private appendToCurrentContainer(node: Node) {
    if (this.currentContainerNode === null) {
      throw new Error("No current container node set");
    }
    this.currentContainerNode.appendChild(node);
  }


  public arrange(nodes: Node[]) {

    for (let curNode of nodes) {
      if (curNode.nodeType !== Node.ELEMENT_NODE) {
        this.appendToCurrentContainer(curNode);
        continue;
      }
      const element = curNode as HTMLElement;
      let layout = this.detectLayout(element);
      if (!layout || layout.i?.getModifier() === IModifier.SKIP) {
        // skip this node
        this.appendToCurrentContainer(curNode);
        continue;
      }


      this.arrangeSingleNode(element, layout);
    }


  }

}
