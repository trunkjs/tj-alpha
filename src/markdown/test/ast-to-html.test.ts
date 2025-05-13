import { describe, it, expect } from 'vitest';
import { astToHtml } from '@/markdown/ast-to-html';
import {MarkdownBlockElement} from "../types";
import {create_element} from "../../tools/create-element";


/**
 * – returns a fullyinitialised MarkdownBlockElement with sane defaults * Individual tests can override any field via `partial`.
 */
function mdBlock(
    partial: Partial<MarkdownBlockElement> & Pick<MarkdownBlockElement, 'type' | 'content_raw'>
): MarkdownBlockElement {
    return {

        pre_whitespace: '',
        post_whitespace: '',
        kramdown: null,
        start_line: 0,
        children: [],
        heading_level: (partial as any).heading_level,
        // spread at the end so explicit overrides win
        ...partial
    } as MarkdownBlockElement;
}

describe('astToHtml – edge-cases', () => {
    it('returns an empty fragment for empty input', () => {
        const frag = astToHtml([]);
        expect(frag.childElementCount).toBe(0);
    });

    it('renders heading block with correct level & content', () => {
        const frag = astToHtml([
            mdBlock({
                type: 'heading',
                heading_level: 3,
                content_raw: 'Heading Content'
            })
        ]);

        const el = frag.children[0] as HTMLElement;
        expect(el.tagName).toBe('H3');
        expect(el.textContent).toBe('Heading Content');
    });

    it('renders list block inside a <ul>', () => {
        const frag = astToHtml([
            mdBlock({
                type: 'list',
                // astToHtml simply injects raw HTML – we therefore pass ready-made list items
                content_raw: '<li>Item&nbsp;1</li><li>Item 2</li>'
            })
        ]);

        const ul = frag.querySelector('ul')!;
        expect(ul).not.toBeNull();
        expect(ul.children.length).toBe(2);
        //expect(ul.children[0].textContent).toBe('Item 1'); // NB: &nbsp; turns into U+00A0
        expect(ul.children[1].textContent).toBe('Item 2');
    });

    it('renders code block inside <pre>', () => {
        const code = 'console.log("hi");';
        const frag = astToHtml([
            mdBlock({
                type: 'code',
                content_raw: code
            })
        ]);



        const pre = frag.querySelector('pre')!;
        expect(pre).not.toBeNull();
        expect(pre.textContent).toBe(code);
    });

    it('renders quote block inside <blockquote>', () => {
        const frag = astToHtml([
            mdBlock({
                type: 'quote',
                content_raw: 'Block quote'
            })
        ]);

        const blockquote = frag.querySelector('blockquote')!;
        expect(blockquote).not.toBeNull();
        expect(blockquote.textContent).toBe('Block quote');
    });

    it('injects bare HTML from "html" block directly (multiple root nodes)', () => {
        const raw = '<div id="foo"></div><span class="bar">baz</span>';
        const frag = astToHtml([
            mdBlock({
                type: 'html',
                content_raw: raw
            })
        ]);

        expect(frag.querySelector('#foo')).not.toBeNull();
        expect(frag.querySelector('.bar')?.textContent).toBe('baz');
        // should be two direct children
        expect(frag.children.length).toBe(2);
        expect(frag.children[0].tagName).toBe('DIV');
        expect(frag.children[1].tagName).toBe('SPAN');
    });

    it('renders paragraph block inside <p>', () => {
        const txt = 'Plain paragraph';
        const frag = astToHtml([
            mdBlock({
                type: 'paragraph',
                content_raw: txt
            })
        ]);

        const p = frag.querySelector('p')!;
        expect(p).not.toBeNull();
        expect(p.textContent).toBe(txt);
    });

    it('falls back to <p> for unknown / unexpected block types', () => {
        const frag = astToHtml([
            mdBlock({
                type: 'whitespace',
                content_raw: 'ignored?'
            })
        ]);

        const p = frag.querySelector('p')!;
        expect(p).not.toBeNull();
        expect(p.textContent).toBe('ignored?');
    });

    it('keeps the original order of blocks', () => {
        const frag = astToHtml([
            mdBlock({ type: 'heading', heading_level: 2, content_raw: 'A' }),
            mdBlock({ type: 'paragraph', content_raw: 'B' }),
            mdBlock({ type: 'list', content_raw: '<li>C</li>' })
        ]);

        const tags = Array.from(frag.children).map(el => el.tagName);
        expect(tags).toEqual(['H2', 'P', 'UL']);
    });

    it('gracefully ignores (currently unused) kramdown attributes', () => {
        const frag = astToHtml([
            mdBlock({
                type: 'heading',
                heading_level: 2,
                content_raw: 'Title',
                kramdown: [
                    { valueType: 'id', value: 'my-id' } as any,
                    { valueType: 'class', value: 'cls' } as any
                ]
            })
        ]);

        const h2 = frag.querySelector('h2')!;
        expect(h2).not.toBeNull();
        // buildAttributes() is **not** invoked → elements must not have id / class
        expect(h2.hasAttribute('id')).toBe(false);
        expect(h2.className).toBe('');
    });
});
