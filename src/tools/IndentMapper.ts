export type ElementStructure = {
    _raw?: string;
    _lineNo?: number;
    children?: ElementStructure[];
}



/**
 * Maps code line by line into elemetnt - children relationship.
 * Refrence is the first line of the code as layer 0. It should handle dynamic indentation like yaml or python does. So it should not be based on the number of spaces or tabs, but rather on the structure of the code.
 */
export class IndentMapper {

    private _debug = false;
    private _commentChar: string | null = '#';

    constructor(options?: { debug?: boolean; commentsChar?: null | string }) {
        this._debug = options?.debug ?? false;
        if (options?.commentsChar !== undefined) {
            this._commentChar = options.commentsChar;
        }


        if (this._debug) {
            /* eslint-disable no-console */
            console.log('IndentMapper initialized with options:', {
                debug: this._debug,
                commentsChar: this._commentChar
            });
            /* eslint-enable no-console */
        }
    }

    /**
     * Parses the given indented code string into a tree structure.
     */
    parse(code: string): ElementStructure {
        const root: ElementStructure = { children: [] };

        // Split into lines, normalise line endings first
        const lines = code.replace(/\r\n?/g, '\n').split('\n');

        // Stack keeps track of the current ancestors together with their indent size
        type StackEntry = { indent: number; node: ElementStructure };
        const stack: StackEntry[] = [{ indent: -1, node: root }];

        let baseIndent: number | null = null;               // indent of very first meaningful line
        let indentUnitLen: number | null = null;            // size of a single indent level (spaces count or 1 tab)
        let indentStyle: 'space' | 'tab' | null = null;     // indentation style to enforce across lines
        let prevIndent = 0;                                 // indent of the previously processed meaningful line

        const throwErr = (lineNo: number, rawLine: string, reason: string): never => {
            throw new Error(`IndentMapper Error at line ${lineNo}: ${reason}\n> ${rawLine}`);
        };

        for (let idx = 0; idx < lines.length; idx++) {
            const originalLineNo = idx + 1;
            const rawLine = lines[idx];

            // Extract leading whitespace (spaces or tabs)
            const matchLeading = rawLine.match(/^[ \t]*/);
            const leadingWS = matchLeading ? matchLeading[0] : '';
            const leadingLen = leadingWS.length;

            // Remove trailing whitespace
            const contentTrimmed = rawLine.slice(leadingLen).replace(/[ \t]+$/, '');

            // Skip comment lines
            if (
                contentTrimmed !== '' &&
                this._commentChar !== null &&
                contentTrimmed.trimStart().startsWith(this._commentChar)
            ) {
                continue;
            }

            // Blank line handling
            if (contentTrimmed === '') {
                if (leadingLen === 0) {
                    // Truly blank line – ignore
                    continue;
                } else {
                    // Line contains only indentation → illegal
                    throwErr(originalLineNo, rawLine, 'Line with indentation but no content');
                }
            }

            // Determine baseline indentation from the first meaningful line
            if (baseIndent === null) {
                baseIndent = leadingLen;          // can be > 0 (we ignore leading spaces on first line)
            }

            // Compute indentation relative to baseline
            const indent = leadingLen - baseIndent;
            if (indent < 0) {
                throwErr(originalLineNo, rawLine, 'Indentation goes above base level');
            }

            //  Mixed tabs/spaces within the same indentation column
            if (leadingWS.includes(' ') && leadingWS.includes('\t')) {
                throwErr(originalLineNo, rawLine, 'Mixed tabs and spaces on the same indentation column');
            }

            // Establish / validate indentation style (space vs tab)
            if (indentStyle === null && leadingLen > 0) {
                indentStyle = leadingWS.includes('\t') ? 'tab' : 'space';
            } else if (indentStyle !== null && leadingLen > 0) {
                const usesTab = leadingWS.includes('\t');
                const usesSpace = leadingWS.includes(' ');
                if (
                    (indentStyle === 'space' && usesTab) ||
                    (indentStyle === 'tab' && usesSpace)
                ) {
                    throwErr(originalLineNo, rawLine, 'Mixing tabs and spaces across different lines');
                }
            }

            // Determine indent unit when first increasing indent appears
            const diffFromPrev = indent - prevIndent;
            if (diffFromPrev > 0) {
                if (indentUnitLen === null) {
                    indentUnitLen = diffFromPrev;
                } else if (diffFromPrev !== indentUnitLen) {
                    throwErr(originalLineNo, rawLine, 'Indent increases by more than one level at once or inconsistent indent width');
                }
            } else if (diffFromPrev < 0) {
                if (indentUnitLen === null) {
                    throwErr(originalLineNo, rawLine, 'Indent decreases before indent unit was established');
                }
                if (-diffFromPrev !== indentUnitLen) {
                    throwErr(originalLineNo, rawLine, 'Indent decreases by more than one level at once');
                }
            }

            // Ensure current indent aligns perfectly with the indent unit
            if (indentUnitLen !== null && indent % indentUnitLen !== 0) {
                throwErr(originalLineNo, rawLine, 'Indentation not aligned to indent unit');
            }

            // Create the node for current line
            const node: ElementStructure = {
                _raw: contentTrimmed,
                _lineNo: originalLineNo,
                children: []
            };

            // Find correct parent by unwinding the stack until its indent is smaller than current indent
            while (stack.length > 1 && indent <= stack[stack.length - 1].indent) {
                stack.pop();
            }

            // Parent is the last entry in stack
            const parent = stack[stack.length - 1].node;
            if (!parent.children) parent.children = [];
            parent.children.push(node);

            // Push current node onto stack
            stack.push({ indent, node });

            // Update previous indent for next iteration
            prevIndent = indent;
        }

        if (!root.children) root.children = [];
        return root;
    }

}