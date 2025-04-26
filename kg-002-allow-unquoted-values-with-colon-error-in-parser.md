---
slugName: allow-unquoted-values-with-colon-error-in-parser
inlcudeFiles:
- src/tools/key-value-string-parser.ts
- src/tools/key-value-string-parser.test.ts
editFiles:
- src/tools/key-value-string-parser.ts
- src/tools/key-value-string-parser.test.ts
original_prompt: 'In File src/tools/key-value-string-parser.ts allow unquoted values
  unless it contains : if a : is found within a unescaped value throw an error.'
---
# Instructions

We need to update the `hydrateKeyValueString` function in `src/tools/key-value-string-parser.ts` so that it allows unquoted values normally, but rejects any unquoted value containing an unescaped colon (`:`). If such a colon is encountered, the parser should throw a descriptive error including line, column, and key. Additionally, we will add a unit test case in `key-value-string-parser.test.ts` to verify this new behavior.

## Files and Classes to Create

None.

## Files and Classes to Modify

- src/tools/key-value-string-parser.ts
- src/tools/key-value-string-parser.test.ts

## Implementation Details

### src/tools/key-value-string-parser.ts

#### Objective
Allow unquoted values unless they contain an unescaped colon. When a colon is found inside an unquoted value, throw an error:  
`Error at line X, column Y, key "KEY": Unexpected ":" in unquoted value`.

#### Changes

1. In the `else` branch where the parser handles unquoted values, capture the raw substring before trimming.
2. Inspect the raw substring for any colon characters.
3. If a colon is found, call `error('Unexpected ":" in unquoted value', key)`.
4. Otherwise, proceed as before: trim, update `col`/`line`, and advance `i`.

```ts
// --- existing code context ---
// Read value
let value = '';
if (input[i] === '"' || input[i] === "'") {
    // … existing quoted logic …
} else {
    // --- MODIFIED BLOCK START ---
    const semicolonIndex = input.indexOf(';', i);
    // Extract the raw unquoted segment
    const endIndex = semicolonIndex === -1 ? len : semicolonIndex;
    const rawSegment = input.slice(i, endIndex);
    // Check for colon in unquoted value
    if (rawSegment.includes(':')) {
        error('Unexpected ":" in unquoted value', key);
    }
    // Assign trimmed result and update line/col
    value = rawSegment.trim();
    for (let j = i; j < endIndex; j++) {
        if (input[j] === '\n') {
            line++;
            col = 1;
        } else {
            col++;
        }
    }
    // Advance i past this segment (and stop at semicolon if present)
    i = endIndex;
    // --- MODIFIED BLOCK END ---
}
result[key] = value;
// … rest of function …
```

### src/tools/key-value-string-parser.test.ts

#### Objective
Add a test case to ensure that unquoted values containing a colon trigger an error.

#### Changes

Append the following test to the existing `describe('hydrateKeyValueString', …)` block:

```ts
it('throws error on colon in unquoted value', () => {
    expect(() => {
        hydrateKeyValueString('key1:value:with:colon;');
    }).toThrow(/Unexpected ":" in unquoted value/);
});
```

This will verify the parser rejects any unquoted value that includes a colon.