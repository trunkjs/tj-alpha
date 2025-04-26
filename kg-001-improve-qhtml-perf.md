---
slugName: improve-qhtml-perf
inlcudeFiles:
- src/qhtml/qhtml.ts
- src/tools/TokenReader.ts
- src/tools/create-element.ts
editFiles:
- src/qhtml/qhtml.ts
original_prompt: Rewrite src/qhtml/qhtml.ts to perform better shorter and better documented
  by using TokenReader
---
# Instructions
The goal is to refactor `src/qhtml/qhtml.ts` into a faster, shorter, and better-documented implementation that **delegates all lexical parsing to `TokenReader`** instead of hand-rolled string operations. No public API changes are allowed: the tagged-template function `qhtml` must continue to return a `DocumentFragment` and all existing unit tests must still pass.

## Files and Classes to Create
_No new files are required._  
All improvements are confined to `src/qhtml/qhtml.ts`. However, small helper types or functions may be declared inside that file (or imported from `TokenReader` if you decide to extend it in a later step).

## Files and Classes to Modify
1. **src/qhtml/qhtml.ts**  
   – Rewrite the parser loop so that every token (tags, classes, ids, attributes, pipe-text, comments) is produced by `TokenReader.readToken()` (already available).  
   – Remove most manual `string` slicing / indexing; rely on the reader for whitespace skipping, quoted-string handling, and error reporting.  
   – Add rich JSDoc for public helpers and clearly mark algorithmic stages (depth detection, tokenization, tree building).  
   – Keep the runtime footprint small (≈ 60-70 LoC vs current ~180 LoC).

2. (optional) **src/tools/TokenReader.ts**  
   – Only if you discover missing convenience routines (e.g. `readToken()` currently returns `string | null`, not `TokenReaderValue`).  
   – Provide thin wrappers (e.g. `peekWord()`, `consume(char)`) but DO NOT break backwards compatibility.  
   – Update its unit tests if extended.

_No other files need changes; existing test-suite must stay green._

## Implementation Details

### src/qhtml/qhtml.ts
#### Objective
Replace bespoke parsing logic with a deterministic single-pass algorithm driven by `TokenReader`, reducing cognitive complexity, increasing speed, and centralising error handling.

#### Changes
1. **Utility constants / types**
   ```ts
   type AttrMap = Record<string, string>;
   ```

2. **Helper – parseLine(reader, depth)**
   Parses one visual line (after computing depth) and returns:
   ```ts
   interface ParsedLine {
       depth: number;            // nesting depth (0 == root)
       type: 'element'|'text'|'comment';
       tag?: string;
       attrs?: AttrMap;
       text?: string;
       comment?: string;
   }
   ```

3. **Token rules**
   * `%%` → begin comment; remainder of line is comment body.
   * `|`  → text-node; everything after first pipe is raw text.
   * `.foo`, `#bar` before/after first token → classes / id.
   * `name=value` → attribute (value may be quoted, handled natively by `TokenReader`).

4. **Algorithm sketch**
   ```ts
   lines.forEach((raw, ln) => {
       // 1. skip blank lines
       // 2. compute depth = count leading '>' (cheap loop)
       // 3. create TokenReader(contentWithoutDepth, ln+1)
       // 4. collect tokens while !EOF
       // 5. detect comment / text / element
       // 6. push / pop stack according depth
       // 7. build HTMLElement with create_element
   });
   ```

5. **Performance tips**
   * Pre-allocate `stack` to maximum depth observed (optional micro-opt).
   * Avoid repeated `Array.prototype.shift()`; instead use index iteration.
   * Inline trivial helpers where hot.

6. **Documentation**
   Every exported symbol and non-trivial helper must carry concise JSDoc (purpose, params, returns, throws).

7. **Size target**
   Aim for ≤ 120 SLOC (was ~220).


## Assumptions
* `TokenReader.readToken()` correctly handles quoting/escaping as needed.
* Current unit tests cover most edge-cases; adding more tests is optional.
* No external runtime environment constraints besides DOM & ES2020.

## Suggested Prompt Improvement (for future)
> “Please refactor `src/qhtml/qhtml.ts`: replace hand-rolled parsing with `TokenReader`; keep public API; add JSDoc; ensure all existing tests pass.”

This would communicate expectations unambiguously to future implementers.
