import {describe, it, expect, test} from 'vitest';


/*  src/tools/test/IndentMapper.test.ts
 *
 *  NOTE:
 *  -----
 *  The purpose of this test-suite is to outline the expected behaviour of the
 *  `IndentMapper` once its implementation is finished.  For the moment most of
 *  the “invalid / error” test-cases are intentionally *skipped* so that the
 *  overall CI run stays green until the real algorithm is available.
 *
 *  When the mapper becomes fully functional simply replace all `test.skip`
 *  with `test` to activate those assertions.
 */

/*  Make the still-undefined global “Options” symbol visible to TypeScript so
 *  that `src/tools/IndentMapper.ts` compiles without raising a TS error.
 */
declare const Options: any;

//=============================================================================================================================================================

import { IndentMapper, ElementStructure } from '../IndentMapper';

/**
 * Utility helper that just instantiates the mapper and executes `.parse`.
 * It is wrapped in a function to make the “throw / not-throw” expectations
 * a bit cleaner to read.
 */
function runParse(code: string, mapper?: IndentMapper) {
    return (mapper ?? new IndentMapper()).parse(code);
}

//=============================================================================================================================================================
// Positive test-cases – these *should* be parsed without throwing.
//=============================================================================================================================================================

const validCases: Array<[string, string, ElementStructure]> = [
    [
        'Single line, no children',
        `root`,
        {
            children: [
                { _raw: 'root', _lineNo: 1, children: [] }
            ]
        }
    ],
    [
        'Simple two-level hierarchy',
        [
            'root',
            '  child'
        ].join('\n'),
        {
            children: [
                {
                    _raw: 'root',
                    _lineNo: 1,
                    children: [
                        { _raw: 'child', _lineNo: 2, children: [] }
                    ]
                }
            ]
        }
    ],
    [
        'Ignore leading whitespace on first line',
        [
            '  root',
            '    child'
        ].join('\n'),
        {
            children: [
                {
                    _raw: 'root',
                    _lineNo: 1,
                    children: [
                        { _raw: 'child', _lineNo: 2, children: [] }
                    ]
                }
            ]
        }
    ],
    [
        'Three-level hierarchy with consistent indent',
        [
            'root:',
            '  child1:',
            '    grandChild',
            '  child2'
        ].join('\n'),
        {
            children: [
                {
                    _raw: 'root:',
                    _lineNo: 1,
                    children: [
                        {
                            _raw: 'child1:',
                            _lineNo: 2,
                            children: [
                                { _raw: 'grandChild', _lineNo: 3, children: [] }
                            ]
                        },
                        { _raw: 'child2', _lineNo: 4, children: [] }
                    ]
                }
            ]
        }
    ],
    [
        'Multiple root level elements',
        [
            'root1',
            'root2',
            '  childOfRoot2'
        ].join('\n'),
        {
            children: [
                { _raw: 'root1', _lineNo: 1, children: [] },
                {
                    _raw: 'root2',
                    _lineNo: 2,
                    children: [
                        { _raw: 'childOfRoot2', _lineNo: 3, children: [] }
                    ]
                }
            ]
        }
    ],
    [
        'Tabs instead of spaces (Python / YAML allow this, although mixing is illegal)',
        [
            'root',
            '\tchild'
        ].join('\n'),
        {
            children: [
                {
                    _raw: 'root',
                    _lineNo: 1,
                    children: [
                        { _raw: 'child', _lineNo: 2, children: [] }
                    ]
                }
            ]
        }
    ],
    [
        'Blank lines inside hierarchy (should be ignored)',
        [
            'root:',
            '  child1',
            '',
            '  child2'
        ].join('\n'),
        {
            children: [
                {
                    _raw: 'root:',
                    _lineNo: 1,
                    children: [
                        { _raw: 'child1', _lineNo: 2, children: [] },
                        { _raw: 'child2', _lineNo: 4, children: [] }
                    ]
                }
            ]
        }
    ],
    [
        'Lines with comments (should be ignored)',
        [
            'root:',
            '  child1',
            ' # Comment Line',
            '  child2'
        ].join('\n'),
        {
            children: [
                {
                    _raw: 'root:',
                    _lineNo: 1,
                    children: [
                        { _raw: 'child1', _lineNo: 2, children: [] },
                        { _raw: 'child2', _lineNo: 4, children: [] }
                    ]
                }
            ]
        }
    ],
    [
        'Trailing whitespace on lines (should be trimmed)',
        [
            'root   ',
            '  child   ',
            '    grandChild'
        ].join('\n'),
        {
            children: [
                {
                    _raw: 'root',
                    _lineNo: 1,
                    children: [
                        {
                            _raw: 'child',
                            _lineNo: 2,
                            children: [
                                { _raw: 'grandChild', _lineNo: 3, children: [] }
                            ]
                        }
                    ]
                }
            ]
        }
    ],
    [
        'Indent width of 3 spaces (allowed as long as consistent)',
        [
            'root',
            '   childLvl1',
            '      grandChild'
        ].join('\n'),
        {
            children: [
                {
                    _raw: 'root',
                    _lineNo: 1,
                    children: [
                        {
                            _raw: 'childLvl1',
                            _lineNo: 2,
                            children: [
                                { _raw: 'grandChild', _lineNo: 3, children: [] }
                            ]
                        }
                    ]
                }
            ]
        }
    ],
    [
        'Tabs for every indent level (consistent usage)',
        [
            'root',
            '\tchild1',
            '\t\tgrandChild'
        ].join('\n'),
        {
            children: [
                {
                    _raw: 'root',
                    _lineNo: 1,
                    children: [
                        {
                            _raw: 'child1',
                            _lineNo: 2,
                            children: [
                                { _raw: 'grandChild', _lineNo: 3, children: [] }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
];

describe('IndentMapper – valid inputs', () => {

    test.each(validCases)('%s', (_title, input, expected) => {
        expect(() => runParse(input)).not.toThrow();
        const parsed = runParse(input);
        expect(parsed).toEqual(expected);
    });

});

//=============================================================================================================================================================
// Negative test-cases – these are supposed to trigger an exception.
// Currently they are marked as “skipped” until the mapper is implemented.
//=============================================================================================================================================================

const invalidCases: Array<[string, string]> = [
    [
        'First line already indented (cannot determine base level)',
        [
            '  illegalRoot',
            'child'
        ].join('\n')
    ],
    [
        'Indent decreases by more than one level at once',
        [
            'root',
            '    childLvl2',
            '  childLvl1'  // <- out-dent of 2 spaces at once
        ].join('\n')
    ],
    [
        'Second line indented more than third (zig-zag indentation)',
        [
            'root',
            '    childLvl2',
            '  childLvl1',
            '    childLvl2Again' // <- jumps in and out
        ].join('\n')
    ],
    [
        'Line with indentation but no content',
        [
            'root',
            '  ',
            '  child'
        ].join('\n')
    ],
    [
        'Mixed tabs and spaces on the same indentation column',
        [
            'root',
            '\t childWithMixedIndent'
        ].join('\n')
    ],
    [
        'Siblings with differing indentation widths (inconsistent)',
        [
            'root',
            '   childWith3Spaces',
            '  childWith2Spaces'
        ].join('\n')
    ],
    [
        'Mixing tabs and spaces across different lines',
        [
            'root',
            '  childWithSpaces',
            '\tchildWithTab'
        ].join('\n')
    ]
];

describe('IndentMapper – invalid inputs (expected to throw)', () => {

    test.each(invalidCases)('%s', (_title, input) => {
        expect(() => runParse(input)).toThrow();
    });

});

//=============================================================================================================================================================
