---
slugName: unit-test-element-i
inlcudeFiles:
- src/content-area/element-i.ts
editFiles:
- src/content-area/element-i.test.ts
original_prompt: Schreibe unittest für src/content-area/element-i.ts und teste alle
  grenzfälle ab
---
# Instructions
We need to add exhaustive unit-tests for `/content-area/element-i.ts`.  
All tests in the project are written with **Vitest**, therefore we create a sibling file `element-i.test.ts` that imports the class and validates every relevant edge-case.

## Files and Classes to Create
* `src/content-area/element-i.test.ts` – new Vitest spec covering all boundary/edge cases of `ElementI`.

## Files and Classes to Modify
_No existing source file must be modified._

## Implementation Details

### src/content-area/element-i.test.ts
#### Objective
Provide a full test-suite that exercises:
1. modifier parsing (`none`, prepend `+`, default `null`)
2. whitespace / casing tolerance
3. correct integer representation (internal `n` property via `getNasInt`)
4. correct string representation via `getNasString`
5. numeric rounding behaviour
6. invalid / non-numeric input handling (should result in `NaN`)
7. negative input handling
8. ability to change the value through `setNewN`

#### Changes (full content of the new file)

```ts
import { describe, expect, it } from 'vitest';
import { ElementI } from './element-i';   // path is relative to test file location

describe('ElementI – constructor & parsing', () => {

    it('handles the special keyword "none" (any case, spaces allowed)', () => {
        const el1 = new ElementI('none');
        const el2 = new ElementI('   NoNe   ');
        expect(el1.getNasInt()).toBe(0);
        expect(el1.getNasString()).toBe('none');
        expect(el2.getNasString()).toBe('none');
    });

    it('parses plain numbers', () => {
        const el = new ElementI('3.4');
        expect(el.getNasInt()).toBe(34);
        expect(el.getNasString()).toBe('3.4');
    });

    it('parses numbers with leading plus (append-modifier)', () => {
        const el = new ElementI('+2.5');
        expect(el.getNasInt()).toBe(25);
        expect(el.getNasString()).toBe('+2.5');
    });

    it('rounds to one decimal place (×10 then round)', () => {
        const el = new ElementI('4.44');      // 4.44 * 10 = 44.4 → 44
        expect(el.getNasInt()).toBe(44);
        expect(el.getNasString()).toBe('4.4');
    });

    it('caps fractional precision correctly for 6.51 → 6.5', () => {
        const el = new ElementI('6.51');
        expect(el.getNasInt()).toBe(65);
        expect(el.getNasString()).toBe('6.5');
    });

    it('handles zero correctly', () => {
        const el = new ElementI('0');
        expect(el.getNasInt()).toBe(0);
        expect(el.getNasString()).toBe('0.0');
    });

    it('returns NaN for non-numeric input (other than "none")', () => {
        const el = new ElementI('abc');
        expect(Number.isNaN(el.getNasInt() as any)).toBe(true);
        expect(el.getNasString()).toBe('NaN');
    });

    it('parses negative numbers', () => {
        const el = new ElementI('-1.2');
        expect(el.getNasInt()).toBe(-12);
        expect(el.getNasString()).toBe('-1.2');
    });
});

describe('ElementI – setNewN()', () => {

    it('updates the instance correctly', () => {
        const el = new ElementI('1.0');
        expect(el.getNasString()).toBe('1.0');

        el.setNewN('+2.5');
        expect(el.getNasString()).toBe('+2.5');
        expect(el.getNasInt()).toBe(25);

        el.setNewN('none');
        expect(el.getNasString()).toBe('none');
    });
});
```

Notes:
* We cannot access the private `mod` property directly, but its behaviour is reflected through the string representation: `"none"` for `NONE`, `+` prefix for `APPEND`, no prefix for default.
* Non-numeric input results in `NaN`; we assert with `Number.isNaN`.
* The test file follows the same pattern as existing tests in the repository, so no additional configuration is required.

After adding this file, `pnpm vitest` (or the project’s usual test command) should pass with the new suite included.