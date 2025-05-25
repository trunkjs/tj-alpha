import {MPugAstAttribute, MPugAstDocument, MPugAstNode} from "@/mpug/MPugAstParser";
import {PeekType, TokenReader2} from "@/tools/TokenReader2";


export class Ast2LitTplTranspiler {


    private generateHtmlOpenTag(node: MPugAstNode): string {
        if ( ! node.attributes)
            node.attributes = [];
        let attributes = Object.fromEntries(node.attributes.map((a) => [a.name, a.value ?? true]))

        if (node.shortcuts) {
            node.shortcuts.forEach((s) => {
                if (s.type === "id") {
                    attributes.id = s.value;
                } else if (s.type === "class") {
                    attributes.class = (attributes.class || "") + " " + s.value;
                } else if (s.type === "attribute") {
                    attributes[s.value] = true; // boolean attribute
                }
            });
        }
        return `<${node.tag} ${attributes}>`;
    }

    private wrapLoopIf(actionNodes: MPugAstAttribute[], content : string) {
        const curNode = actionNodes.shift();
        if ( ! curNode) {
            return content;
        }
        switch (curNode.name) {
            case "*if":
                return `\${${curNode.value}} ? \`${content}\` : ''`;
            case "*for":
                const t = new TokenReader2(curNode.value as string);
                const result = t.readUntil(["in", "of"], PeekType.Exclude);
                const item = result.content.trim();
                const collection = t.rest.trim();
                if (result.match == "in") {
                    return `\${${collection}.map(${item} => html\`${content}\`)}`;
                } else if (result.match == "of") {
                    return `\${${collection}.forEach(${item} => html\`${content}\`)}`;
                }


            default:
                throw new Error(`Unknown action: ${curNode.name}`);
        }
    }



    public generateNode(node: MPugAstNode): string {
        const actionNodes = node.attributes?.filter((a) => a.name.startsWith("*"));


        let code = "";

        for (const actionNode of actionNodes || []) {
            switch (actionNode.name) {
                case "*if":
                    code += "${" + actionNode.value {\`;`
                    break;
                case "*else":
                    code += "} else {";
                    break;
                case "*for":
                    const [item, collection] = actionNode.value.split(" in ");
                    code += `for (const ${item} of ${collection}) {`;
                    break;
                case "*end":
                    code += "}";
                    break;
                default:
                    console.warn(`Unknown action: ${actionNode.name}`);
            }

        }

    }


    /**
     * Returns the function that returns the lit html``literals representation of the given MPugAstDocument.
     * @param doc
     */
    public generateTemplate(doc: MPugAstDocument): Function {

    }


}
