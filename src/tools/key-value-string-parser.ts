/**
 *
 * Walks the input string and parses it into key-value object. Will throw exceptions if quote was not closed or
 * anything is malformed. Quoted content can also contain newlines and escaped quotes.
 *
 * Exeptions should contain line number and column number of the error and (if possible) the key name where the error occurred.
 *
 * @param input
 *
 * @example
 * assert (hydrateKeyValueString('key1:value1; key2: value2; key3: "enclosed value with\" escaped quote"') === {
 *     key1: 'value1',
 *     key2: 'value2',
 *     key3: 'enclosed value with" escaped quote'
 * })
 */
export function hydrateKeyValueString(input: string): Record<string, string> {
    const result: Record<string, string> = {};
    let i = 0;
    let line = 1;
    let col = 1;
    const len = input.length;

    function error(message: string, key?: string): never {
        throw new Error(`Error at line ${line}, column ${col}${key ? `, key "${key}"` : ''}: ${message}`);
    }

    function skipWhitespace() {
        while (i < len && /\s/.test(input[i])) {
            if (input[i] === '\n') {
                line++;
                col = 1;
            } else {
                col++;
            }
            i++;
        }
    }

    function skipSeparators() {
        while (i < len) {
            skipWhitespace();
            if (i < len && input[i] === ';') {
                i++;
                col++;
                continue;
            }
            break;
        }
    }

    while (i < len) {
        skipSeparators();
        if (i >= len) {
            break;
        }

        // Read key
        const keyStart = i;
        while (i < len && input[i] !== ':' && input[i] !== ';') {
            if (input[i] === '\n') {
                line++;
                col = 1;
                i++;
                continue;
            }
            i++;
            col++;
        }
        if (i >= len || input[i] !== ':') {
            error('Expected ":" after key');
        }
        let key = input.slice(keyStart, i).trim();
        if (!key) {
            error('Empty key');
        }
        i++; col++; // skip :

        skipWhitespace();

        // Read value
        let value = '';
        if (input[i] === '"' || input[i] === "'") {
            const quoteChar = input[i];
            i++; col++;
            let isEscaped = false;
            while (i < len) {
                const ch = input[i];
                if (isEscaped) {
                    switch (ch) {
                        case 'n':
                            value += '\n';
                            break;
                        case 't':
                            value += '\t';
                            break;
                        case 'r':
                            value += '\r';
                            break;
                        case quoteChar:
                        case '\\':
                            value += ch;
                            break;
                        default:
                            value += '\\' + ch;
                    }
                    isEscaped = false;
                    i++;
                    col++;
                } else {
                    if (ch === '\\') {
                        isEscaped = true;
                        i++;
                        col++;
                    } else if (ch === quoteChar) {
                        i++;
                        col++;
                        break;
                    } else {
                        if (ch === '\n') {
                            value += '\n';
                            line++;
                            col = 1;
                            i++;
                        } else {
                            value += ch;
                            i++;
                            col++;
                        }
                    }
                }
            }
            if (i >= len && !isEscaped && input[i - 1] !== quoteChar) {
                error('Unterminated quoted value', key);
            }
            if (isEscaped) {
                error('Backslash at end of input', key);
            }
        } else {
            const semicolonIndex = input.indexOf(';', i);
            const endIndex = semicolonIndex === -1 ? len : semicolonIndex;
            const rawSegment = input.slice(i, endIndex);
            if (rawSegment.includes(':')) {
                error('Unexpected ":" in unquoted value', key);
            }
            value = rawSegment.trim();
            for (let j = i; j < endIndex; j++) {
                if (input[j] === '\n') {
                    line++;
                    col = 1;
                } else {
                    col++;
                }
            }
            i = endIndex;
        }

        result[key] = value;

        skipSeparators();
    }

    return result;
}

/**
 * Quotes only if necessary. If the value contains a space, it will be quoted. Should return the original value of parseValueStrung
 * @param input
 */
export function dehydrateKeyValueString(input: Record<string, string>): string {
    const pairs: string[] = [];
    for (const key in input) {
        let value = input[key];
        if (/\s/.test(value) || value.includes(';') || value.includes(':')) {
            value = `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
        }
        pairs.push(`${key}:${value}`);
    }
    return pairs.join('; ');
}