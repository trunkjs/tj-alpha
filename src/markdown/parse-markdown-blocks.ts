import {MarkdownBlockElement} from "@/markdown/types";
import {TokenReader} from "@/tools/TokenReader";
import {KramdownElement, parse_kramdown} from "@/markdown/parse-kramdown";
import {ulLiBlockParser} from "@/markdown/ul-li-block-parser";
import {parse_inline_markdown} from "@/markdown/parse-inline-markdown";
import { tableBlockParser } from "@/markdown/table-block-parser";



function parseKramdown(current: MarkdownBlockElement) : void {
    current.content_raw = current.content_raw.trim();

    const clines = current.content_raw.split("\n");
    if (clines.length > 0) {
        if (clines[clines.length - 1].startsWith("{:")) {
            const lastLine = clines.pop() as string;
            current.content_raw = clines.join("\n");
            current.kramdown = parse_kramdown(lastLine).elements;
        }
    }
}


export function parse_markdown_blocks(input : string) : MarkdownBlockElement[] {
    const tr = new TokenReader(input);

    let document : MarkdownBlockElement[] = [];


    let lines = input.split("\n");
    let line = 0;
    let pre_whitespace = "";

    const readBlock = () : MarkdownBlockElement => {
        let current : MarkdownBlockElement = {
            type: null,
            pre_whitespace: pre_whitespace,
            post_whitespace: "",
            content_raw: "",
            kramdown: null,
            start_line: 0,
            children: []
        }
        pre_whitespace = ""; // reset pre_whitespace for the next block
        while (line < lines.length) {
            let current_line = lines[line];
            line++;
            if (current_line.trim() === "" && current.type !== "code") {
                if (current.type === "list") {
                    current.children = ulLiBlockParser(current);
                } else if (current.type === "paragraph") {
                    current.children = parse_inline_markdown(current.content_raw);
                } else if (current.type === "table") {
                    current.children = tableBlockParser(current);
                }
                document.push(current);
                return current; // end of block
            }
            if (current.type === "code" && current_line.trim() === "```") {
                current.content_raw += current_line + "\n";
                document.push(current);
                return current; // end of code block
            }
            if (current_line.startsWith("<!--")) {
                current.type = "comment";
                current.content_raw += current_line + "\n";
                while (line < lines.length) {
                    current_line = lines[line];
                    line++;
                    current.content_raw += current_line + "\n";
                    if (current_line.endsWith("-->")) {
                        break;
                    }
                }
                document.push(current);
                return current; // end of html block
            }
            if (current_line.startsWith("#")) {
                current.type = "heading";
                // count how many # are in the line
                current.heading_level = 1;
                while (current_line[current.heading_level] === "#") {
                    current.heading_level++;
                }
            } else if (current_line.startsWith("-")) {
                current.type = "list";
            } else if (current_line.startsWith("```")) {

                current.type = "code";
            } else if (current_line.startsWith("|")) {
                current.type = "table";
            } else if (current_line.startsWith(">")) {
                current.type = "quote";
                current.content_raw = current_line.substring(1).trim();
                continue;
            } else if (current_line.startsWith("<")) {
                current.type = "html";
            } else if (current.type === null) {
                current.type = "paragraph";
            }
            current.content_raw += current_line + "\n";

        }
        return current; // end of block
    }



    while (line < lines.length) {
        let current_line = lines[line];

        // Check for blank lines
        if (current_line.trim() === "") {
            line++;
            pre_whitespace += "\n";
            continue;
        }
        let be = readBlock();
        parseKramdown(be)


    }
    // Add whitespace to the last block - if this block does not exist - create a whitespace block
    if (document.length === 0) {
        document.push({
            type: "whitespace",
            pre_whitespace: "",
            post_whitespace: "",
            content_raw: "",
            kramdown: null,
            start_line: 0,
            children: []
        });
    }
    document[document.length - 1].post_whitespace = pre_whitespace;
    return document;
}