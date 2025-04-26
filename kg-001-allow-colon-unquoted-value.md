---
slugName: allow-colon-unquoted-value
inlcudeFiles:
- src/tools/key-value-string-parser.ts
editFiles:
- src/tools/key-value-string-parser.ts
original_prompt: 'In File src/tools/key-value-string-parser.ts you if you are not
  in a quoted string and find a : within the value an exception. This means the'
---
# Instructions

The core request is to modify the behavior of the key–value string parser in the file `src/tools/key-value-string-parser.ts`. Currently, if the parser is processing an unquoted value and a colon (`:`) is encountered, it ends up triggering an exception. The aim is to change the parser so that colons inside an unquoted value are allowed rather than raising an error. This change will permit users to input values containing one or more colon characters without having to wrap the value in quotes.

## Assumptions

- The parser currently splits the input into key and value parts by scanning for a **colon** after the key and then, in the non-quoted value case, it uses the next semicolon (`;`) to know where the value ends.
- If the value contains a colon in addition to expected content, the parser (by its control flow) mistakenly treats it as invalid and eventually raises an error (e.g. “Expected ';' after value”).
- We want to allow colon characters as a legal part of an unquoted value. This means that only the first colon (which marks the delimiter between the key and the value) should be reserved.
- It is expected that key-value entries are still separated by semicolons. In other words, one should still place a semicolon after each key-value pair. The only change is that additional colons within the value are not treated as errors.

## Files and Classes to Modify

- **File:** `src/tools/key-value-string-parser.ts`
  - Function: `hydrateKeyValueString(input: string): Record<string, string>`
  - Related functions: `dehydrateKeyValueString` (no changes expected unless round-trip consistency is desired)

## Implementation Details

### File: src/tools/key-value-string-parser.ts

#### Objective

Allow colon (`:`) characters to appear inside unquoted value strings without triggering an exception. Only the colon immediately following the key (used to separate key from value) should count as a delimiter. All subsequent colons should be preserved as part of the value.

#### Changes

1. **Modify non-quoted value processing:**

   Currently the code uses:
   - `const semicolonIndex = input.indexOf(';', i);`
   - If no semicolon is found, it takes the rest of the input.
   - After extracting the value, it checks that the next character (if any) is a semicolon, and if not, an error is raised.

   **Proposed changes:**
   - Instead of relying on `input.indexOf(';', i)` which inadvertently may include a colon that confuses the parser when the expected semicolon delimiter is missing, replace it with a manual loop.
   - In the manual loop, iterate character by character until a semicolon is encountered. This loop will append every character (including colons) to the value.
   - Update the line and column counters as done in the quoted branch.
   - Once the semicolon is detected, exit the loop and continue processing.
   - This approach guarantees that colon characters within the value (between the key/value delimiter and the semicolon) do not accidentally trigger an error.
   
   **Prototype change:**
   ```ts
   // Replace the else branch in value reading (non-quoted case)
   } else {
       // Instead of relying on indexOf, manually process characters until ';' or end-of-input.
       let valueStart = i;
       value = '';
       while (i < len) {
           const ch = input[i];
           if (ch === ';') {
               break;
           }
           // Handle line and column tracking.
           if (ch === '\n') {
               line++;
               col = 1;
           } else {
               col++;
           }
           value += ch;
           i++;
       }
       value = value.trim();
       // If we did not reach a semicolon and are not at the end of input,
       // it means the pair wasn’t terminated properly.
       if (i < len && input[i] !== ';') {
           error('Expected ";" after value', key);
       }
   }
   ```

2. **Retain behavior after processing the value:**

   After reading the value, the parser skips whitespace and then it explicitly checks if the next character is a semicolon. The new manual scanning loop ensures that the colon characters inside the value do not break this logic. The rest of the logic (skipping stray semicolons, updating indexes, and setting the key in the result) can remain the same.

3. **Update tests if necessary:**

   Verify that tests (especially those concerning colon in the value or round-trip between hydration and dehydration) pass. For example, the round-trip test in `src/tools/key-value-string-parser.test.ts` should now correctly parse a string like:
   ```
   key1:value:with:colons; key2:another value;
   ```
   into:
   ```js
   { key1: "value:with:colons", key2: "another value" }
   ```

#### Documentation

- Update the function’s documentation (if needed) to reflect that values may contain colon characters even when not quoted. This helps future maintainers know that colons inside values are now accepted.

## Example Prompt for Next Request

"Please update the `hydrateKeyValueString` function in `src/tools/key-value-string-parser.ts` so that colon characters (`:`) within an unquoted value do not trigger an exception. Only the first colon should be used to separate the key from the value and subsequent colons should be preserved as part of the value. Ensure that line and column tracking is maintained, and adjust the error checking accordingly, using a manual loop to collect characters until a semicolon is encountered."

By following these details, the parser will be more flexible by allowing colons in unquoted values while still accurately delimiting key–value pairs with a semicolon separator.