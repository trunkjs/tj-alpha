import { describe, it, expect } from 'vitest';
import { MarkdownDocument } from '@/markdown/markdown';
import { astToHtml } from '@/markdown/ast-to-html';
import fs from 'fs';
import path from 'path';

/**
 * Helper – normalises HTML by stripping excess whitespace between tags
 * and collapsing consecutive whitespace characters.
 */
function normalise(html: string): string {
    return html
        // remove whitespace between tags
        .replace(/>\s+</g, '><')
        // collapse any remaining consecutive whitespace
        .replace(/\s{2,}/g, ' ')
        .trim();
}

describe('MarkdownDocument – end-to-end rendering', () => {
    const fixtureDir = path.resolve(__dirname, 'fixture');
    const mdInput = fs.readFileSync(
        path.join(fixtureDir, 'demo-input.md'),
        'utf-8'
    );
    const expectedHtml = fs.readFileSync(
        path.join(fixtureDir, 'demo-jekyll-out.html'),
        'utf-8'
    );

    it('produces the expected HTML output for the demo fixture', () => {
        const mdDoc = new MarkdownDocument();
        mdDoc.markdown = mdInput;




        const container = mdDoc.getHTML();

        const producedHtml = container.innerHTML;

        expect(normalise(producedHtml)).toBe(normalise(expectedHtml));
    });
});
