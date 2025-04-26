import {create_element} from "@/tools/create-element";

const fail = (ln: number, msg: string): never => {
    /* eslint-disable-next-line no-throw-literal */
    throw new Error(`qhtml: line ${ln} → ${msg}`);
}
type Attrs = Record<string, string>;

/**
 *
 * <example>
 * const view = qhtml`
 * %% root-level comment
 *  .container #main style="background:lightgray"
 *  > h1 .title data-info="heading" | Welcome to \"qhtml\"
 *  > p .lead | One DSL – all the things.
 *  > ul .list
 *  >> li | Item 1
 *  >> li .highlight | Item 2
 *  >>> span .badge #badge | NEW %% inline comment
 *  > form action="/submit" method='post'
 *  >> input type="text" name="username" placeholder="Your name"
 *  >> button .btn .btn-primary type="submit" | Send
 *  > .footer
 *  | © 2025 MySite
 * `;
 * </example>
 *
 * @param strings
 * @param expr
 */
export function qhtml(
    strings: TemplateStringsArray,
    ...expr: unknown[]
): DocumentFragment {
    const lines = String.raw({ raw: strings }, ...expr)
        .trim()
        .replaceAll('\r\n', '\n')
        .replaceAll('\r', '\n')
        .split('\n');

    const frag = document.createDocumentFragment();
    const stack: (HTMLElement | DocumentFragment)[] = [frag];

    lines.forEach((raw, ln) => {
        let depth = 0;
        while (raw[depth] === '>') depth++;
        raw = raw.slice(depth).trim();
        depth += 1;

        if (!raw) return;

        /* -------- tokenize (no RegExp) ---------------------------------- */
        const tokens: string[] = [];
        let cur = '';
        let inQuote = false;
        let q = '';

        for (let i = 0; i < raw.length; i++) {
            const ch = raw[i];
            if (inQuote) {
                if (ch === '\\') {
                    if (i + 1 >= raw.length)
                        fail(ln + 1, 'Backslash at EOL inside string');
                    cur += ch + raw[++i];
                } else if (ch === q) {
                    inQuote = false;
                    cur += ch;
                } else cur += ch;
            } else {
                if (ch === '"' || ch === "'") {
                    inQuote = true;
                    q = ch;
                    cur += ch;
                } else if (ch === ' ') {
                    if (cur) {
                        tokens.push(cur);
                        cur = '';
                    }
                } else {
                    cur += ch;
                }
            }
        }
        if (inQuote) fail(ln + 1, 'Unterminated string');
        if (cur) tokens.push(cur);

        /* -------- inline comment ---------------------------------------- */
        let comment: string | undefined;
        for (let i = 0; i < tokens.length; i++) {
            if (tokens[i].startsWith('%%')) {
                comment = tokens.slice(i).join(' ').slice(2).trim();
                tokens.length = i;
                break;
            }
        }

        if (tokens[0] === '|') {
            if (depth - 1 >= stack.length)
                fail(ln + 1, 'Text depth has no parent');
            stack[depth - 1].append(tokens.slice(1).join(' '));
            if (comment) stack[depth - 1].append(document.createComment(comment));
            return;
        }

        if (stack.length < depth)
            fail(ln + 1, `Depth ${depth - 1} has no parent`);

        /* -------- element line ----------------------------------------- */
        const first = tokens.shift()!;
        let i = 0,
            tag = '';
        const cls: string[] = [];
        let id = '';

        while (i < first.length && first[i] !== '.' && first[i] !== '#')
            tag += first[i++];
        if (!tag) tag = 'div';

        while (i < first.length) {
            const mark = first[i++];
            const buf: string[] = [];
            while (i < first.length && first[i] !== '.' && first[i] !== '#')
                buf.push(first[i++]);
            if (!buf.length) fail(ln + 1, 'Empty "." or "#" token');
            mark === '.' ? cls.push(buf.join('')) : (id = buf.join(''));
        }

        const attrs: Attrs = {};
        if (id) attrs.id = id;

        for (const t of tokens) {
            if (t.startsWith('.')) cls.push(t.slice(1));
            else if (t.startsWith('#')) attrs.id = t.slice(1);
            else {
                const eq = t.indexOf('=');
                if (eq === -1) fail(ln + 1, `Attr "${t}" lacks '='`);
                const name = t.slice(0, eq);
                let val = t.slice(eq + 1);
                if (!val) fail(ln + 1, `Attr "${name}" lacks value`);
                if (
                    (val.startsWith('"') && val.endsWith('"')) ||
                    (val.startsWith("'") && val.endsWith("'"))
                ) {
                    val = val.slice(1, -1).replaceAll('\\"', '"').replaceAll("\\'", "'");
                }
                attrs[name] = val;
            }
        }

        if (cls.length) attrs.class = cls.join(' ');

        const el = create_element(tag, attrs);
        stack[depth] = el;
        stack[depth - 1].appendChild(el);
        if (comment) el.append(document.createComment(comment));
    });

    return frag;
}
