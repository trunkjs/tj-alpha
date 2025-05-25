import { MPugAstParser, MPugAstNode } from '../MPugAstParser';
import { describe, expect, test } from "vitest";

//
// Test-suite
//

describe('MPugAstParser – edge cases', () => {
    const parser = new MPugAstParser();

    test('parses tag with id shortcut', () => {
        const line = 'div#container';
        const node = parser.parseLine(line, 1) as MPugAstNode;

        expect(node.tag).toBe('div');
        expect(node.shortcuts).toEqual(
            expect.arrayContaining([{ type: 'id', value: 'container' }]),
        );
    });

    test('parses default tag when none is provided', () => {
        const line = '#onlyId';
        const node = parser.parseLine(line, 1) as MPugAstNode;

        expect(node.tag).toBe('div'); // default fallback
        expect(node.shortcuts).toEqual(
            expect.arrayContaining([{ type: 'id', value: 'onlyId' }]),
        );
    });

    test('parses multiple attributes with the same name (feature)', () => {
        const line = 'div(for="item" for="item2")';
        const node = parser.parseLine(line, 1) as MPugAstNode;

        // We expect **two** attributes with the same name to be retained
        const forAttributes = node.attributes?.filter((a) => a.name === 'for');
        expect(forAttributes).toHaveLength(2);
        expect(forAttributes?.[0].value).toBe('item');
        expect(forAttributes?.[1].value).toBe('item2');
    });

    test('parses boolean attribute (attribute without value)', () => {
        const line = 'input(disabled)';
        const node = parser.parseLine(line, 1) as MPugAstNode;

        const disabledAttr = node.attributes?.find((a) => a.name === 'disabled');
        expect(disabledAttr).toBeDefined();
        expect(disabledAttr?.value).toBe(true);
    });

    test('parses id & class together with normal attributes', () => {
        const line = 'p#id1.class1.class2(data-attrib="value")';
        const node = parser.parseLine(line, 1) as MPugAstNode;

        // Shortcuts
        const ids = node.shortcuts?.filter((s) => s.type === 'id');
        const classes = node.shortcuts?.filter((s) => s.type === 'class');

        expect(ids).toHaveLength(1);
        expect(ids?.[0].value).toBe('id1');
        expect(classes?.map((c) => c.value)).toEqual(['class1', 'class2']);

        // Attributes
        const dataAttrib = node.attributes?.find(
            (a) => a.name === 'data-attrib',
        );
        expect(dataAttrib?.value).toBe('value');
    });

    //
    // New tests for text, comment and html nodes
    //

    test('parses text node', () => {
        const line = '| Hello World';
        const node = parser.parseLine(line, 1) as MPugAstNode;

        expect(node.type).toBe('text');
        expect(node.text).toBe('Hello World');
    });

    test('parses comment node', () => {
        const line = '// This is a comment';
        const node = parser.parseLine(line, 1) as MPugAstNode;

        expect(node.type).toBe('comment');
        expect(node.text).toBe('This is a comment');
    });

    test('parses unescaped html node', () => {
        const line = "!= '<div></div>'";
        const node = parser.parseLine(line, 1) as MPugAstNode;

        expect(node.type).toBe('html');
        expect(node.html).toBe('<div></div>');
    });
});