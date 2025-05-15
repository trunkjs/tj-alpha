import {KramdownElement, parse_kramdown} from "@/markdown/parse-kramdown";
import {TokenReader} from "@/tools/TokenReader";


type InlineMarkdownElement = {
    type: 'text' | 'link' | 'image' | 'whitespace' | 'html' | null;
    href?: string | null;
    alt?: string | null;
    content?: string | InlineMarkdownElement[];
    kramdown?: KramdownElement[] | null;
}



function formatMarkdown(input: string): string {
    return input
        .replace(/(?<!\*)\*\*\*([^\n]+?)\*\*\*/g, '<strong><em>$1</em></strong>')
        .replace(/(?<!\*)\*\*([\s\S]+?)\*\*/g, '<strong>$1</strong>')
        .replace(/(?<!\*)\*([\s\S]+?)\*/g, '<em>$1</em>')
        .replace(/__([\s\S]+?)__/g, '<strong>$1</strong>')
        .replace(/_([\s\S]+?)_/g, '<em>$1</em>')
        .replace(/`([\s\S]+?)`/g, '<code>$1</code>')
        .replace(/~~([\s\S]+?)~~/g, '<del>$1</del>');
}


export function parse_inline_markdown(input : string) : InlineMarkdownElement[] {
    input = formatMarkdown(input);
    let ret: InlineMarkdownElement[] = [];
    let tr = new TokenReader(input);




    while (tr.more()) {
        const start = tr.readUntilPeek(["<", "[", "!["], true);
        if (start.value !== "") {
            ret.push({
                type: "text",
                content: start.value
            });
        }
        let element : InlineMarkdownElement = {
            type: null
        }
        switch (start.peek) {
            case "<":
                let html = tr.readUntil(">", true);

                if (html !== "") {
                    ret.push({
                        type: "html",
                        content: html
                    });
                }
                break;
            case "![":
                element.type = "image";
            case "[":
                if (element.type === null) {
                    element.type = "link";
                }
                let content = tr.readUntil("]");

                tr.readChar();
                if (tr.peekChar() !== "(") {
                    element.content = content;
                    break;
                }
                tr.readChar();
                let href = tr.readUntil(")");
                if (element.type === "link") {
                    element.content = parse_inline_markdown(content);
                }
                tr.readChar();
                if (tr.peek() === "{") {
                    let kramdownResult = parse_kramdown(input.substring(tr.index));
                    element.kramdown = kramdownResult.elements;
                    tr.index += kramdownResult.kramdown_length;
                }
                ret.push(element);
                break;


            default:
                throw new Error("Unknown token: " + start.peek);
        }

    }
    return ret;


}
