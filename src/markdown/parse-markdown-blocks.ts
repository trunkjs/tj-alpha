import {MarkdownBlockElement} from "@/markdown/types";
import {TokenReader} from "@/tools/TokenReader";

export function parse_markdown_blocks(input : string) : MarkdownBlockElement[] {
    const tr = new TokenReader(input);

    let document : MarkdownBlockElement[] = [];


    let lines = input.split("\n");
    let line = 0;
    let pre_whitespace = "";

    const readBlock = () => {
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
                document.push(current);
                return; // end of block
            }
            if (current.type === "code" && current_line.trim() === "```") {
                current.content_raw += current_line + "\n";
                document.push(current);
                return; // end of code block
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
            } else if (current_line.startsWith(">")) {
                current.type = "quote";
            } else if (current_line.startsWith("<")) {
                current.type = "html";
            } else if (current.type === null) {
                current.type = "paragraph";
            }
            current.content_raw += current_line + "\n";
        }
        document.push(current);
    }

    while (line < lines.length) {
        let current_line = lines[line];

        // Check for blank lines
        if (current_line.trim() === "") {
            line++;
            pre_whitespace += "\n";
            continue;
        }
        readBlock();
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
