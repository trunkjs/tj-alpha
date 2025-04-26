---
slugName: ignore-whitespace-after-last-semicolon
inlcudeFiles:
- src/tools/key-value-string-parser.ts
editFiles:
- src/tools/key-value-string-parser.ts
original_prompt: In File src/tools/key-value-string-parser.ts edit it so it ignores
  whitespace after the last semicolon
---
# Instructions

We need to update the `hydrateKeyValueString` function in **src/tools/key-value-string-parser.ts** so that any whitespace (spaces, tabs, newlines) appearing *after* the last semicolon in the input string is ignored, and does not lead to an unexpected parse error or extra empty entry.

## Files and Classes to Create

_None._

## Files and Classes to Modify

- src/tools/key-value-string-parser.ts

## Implementation Details

### src/tools/key-value-string-parser.ts

#### Objective

Ensure that trailing whitespace after the final semicolon in the input does not trigger parsing of an empty key or any unexpected error. After the last key–value pair is parsed and its semicolon consumed, any remaining whitespace (and stray semicolons) should be silently skipped and parsing should finish normally.

#### Changes

1. **Extend the main loop** to bail out early if, after skipping whitespace and stray semicolons, the cursor is at the end of the input.
2. **Move the “skip stray semicolon” check** to run in a sub-loop at the top of the main loop until no more semicolons or whitespace remain, then exit.
3. **Add comments and tests NOTE** to illustrate the new behavior.

##### Proposed Code Sketch

```ts
export function hydrateKeyValueString(input: string): Record<string, string> {
    const result: Record<string, string> = {};
    let i = 0, line = 1, col = 1;
    const len = input.length;

    function error(msg: string, key?: string): never { /* unchanged */ }

    function skipWhitespace() {
        while (i < len && /\s/.test(input[i])) {
            if (input[i] === '\n') { line++; col = 1; }
            else { col++; }
            i++;
        }
    }

    // NEW helper: skip semicolons and whitespace until real content or EOS
    function skipSeparators() {
        while (i < len) {
            skipWhitespace();
            if (i < len && input[i] === ';') {
                i++; col++;
                continue;
            }
            break;
        }
    }

    while (i < len) {
        // 1) Skip all leading spaces and stray semicolons
        skipSeparators();
        // 2) If at end, break—ignore trailing whitespace/semicolons
        if (i >= len) {
            break;
        }

        // 3) Proceed to parse key (unchanged)
        const keyStart = i;
        while (i < len && input[i] !== ':' && input[i] !== ';') {
            if (input[i] === '\n') { line++; col = 1; i++; continue; }
            i++; col++;
        }
        if (i >= len || input[i] !== ':') {
            error('Expected ":" after key');
        }
        const key = input.slice(keyStart, i).trim();
        if (!key) error('Empty key');
        i++; col++; // skip :

        skipWhitespace();

        // 4) Parse value (identical to existing code)...
        // [ ... existing quoted/unquoted logic ... ]

        result[key] = value;

        // 5) After reading a value, do *not* throw on trailing whitespace
        //    Instead, resume the top of loop to skip separators.
    }

    return result;
}
```

- We wrap the existing “skip whitespace + stray semicolon” logic into a `skipSeparators()` helper.
- At the top of the `while` loop, we call `skipSeparators()` and immediately check `if (i >= len) break;` to end parsing cleanly.
- The rest of the parsing logic (reading a key, colon, value, storing in `result`) remains unchanged.
- No new files are created. The change resides entirely within `src/tools/key-value-string-parser.ts`.  
- Add or update unit tests to verify that inputs like `'key1:value1;   '` and `'a:1;b:2;    '` parse correctly without errors.