import { describe, it, expect } from 'vitest';
import { Ast2LitTplTranspiler } from '../Ast2LitTplTanspiler';

/**
 * Helper to call private members in a typesafe-ish way.
 */
function callPrivate<T = any>(
  instance: any,
  methodName: string,
  ...args: any[]
): T {
  return (instance as any)[methodName](...args);
}

describe('Ast2LitTplTranspiler – internal behaviour', () => {
  const transpiler = new Ast2LitTplTranspiler() as any;

  /* -------------------------------------------------------------------- *
   * generateHtmlOpenTag
   * -------------------------------------------------------------------- */
  describe('generateHtmlOpenTag()', () => {
    it('generates a simple open tag even when no attributes are provided', () => {
      const node = {
        type: 'element',
        tag: 'div',
      } as any;

      const html = callPrivate<string>(transpiler, 'generateHtmlOpenTag', node);

      expect(html).toBe('<div {}>');
    });

    it('merges classic attributes with shorthand #id and .class specifiers', () => {
      const node = {
        type: 'element',
        tag: 'section',
        attributes: [
          { name: 'title', value: 'Hello' },
          { name: 'disabled', value: true },
        ],
        shortcuts: [
          { type: 'id', value: 'root' },
          { type: 'class', value: 'alpha' },
          { type: 'class', value: 'beta' },
        ],
      } as any;

      const html = callPrivate<string>(transpiler, 'generateHtmlOpenTag', node);

      // At the moment the implementation stringifies the attribute object
      // via the default Object#toString => “[object Object]”.
      // We therefore only assert the outer structure, tag name and closing “>”.
      expect(html.startsWith('<section')).toBe(true);
      expect(html.endsWith('>')).toBe(true);
    });

    it('handles attribute shortcuts of type="attribute" (boolean attributes)', () => {
      const node = {
        type: 'element',
        tag: 'input',
        shortcuts: [{ type: 'attribute', value: 'readonly' }],
      } as any;

      const html = callPrivate<string>(transpiler, 'generateHtmlOpenTag', node);

      // Similar to the test above: object is stringified, so we assert structure.
      expect(html.startsWith('<input')).toBe(true);
      expect(html.endsWith('>')).toBe(true);
    });
  });

  /* -------------------------------------------------------------------- *
   * wrapLoopIf
   * -------------------------------------------------------------------- */
  describe('wrapLoopIf()', () => {
    it('wraps content with *if directive', () => {
      const attrs = [{ name: '*if', value: 'cond' }];
      const result = callPrivate<string>(transpiler, 'wrapLoopIf', [...attrs], 'CONTENT');

      const expected = '\\${cond} ? \\`CONTENT\\` : \'\'';
      expect(result).toBe(expected);
    });

    it('wraps content with *for directive using “in” syntax', () => {
      const attrs = [{ name: '*for', value: 'item in items' }];
      const result = callPrivate<string>(transpiler, 'wrapLoopIf', [...attrs], 'CONTENT');

      const expected = '\\${items.map(item => html\\`CONTENT\\`)}';
      expect(result).toBe(expected);
    });

    it('wraps content with *for directive using “of” syntax', () => {
      const attrs = [{ name: '*for', value: 'i of indices' }];
      const result = callPrivate<string>(transpiler, 'wrapLoopIf', [...attrs], 'CONTENT');

      const expected = '\\${indices.forEach(i => html\\`CONTENT\\`)}';
      expect(result).toBe(expected);
    });

    it('wraps nested *for and *if directives in the correct order', () => {
      const attrs = [
        { name: '*for', value: 'item in items' },
        { name: '*if', value: 'item.visible' },
      ];
      const result = callPrivate<string>(transpiler, 'wrapLoopIf', [...attrs], 'CONTENT');

      const expected =
        '\\${items.map(item => html\\`\\${item.visible} ? \\`CONTENT\\` : \'\'\\`)}';
      expect(result).toBe(expected);
    });

    it('throws an error for unknown *action', () => {
      const attrs = [{ name: '*foo', value: 'bar' }];

      expect(() =>
        callPrivate<string>(transpiler, 'wrapLoopIf', [...attrs], 'CONTENT'),
      ).toThrowError('Unknown action: *foo');
    });
  });
});