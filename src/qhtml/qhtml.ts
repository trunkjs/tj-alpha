import { create_element } from "@/tools/create-element";
import { TokenReader } from "@/tools/TokenReader";
import {TemplateResult} from "lit";

type AttrMap = Record<string, string>;

/**
 * ParsedLine describes result of parsing one visual line.
 */
interface ParsedLine {
    depth?: number;
    type: 'element' | 'text' | 'comment';
    tag?: string;
    attrs?: AttrMap;
    text?: string|null;
    comment?: string;
}

type ParsedWordContent = {
    tag?: string;
    classes?: string[];
    id?: string;
}


/**
 * Extracts tag, classes, and id from a word.
 *
 * tag.class1.class2#id
 *
 * @param word
 */
function extractDataFromWord(word: string): ParsedWordContent {
    // Extract the Tag name by Regex and remove it from the word if found (using replace)
    const tagRegex = /^[a-zA-Z0-9]+/;

    const tagMatch = word.match(tagRegex);
    const tag = tagMatch ? tagMatch[0] : undefined;
    const remainingWord = tagMatch ? word.replace(tagRegex, '') : word;

    // Extract and remove #id
    const idRegex = /#([a-zA-Z0-9-_]+)/;
    const idMatch = remainingWord.match(idRegex);
    const id = idMatch ? idMatch[1] : undefined;
    const remainingWordWithoutId = idMatch ? remainingWord.replace(idRegex, '') : remainingWord;

    // Extract clsses by spliting by .
    const classes = remainingWordWithoutId.split('.').filter((cls) => cls !== '');

    return {tag, classes, id};
}
export { extractDataFromWord };


/**
 * Parse one line into structured ParsedLine.
 *
 * @param raw Input line string
 * @param ln  Line number (for errors)
 */
function parseLine(raw: string, ln: number): ParsedLine | null {
    const reader = new TokenReader(raw);
    reader.skipWhitespace();

    const attrWordRegex = /[a-zA-Z0-9-.#]/;



    // Determine Depth
    let depth = 1;
    let tag = "div";
    let text : string | null = null;
    let classes: string[] = [];
    let attrs: AttrMap = {};
    while (reader.peekChar() === '>') {
        depth++;
        reader.readChar();
        reader.skipWhitespace();
    }

    if (reader.peekChar() === '%') {
        reader.readChar();
        const comment = reader.readUntil('\n');
        return { type: 'comment', comment };
    }

    if (reader.peekChar() === '|') {
        reader.readChar();
        reader.skipWhitespace();
        text = reader.readUntil('\n');
        return { type: 'text', text };
    }

    const firstWord = reader.readWord(attrWordRegex);
    if (firstWord) {
        const parsed = extractDataFromWord(firstWord);
        tag = parsed.tag || tag;
        classes = parsed.classes || [];
        if (parsed.id) {
            attrs.id = parsed.id;
        }
    }


    // check for comment and remove
    if (reader.peekChar() === '%') {
        reader.readChar();
        reader.readUntil('\n');
    }


    while (!reader.isEOF()) {
        reader.skipWhitespace();
        if (reader.peekChar() === '|') {
            reader.readChar();
            reader.skipWhitespace();
            text = reader.readUntil('\n');
            break;
        }
        if (reader.peekChar() === '%') {
            reader.readChar();
            reader.readUntil('\n'); // Skip comment
            break;
        }
        let attrName = reader.readWord(attrWordRegex);
        if (!attrName) break;
        if (attrName.startsWith(".")) {
            classes.push(attrName.substring(1));
            continue;
        }
        if (attrName.startsWith("#")) {
            attrs.id = attrName.substring(1);
            continue;
        }
        reader.skipWhitespace();
        if (reader.peekChar() !== '=') {
            throw new Error(`qhtml line ${ln + 1}: Attribute "${attrName}" lacks '='`);
        }
        reader.readChar(); // consume '='
        let attrValue = reader.readValue(" "); // Read until whitespace
        if (!attrValue) {
            throw new Error(`qhtml line ${ln + 1}: Attribute "${attrName}" lacks value`);
        }
        attrs[attrName] = attrValue.value_str;
    }

    if (attrs.hasOwnProperty("class")) {
        classes.push(attrs.class);
    }
    if (classes.length > 0) {
        attrs.class = classes.join(" ");
    }

    return { depth, type: 'element', attrs, tag, text };
}

/**
 * qhtml parses the tagged-template DSL into a DocumentFragment.
 *
 * @param strings Tagged-template string array
 * @param expr    Interpolated expressions
 * @returns       Generated DocumentFragment
 */
export function qhtml(
    strings: TemplateStringsArray,
    ...expr: unknown[]
): TemplateResult {
    const lines = String.raw({ raw: strings }, ...expr)
        .trim()
        .replaceAll('\r\n', '\n')
        .replaceAll('\r', '\n')
        .split('\n');

    const frag = document.createDocumentFragment();
    const stack: (HTMLElement | DocumentFragment)[] = [frag];

    let depth = 1;
    for (let ln = 0; ln < lines.length; ln++) {
        const raw = lines[ln];
        if (!raw.trim()) continue;
        const parsed = parseLine(raw, ln);
        if (!parsed) continue;

        depth = parsed.depth ?? depth;
        if (stack.length < depth) throw new Error(`qhtml line ${ln + 1}: Depth ${depth - 1} has no parent`);
        const parent = stack[depth - 1];

        if (parsed.type === 'comment') {
            parent.append(document.createComment(parsed.comment || ''));
            continue;
        }
        if (parsed.type === 'text') {
            stack[depth].append(parsed.text || '');
            continue;
        }
        const el = create_element(parsed.tag!, parsed.attrs || {});
        if (parsed.text) {
            el.append(document.createTextNode(parsed.text));
        }
        parent.appendChild(el);
        stack[depth] = el;
        if (parsed.comment) {
            el.append(document.createComment(parsed.comment));
        }
    }

    let doc = document.createElement("template");
    doc.content.appendChild(frag);

    // Hack to return the same as lit-html
    return {
        ['_$litType$']: 1, // 1 => HTML
        strings: Object.freeze(Object.assign([doc.innerHTML], { raw: [doc.innerHTML] })) as TemplateStringsArray,
        values: []
    }
}
