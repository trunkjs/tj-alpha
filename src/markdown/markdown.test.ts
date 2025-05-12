import { describe, it, expect } from 'vitest';
import { MarkdownDocument } from './markdown';
import type { MarkdownElement } from './types';

/**
 * Helper – finds first element of given type in the tree.
 */
function find(
    tree: MarkdownElement[],
    type: MarkdownElement['type']
): MarkdownElement | undefined {
    const stack = [...tree];
    while (stack.length) {
        const cur = stack.shift()!;
        if (cur.type === type) return cur;
        stack.unshift(...(cur.children || []));
    }
    return undefined;
}

describe('MarkdownDocument ‑ parsing & serialisation', () => {
    it('parses a simple paragraph', () => {
        const doc = new MarkdownDocument();
        doc.markdown = 'Hello **world**';

        const paragraph = doc.children[0];
        expect(paragraph.type).toBe('paragraph');
        // Text node inside paragraph
        const strong = find(paragraph.children, 'strong');
        expect(strong?.type).toBe('strong');
        expect(strong?.children[0].text).toBe('world');
    });

    it('parses headings with correct level', () => {
        const doc = new MarkdownDocument();
        doc.markdown = '# H1\n\n## H2\n\n### H3';

        const h1 = doc.children[0];
        const h2 = doc.children[1];
        const h3 = doc.children[2];

        expect(h1.type).toBe('heading');
        expect(h1.opt).toBe(1);
        expect(h1.children[0].text).toBe('H1');

        expect(h2.opt).toBe(2);
        expect(h3.opt).toBe(3);
    });

    it('parses ordered and unordered lists', () => {
        const md = `- item 1
- item 2
1. first
2. second`;
        const doc = new MarkdownDocument();
        doc.markdown = md;

        const ul = doc.children[0];
        const ol = doc.children[1];

        expect(ul.type).toBe('list');
        expect(ul.opt).toBeUndefined();           // bullet list

        expect(ol.type).toBe('list');
        expect(ol.opt).toBe('ordered');           // implementation detail
    });

    it('parses links and images', () => {
        const md = '[TJ](https://example.com) ![alt](img.png)';
        const doc = new MarkdownDocument();
        doc.markdown = md;

        const link = find(doc.children, 'link');
        const img = find(doc.children, 'image');

        expect(link?.opt).toBe('https://example.com');
        expect(img?.opt).toBe('img.png');
        expect(img?.text).toBe('alt');
    });

    it('parses inline code & fenced code-blocks with language', () => {
        const md = 'Here is `code`.\n\n```ts\nconsole.log(1);\n```';
        const doc = new MarkdownDocument();
        doc.markdown = md;

        const inline = find(doc.children, 'inline-code');
        const block = find(doc.children, 'code');

        expect(inline?.text).toBe('code');
        expect(block?.opt).toBe('ts');
        expect(block?.children[0].text).toContain('console.log');
    });

    it('parses blockquotes & thematic breaks', () => {
        const md = '> Quote\n\n---';
        const doc = new MarkdownDocument();
        doc.markdown = md;

        expect(doc.children[0].type).toBe('quote');
        expect(doc.children[1].type).toBe('thematic-break');
    });

    it('parses GitHub-style task lists', () => {
        const md = '- [x] done\n- [ ] open';
        const doc = new MarkdownDocument();
        doc.markdown = md;

        const done = doc.children[0].children[0];     // first list-item
        const open = doc.children[0].children[1];

        expect(done.type).toBe('task-list-item');
        expect(done.opt).toBe(true);

        expect(open.opt).toBe(false);
    });

    it('parses tables (header / rows / cells)', () => {
        const md = `| h1 | h2 |
|----|----|
| a  | b  |`;
        const doc = new MarkdownDocument();
        doc.markdown = md;

        const table = find(doc.children, 'table');
        expect(table).toBeDefined();

        const header = find(table!.children, 'table-header');
        const cell = find(table!.children, 'table-cell');

        expect(header?.children.length).toBe(2);
        expect(cell?.text).toBe('a');
    });

    it('attaches kramdown inline attribute lists', () => {
        const md = 'Some _emphasis_{:.small} here';
        const doc = new MarkdownDocument();
        doc.markdown = md;

        const em = find(doc.children, 'emphasis');
        expect(em?.kramdown).toEqual([
            {
                type: 'kramdown_span',
                valueType: 'class',
                value: 'small',
            },
        ]);
    });

    it('attaches kramdown block attributes', () => {
        const md = '## Head {.headline #main-key}\n';
        const doc = new MarkdownDocument();
        doc.markdown = md;

        const head = find(doc.children, 'heading');
        expect(head?.kramdown).toEqual(
            expect.arrayContaining([
                { type: 'kramdown_block', valueType: 'class', value: 'headline' },
                { type: 'kramdown_block', valueType: 'id', value: 'main-key' },
            ]),
        );
    });

    it('round-trips: serialises back to the same markdown (normalised)', () => {
        const md = `
# Title

Paragraph with **bold** text.

- item 1
- item 2
`;
        const doc = new MarkdownDocument();
        doc.markdown = md;

        const serialised = doc.markdown;
        // Implementation may normalise whitespace – so trim for comparison
        expect(serialised.trim()).toBe(md.trim());
    });
});