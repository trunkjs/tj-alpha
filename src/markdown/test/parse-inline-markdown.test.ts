import { describe, it, expect } from 'vitest';
import { parse_inline_markdown } from '../parse-inline-markdown';

/**
 * Minimal replica of the public shape returned by parse_inline_markdown
 * needed solely for typing inside the test-file.
 */
type InlineMarkdownElement = {
    type: 'text' | 'link' | 'image' | 'whitespace' | 'html' | null;
    content?: string | InlineMarkdownElement[];
};

/**
 * Helper – flattens InlineMarkdownElement[] back into a plain HTML string.
 * NOTE: Only implements the subset of element-types we need for the tests.
 */
function toHtml(elements: InlineMarkdownElement[]): string {
    let out = '';
    for (const el of elements) {
        switch (el.type) {
            case 'text':
                out += el.content as string;
                break;
            case 'html':
                out += `<${el.content}>`;
                break;
            case 'link':
                out += '<a>';
                out += toHtml(el.content as InlineMarkdownElement[]);
                out += '</a>';
                break;
            case 'image':
                out += '<img>';
                break;
            default:
                break;
        }
    }
    return out;
}

describe('parse_inline_markdown – edge-cases', () => {
    it('formats emphasis / strong / code / strikethrough like kramdown', () => {
        const md =
            'Start **bold** and *em* and __strong__ and _emph_ and `code` and ~~del~~<br>';
        const ast = parse_inline_markdown(md);

        // first node is the formatted text
        expect(ast[0].type).toBe('text');
        expect(ast[0].content).toBe("Start ");

        // trailing html token (<br>)
        expect(ast[1].type).toBe('html');
        expect(ast[1].content).toBe('<strong>');
    });

    it('parses raw inline HTML correctly', () => {
        const md = 'alpha <span>beta</span> gamma<br>';
        const ast = parse_inline_markdown(md);

        expect(ast[0]).toMatchObject({ type: 'text', content: 'alpha ' });
        expect(ast[1]).toMatchObject({ type: 'html', content: '<span>' });
        expect(ast[2]).toMatchObject({ type: 'text', content: 'beta' });
        expect(ast[3]).toMatchObject({ type: 'html', content: '</span>' });
        expect(ast[4]).toMatchObject({ type: 'text', content: ' gamma' });
    });

    it('parses links that contain formatting & HTML in their label', () => {
        const md =
            '[**bold** <span>html</span> text](https://example.com)<br>';
        const ast = parse_inline_markdown(md);

        const link = ast[0];
        expect(link.type).toBe('link');

        const inner = link.content as InlineMarkdownElement[];
        const htmlInside = toHtml(inner);
        expect(htmlInside).toBe(
            '<strong>bold</strong> <span>html</span> text'
        );
    });

    it('supports an image nested inside a link', () => {
        const md =
            '[![Alt Text](image.png)](https://example.com)<br>';
        const ast = parse_inline_markdown(md);

        const link = ast[0];
        expect(link.type).toBe('link');

        const inner = link.content as InlineMarkdownElement[];
        expect(inner[0].type).toBe('image');
        expect(inner[0].content).toBe('Alt Text');
    });

    it('handles multi-line strong emphasis', () => {
        const md = '**Hello\nWorld**<br>';
        const ast = parse_inline_markdown(md);

        const txt = ast[0].content as string;
        expect(txt).toBe('<strong>Hello\nWorld</strong>');
    });
});
