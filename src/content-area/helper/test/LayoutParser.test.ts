import {describe, it, expect, beforeEach} from 'vitest';
import {Layout, LayoutParser} from '../LayoutParser';
import {ElementI} from '../ElementI';

describe('LayoutParser', () => {
    let parser: LayoutParser;

    beforeEach(() => {
        parser = new LayoutParser();
    });

    const testExamples: Array<{ input: string; expected: Layout }> = [
        {
            input: "div.class1(attr1='value1' attr2='value2')",
            expected: {
                i: null,
                tag: 'div',
                inlineClasses: ['class1'],
                attributes: {attr1: 'value1', attr2: 'value2'},
                id: null
            }
        },
        {
            input: "span#main.highlighted(active)",
            expected: {
                i: null,
                tag: 'span',
                inlineClasses: ['highlighted'],
                attributes: {active: true},
                id: 'main'
            }
        },
        {
            input: "section.wrapper(contenteditable='false')",
            expected: {
                i: null,
                tag: 'section',
                inlineClasses: ['wrapper'],
                attributes: {contenteditable: 'false'},
                id: null
            }
        },
        {
            input: "1.5:section.wrapper",
            expected: {
                i: "1.5",
                tag: 'section',
                inlineClasses: ['wrapper'],
                attributes: {},
                id: null
            }
        },
        {
            input: "+2.3:div.class1.class2(attr='value')",
            expected: {
                i: "+2.3",
                tag: 'div',
                inlineClasses: ['class1', 'class2'],
                attributes: {attr: 'value'},
                id: null
            }
        },
        {
            // Porperly escaped quotes in attributes
            input: "+2.3:div.class1.class2(attr='value\" some other' attr2=\"value2' two\")",
            expected: {
                i: "+2.3",
                tag: 'div',
                inlineClasses: ['class1', 'class2'],
                attributes: {attr: 'value" some other', attr2: "value2' two"},
                id: null
            }
        },
        {
            input: "3.1:article#main.-xl:article-class(data-role='main')",
            expected: {
                i: "3.1",
                tag: 'article',
                inlineClasses: ['-xl:article-class'], // Works with responsive api
                attributes: {"data-role": 'main'},
                id: 'main'
            }
        }

    ];

    // ---------------------------------------------------------------------------
    // positive parsing examples
    // ---------------------------------------------------------------------------
    testExamples.forEach(({input, expected}) => {
        it(`parses "${input}" correctly`, () => {
            const result = parser.parse(input);
            // We only check for the keys we specified in the expectation to keep the
            // test flexible in case the parser adds additional meta-data.
            expect(result).toMatchObject(expected);
        });
    });

    // ---------------------------------------------------------------------------
    // negative / malformed inputs
    // ---------------------------------------------------------------------------
    const malformedInputs: Array<[string, RegExp]> = [

        [
            "div(class='foo' id='bar' data-test='baz'", // missing closing parenthesis
            /unterminated|\)$/i
        ],

    ];

    malformedInputs.forEach(([input, errorPattern]) => {
        it(`throws a meaningful error for malformed input "${input}"`, () => {
            expect(() => parser.parse(input)).toThrow(errorPattern);
        });
    });
});
