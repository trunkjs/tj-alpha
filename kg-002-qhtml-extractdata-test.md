---
slugName: qhtml-extractdata-test
inlcudeFiles:
- src/qhtml/qhtml.ts
editFiles:
- src/qhtml/qhtml.ts
- src/qhtml/extractDataFromWord.test.ts
original_prompt: Write a test for src/qhtml/qhtml.ts extractDataFromWord function
---
# Instructions

Add unit-tests for the internal `extractDataFromWord()` helper in `src/qhtml/qhtml.ts`.  
Because the function is not exported yet we first export it and then create a dedicated test-suite to verify
all relevant parsing scenarios (tag, classes, id, mixed, invalid value).

## Files and Classes to Create
* **src/qhtml/extractDataFromWord.test.ts** – new vitest file containing the test-cases.

## Files and Classes to Modify
* **src/qhtml/qhtml.ts**

## Implementation Details

### src/qhtml/qhtml.ts
#### Objective
Make `extractDataFromWord()` accessible from outside so that it can be imported in unit tests.

#### Changes
```ts
// change signature to be an exported function
export function extractDataFromWord(word: string): ParsedWordContent { ... }

// or – alternatively – keep the existing definition and add:
export { extractDataFromWord };
```

No other logic changes are required.

---

### src/qhtml/extractDataFromWord.test.ts
#### Objective
Provide a comprehensive vitest suite for `extractDataFromWord()` that covers:

1. Only tag (`div`)
2. Tag + single class (`span.red`)
3. Tag + multiple classes (`p.red.bold`)
4. Tag + id (`section#main`)
5. Tag + classes + id in any order (`nav.menu#header`, `header#top.banner.big`)
6. Leading dot / hash without tag (`.box`, `#alone`)
7. Mixed classes and id without tag (`.foo.bar#baz`)
8. Invalid formats (e.g. `div..double-dot`, `div#`, `.`) – expect thrown error.

#### Changes (complete file prototype)
```ts
import { describe, it, expect } from 'vitest';
import { extractDataFromWord } from './qhtml';

describe('extractDataFromWord', () => {

    it('parses only tag', () => {
        expect(extractDataFromWord('div')).toEqual({ tag: 'div' });
    });

    it('parses tag with one class', () => {
        expect(extractDataFromWord('span.red'))
            .toEqual({ tag: 'span', classes: ['red'] });
    });

    it('parses tag with multiple classes', () => {
        expect(extractDataFromWord('p.red.bold'))
            .toEqual({ tag: 'p', classes: ['red', 'bold'] });
    });

    it('parses tag with id', () => {
        expect(extractDataFromWord('section#main'))
            .toEqual({ tag: 'section', id: 'main' });
    });

    it('parses tag with classes and id (mixed order)', () => {
        expect(extractDataFromWord('nav.menu#header'))
            .toEqual({ tag: 'nav', classes: ['menu'], id: 'header' });

        expect(extractDataFromWord('header#top.banner.big'))
            .toEqual({ tag: 'header', classes: ['banner', 'big'], id: 'top' });
    });

    it('parses class-only selector', () => {
        expect(extractDataFromWord('.box'))
            .toEqual({ classes: ['box'] });
    });

    it('parses id-only selector', () => {
        expect(extractDataFromWord('#alone'))
            .toEqual({ id: 'alone' });
    });

    it('parses classes + id without tag', () => {
        expect(extractDataFromWord('.foo.bar#baz'))
            .toEqual({ classes: ['foo', 'bar'], id: 'baz' });
    });

    it('throws on invalid formats', () => {
        const invalidWords = ['div..double', 'div#', '.', '#'];
        invalidWords.forEach(w =>
            expect(() => extractDataFromWord(w)).toThrowError(/Invalid word format/)
        );
    });
});
```

The test uses vitest (already configured in the project) and imports the function directly from the same folder, assuming path mapping keeps compilation simple.

Run `pnpm test` (or `npm run test`) to ensure the new test-suite passes together with existing ones.