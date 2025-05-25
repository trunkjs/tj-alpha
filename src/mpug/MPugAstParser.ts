import {TokenReader2, PeekType} from "@/tools/TokenReader2"

export type MPugAstShortcut = {
    type: "id" | "class" | "attribute";
    value: string;
}

export type MPugAstAttribute = {
    name: string;
    value?: string | true;
}

export type MPugAstNode = {
    type: "element" | "text" | "html" | "comment";
    tag?: string;
    shortcuts?: MPugAstShortcut[]; // shortcuts like id, class, attribute define in the tag
    attributes?: MPugAstAttribute[]; // attributes of the element defined in ()
    text?: string; // normal text content
    html?: string; // Unescaped HTML content
    children?: MPugAstNode[];
}

export type MPugAstDocument = {
    type: 'document';
    children: MPugAstNode[];
}


export class MPugAstParser {


    private parseShortcuts(t : TokenReader2): MPugAstShortcut[] {
        // Read shortcuts
        let shortcuts: MPugAstShortcut[] = []
        while (t.hasMore()) {
            switch (t.peek(1)) {
                case ".":
                    t.read()
                    var {content} = t.readUntil([".", "#", "("], PeekType.Peek)
                    // consume the content
                    shortcuts.push({type: "class", value: content})
                    break
                case "#":
                    t.read()
                    var {content: idContent} = t.readUntil([".", "#", "("], PeekType.Peek)
                    shortcuts.push({type: "id", value: idContent})
                    break
                case "(":
                    return shortcuts // Exit the loop to read attributes
                default:
                    // If none matched, break the loop
                    return shortcuts
            }
        }
        return shortcuts
    }

    private parseAttributes(t: TokenReader2): MPugAstAttribute[] {
        let attributes: MPugAstAttribute[] = []
        if ( ! t.hasMore() || t.peek(1) !== "(") {
            return attributes // No attributes to parse
        }
        t.read() // Consume the opening parenthesis
        while (t.hasMore()) {
            // Skip any leading whitespace
            t.readWhiteSpace()

            if (t.peek(1) === ")") break

            let {content: name, match} = t.readUntil([" ", "=", ")"], PeekType.Peek);
            if (match === "=") {
                t.read() // Consume the equals sign
                attributes.push({name, value: t.readPrimitive({stringDelimiters: ['"', '\'',], escapeCharacter: "\\"}).value})
                continue;
            }
            attributes.push({name, value: true}) // Boolean attribute
        }
        // consume closing ')'
        if (t.peek(1) !== ")")
            throw new Error(`Expected closing parenthesis ')' at line ${t.curLine}, column ${t.curColumn}`);
        t.read()
        return attributes
    }

    public parseLine(line: string, lineNumber: number): MPugAstNode {
        if (line.startsWith("|")) {
            // This is a text node
            return {
                type: "text",
                text: line.slice(1).trim(), // Remove the leading pipe and trim whitespace
            };
        }
        if (line.startsWith("//")) {
            // This is a comment node
            return {
                type: "comment",
                text: line.slice(2).trim(), // Remove the leading slashes and trim whitespace
            };
        }


        const t = new TokenReader2(line)
        if (line.startsWith("!=")) {
            // This is an unescaped HTML node
            t.read(2) // Consume the "!="
            t.readWhiteSpace();
            return {
                type: "html",
                html: t.readPrimitive({stringDelimiters: ['"', '\'',]}).value,
            };
        }


        let {content}   = t.readUntil([".", "#", "("], PeekType.Peek)

        let ret : MPugAstNode = {
            type: "element",
            tag: content === "" ? "div" : content, // Default tag if none is specified
            shortcuts: this.parseShortcuts(t),
            attributes: this.parseAttributes(t),
        }

        // Read the rest of the line for text or HTML content
        t.readWhiteSpace()
        if (t.isEnd())
            return ret // No text or HTML content
        if (t.peek(1) === "|") {
            t.read() // Consume the pipe character
            let {content: textContent} = t.readUntil("\n")
            ret.text = textContent.trim() // Set the text content
        }
        else if (t.peek(1) === "=") {
            t.read() // Consume the equals sign
            let {content: htmlContent} = t.readUntil("\n")
            ret.html = htmlContent.trim() // Set the HTML content
        }

        return ret
    }


    public parseDocument(lines: string[]): MPugAstDocument {
        const nodes: MPugAstNode[] = [];
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line === "") continue; // Skip empty lines
            const node = this.parseLine(line, i + 1);
            nodes.push(node);
        }
        return {
            type: 'document',
            children: nodes,
        };
    }


}
