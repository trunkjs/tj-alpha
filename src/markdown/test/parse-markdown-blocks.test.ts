import { describe, it, expect } from 'vitest';
import { parse_markdown_blocks } from '../parse-markdown-blocks';
import type { MarkdownBlockElement } from '../types';

function types(seq: MarkdownBlockElement[]) {
    return seq.map(b => b.type);
}

describe('parse_markdown_blocks ‑ edge-cases', () => {

    it('returns a single “whitespace” block for an empty string', () => {
        const ast = parse_markdown_blocks('');
        expect(ast.length).toBe(1);
        expect(ast[0].type).toBe('whitespace');
    });

    it('returns a single “whitespace” block for only blank lines', () => {
        const ast = parse_markdown_blocks('\n\n   \n');
        expect(ast.length).toBe(1);
        expect(ast[0].type).toBe('whitespace');
    });

    it('parses heading & paragraph blocks (with separating blank line)', () => {
        const md = '# Heading 1\n\nThis is a paragraph.';
        const ast = parse_markdown_blocks(md);

        expect(types(ast)).toEqual(['heading', 'paragraph']);
        expect(ast[0].content_raw.trim()).toBe('# Heading 1');
        expect(ast[1].content_raw.trim()).toBe('This is a paragraph.');
    });

    it('parses unordered lists', () => {
        const md = '- item 1\n- item 2\n\nAfter list.';
        const ast = parse_markdown_blocks(md);

        expect(types(ast)).toEqual(['list', 'paragraph']);
        expect(ast[0].content_raw.trim()).toBe('- item 1\n- item 2');
    });

    it('parses code fences and keeps inner content verbatim', () => {
        const md = '```\nconsole.log(\"hi\");\n```\n\nNext.';
        const ast = parse_markdown_blocks(md);

        expect(types(ast)).toEqual(['code', 'paragraph']);
        const code = ast[0];
        expect(code.content_raw.startsWith('```')).toBe(true);
        expect(code.content_raw.includes('console.log("hi");')).toBe(true);
        expect(code.content_raw.trim().endsWith('```')).toBe(true);
    });

    it('parses blockquotes', () => {
        const md = '> quoted line\n\nPlain line';
        const ast = parse_markdown_blocks(md);

        expect(types(ast)).toEqual(['quote', 'paragraph']);
        expect(ast[0].content_raw.trim()).toBe('> quoted line');
    });

    it('collects leading blank lines into pre_whitespace of first block', () => {
        const md = '\n\n# Title';
        const ast = parse_markdown_blocks(md);

        expect(ast[0].type).toBe('heading');
        expect(ast[0].pre_whitespace).toBe('\n\n');
    });

    it('collects trailing blank lines into post_whitespace of last block', () => {
        const md = '# Title\n\n';
        const ast = parse_markdown_blocks(md);

        const last = ast[ast.length - 1];
        expect(last.type).toBe('heading');
        // single newline between heading & EOF → should end up as post_whitespace
        expect(last.post_whitespace).toBe('\n');
    });

    it('handles consecutive paragraphs without blank lines as a single block', () => {
        const md = 'first line\nsecond line\n\nthird paragraph';
        const ast = parse_markdown_blocks(md);

        expect(types(ast)).toEqual(['paragraph', 'paragraph']);
        expect(ast[0].content_raw.trim()).toBe('first line\nsecond line');
        expect(ast[1].content_raw.trim()).toBe('third paragraph');
    });

    it('handles a code block without closing fence (edge-case) – ends at EOF', () => {
        const md = '```\nlet x = 1;';
        const ast = parse_markdown_blocks(md);

        // According to current implementation this yields a single code-block ending at EOF
        expect(ast.length).toBe(1);
        expect(ast[0].type).toBe('code');
        expect(ast[0].content_raw.startsWith('```')).toBe(true);
        expect(ast[0].content_raw.trim().endsWith('let x = 1;')).toBe(true);
    });
});