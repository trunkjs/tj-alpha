---
slugName: ignore-whitespace-between-entries
inlcudeFiles:
- src/tools/key-value-string-parser.ts
editFiles:
- src/tools/key-value-string-parser.ts
original_prompt: 'In File src/tools/key-value-string-parser.ts edit it so the unit
  test ignores whitespaces between entries wont fail with Error at line 1, column
  39: Expected ":" after key'
---
# Instructions

We need to update the key-value string parser (`hydrateKeyValueString`) so that it ignores any combination of whitespace and semicolons between entries without throwing a “Expected ':' after key” error. Specifically, before reading each key, we must consume all separator characters (spaces, tabs, newlines, and stray semicolons) in one step so that the parser always lands directly on the next key (or end of input).

# Files to Modify

## 1. src/tools/key-value-string-parser.ts

# Implementation Details

### 1. Introduce a `skipDelimiters` helper

Add a new function that skips both whitespace and semicolons in one pass:

```ts
/**
 * Skips all whitespace characters and semicolons.
 * Advances line/column counters appropriately.
 */
function skipDelimiters() {
    while (i < len && (/\s/.test(input[i]) || input[i] === ';')) {
        if (input[i] === '\n') {
            line++;
            col = 1;
        } else {
            col++;
        }
        i++;
    }
}
```

### 2. Replace the existing `skipWhitespace` + stray‐semicolon logic

In the main parsing `while (i < len)` loop, remove:

```ts
skipWhitespace();
// If a stray semicolon is present, skip it.
if (i < len && input[i] === ';') {
    i++;
    col++;
    continue;
}
```

and replace both calls to `skipWhitespace` at the start of each iteration with a single call to `skipDelimiters`. This ensures we never land on stray semicolons when about to read a key:

```diff
 while (i < len) {
-    skipWhitespace();
+    skipDelimiters();

-    // If a stray semicolon is present, skip it.
-    if (i < len && input[i] === ';') {
-        i++;
-        col++;
-        continue;
-    }
 
     // Read key
     const keyStart = i;
     ...
```

### 3. Update later calls to skip whitespace before reading values

After you skip the colon (`:`), continue to use the existing `skipWhitespace()` before reading the value—as value parsing needs to treat semicolons as terminators, not skip them.

### 4. Final Structure

The top of the file should now export `hydrateKeyValueString` and define two helper functions:

```ts
export function hydrateKeyValueString(input: string): Record<string, string> {
    const result: Record<string, string> = {};
    let i = 0, line = 1, col = 1;
    const len = input.length;

    function error(message: string, key?: string): never { ... }

    function skipWhitespace() { ... }

+   function skipDelimiters() { ... }

    while (i < len) {
        skipDelimiters();

        // Read key
        ...
    }

    return result;
}
```

These changes will ensure that any mix of whitespace and semicolons between `key:value` entries is fully ignored, and that the parser always finds the next key or cleanly exits.