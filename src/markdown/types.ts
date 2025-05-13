import {KramdownElement} from "@/markdown/parse-kramdown";


export type MarkdownInlineElement = {
    type:   "text" | "link" | "image" | "table-header" | "table-row" | "table-cell" | "strong" | "emphasis" | "strikethrough" | "inline-code" | "inline-html";
    // Only used for the first element

    kramdown: null | KramdownElement[];

    /**
     * For
     * - heading: the level of the heading (1-6)
     * - task-list-item: completion status (true/false)
     * - code: the language of the code block
     */
    opt?: string | number | boolean | null;
    text?: string;

    children: MarkdownInlineElement[];
}

export type MarkdownBlockElement = {
    type: "paragraph" | "heading" | "list" | "code" | "quote" | "link" | "image" | "table" | "html" | "whitespace" | null;
    heading_level?: number;
    pre_whitespace: string;
    post_whitespace: string;
    kramdown: null | KramdownElement[];
    content_raw: string;
    start_line: number;
    children: MarkdownInlineElement[];
}

