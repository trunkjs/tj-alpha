import {MarkdownBlockElement} from "@/markdown/types";
import {parse_markdown_blocks} from "@/markdown/parse-markdown-blocks";
import {parse_inline_markdown} from "@/markdown/parse-inline-markdown";
import {astToHtml} from "@/markdown/ast-to-html";


export class MarkdownDocument {

    private _ast : MarkdownBlockElement[] = [];



    set markdown(value: string) {
        this._ast = parse_markdown_blocks(value);
    }

    public getHTML() : HTMLDivElement {
        let html = astToHtml(this._ast);
        return html.firstElementChild as HTMLDivElement;
    }
}
