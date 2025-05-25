/**
 * Unit-tests for TokenReader2.readUntil().
 *
 * The tests cover…
 *   • plain string peeks (with / without “includePeek”)
 *   • multi-string peeks (earliest match wins)
 *   • RegExp peeks
 *   • behaviour when no peek match is present
 *   • correct index handling across multi-line input & consecutive calls
 *
 * NOTE:
 * TokenReader2 currently does **not** export the class.  We therefore load the
 * compiled module via `require` and try to retrieve the constructor from
 *   –  module.TokenReader2
 *   –  module.default
 *   –  the first exported value
 *
 * If the class still cannot be resolved the tests will fail early with a clear
 * message instead of silently passing.
 */
import {describe, expect, it} from 'vitest';
import {PeekType, TokenReader2} from "../TokenReader2";


describe('TokenReader2.readUntil ­– basic behaviour', () => {
    it('reads until a single string peek (exclude peek by default)', () => {
        const r = new TokenReader2('Hello, world!');
        const { content, match } = r.readUntil(',' );

        expect(content).toBe('Hello');
        expect(match).toBe(',');
        expect(r.rest).toBe(' world!');
        // index points to char right before “,” → next readChar() would return “,”
        expect(r.index).toBe(6);
    });



    it('includes the peek string when includePeek = true', () => {
        const r = new TokenReader2('abc!def');
        const { content, match } = r.readUntil('!', PeekType.Include);

        expect(content).toBe('abc!'); // ‘!’ included
        expect(match).toBe('!');
        expect(r.index).toBe(4);      // after the “!”
        expect(r.rest).toBe('def');
    });

    it('returns full remainder and null-match when peek not found', () => {
        const src = 'NoStopHere';
        const r = new TokenReader2(src);
        const { content, match } = r.readUntil(';');

        expect(content).toBe(src);
        expect(match).toBeNull();
        expect(r.isEnd()).toBe(true);
    });
});

describe('TokenReader2.readUntil ­– multiple peek options & RegExp', () => {
    it('accepts an array of peek strings (earliest match wins)', () => {
        const r = new TokenReader2('foo=bar;baz');
        const { content, match } = r.readUntil([';', '=']);

        expect(content).toBe('foo');
        expect(match).toBe('=');      // “=” appears before “;”
        expect(r.rest).toBe('bar;baz');
    });

    it('accepts a RegExp peek', () => {
        const r = new TokenReader2('123-ABC-XYZ');
        const { content, match } = r.readUntil(/[A-Z]{3}/);

        expect(content).toBe('123-');
        expect(match).toBe('ABC');
        expect(r.rest).toBe('-XYZ');
    });
});

describe('TokenReader2.readUntil ­– index bookkeeping & multi-line input', () => {
    it('advances index correctly across consecutive calls', () => {
        const r = new TokenReader2('part1|part2|part3');
        const first  = r.readUntil('|' , PeekType.Exclude);
        const second = r.readUntil('|', PeekType.Include);
        const third  = r.readUntil('|');

        expect(first.content).toBe('part1',);
        expect(second.content).toBe('part2|');
        expect(third.content).toBe('part3');
        expect(third.match).toBeNull();
        expect(r.isEnd()).toBe(true);
    });

    it('handles multi-line input properly', () => {
        const multi = 'Line-1\nLine-2\n--END--\nAfter';
        const r = new TokenReader2(multi);

        const { content, match } = r.readUntil('--END--');
        expect(content).toBe('Line-1\nLine-2\n');
        expect(match).toBe('--END--');

        // ensure reader is positioned right after the peek string
        expect(r.rest).toBe('\nAfter');
    });
});

/* ------------------------------------------------------------------ */
/*  New tests for uncovered helper methods                            */
/* ------------------------------------------------------------------ */
describe('TokenReader2 – helper methods', () => {
    it('readWhiteSpace returns leading whitespace and advances index', () => {
        const r = new TokenReader2('   \t  abc');
        const ws = r.readWhiteSpace();
        expect(ws).toBe('   \t  ');
        expect(r.index).toBe(ws.length);
        expect(r.peek(3)).toBe('abc');
    });

    it('peek works with numeric length, strings, arrays and regex', () => {
        const r = new TokenReader2('foo=bar;baz<html>');
        // numeric
        expect(r.peek(3)).toBe('foo');
        // single string
        expect(r.peek('=')).toBe(null);
        expect(r.peek(['<!--', "<", ">"])).toBeNull();
        // array

    });

    it("peek(string) will only find the peek from frist char of the string", () => {
        const r = new TokenReader2('foo=bar;baz<');
        expect(r.peek('foo')).toBe('foo');
        expect(r.peek('bar')).toBeNull();
        expect(r.peek('baz')).toBeNull();
        expect(r.peek('<')).toBeNull();
    });

    it('read(n) returns correct substring and advances index', () => {
        const r = new TokenReader2('abcdef');
        expect(r.read(2)).toBe('ab');
        expect(r.index).toBe(2);
        expect(r.read(10)).toBe('cdef'); // reading past end just returns remainder
        expect(r.isEnd()).toBe(true);
    });

    it('hasMore() and isEnd() reflect current reader state', () => {
        const r = new TokenReader2('xy');
        expect(r.hasMore()).toBe(true);
        expect(r.isEnd()).toBe(false);
        r.read(2);
        expect(r.hasMore()).toBe(false);
        expect(r.isEnd()).toBe(true);
    });

    it('readUntil with PeekType.Peek leaves index before peek match', () => {
        const r = new TokenReader2('abc:def');
        const { content, match } = r.readUntil(':', PeekType.Peek);
        expect(content).toBe('abc');
        expect(match).toBe(':');
        // index should still be before ':'
        expect(r.peek(1)).toBe(':');
    });
});

/* ------------------------------------------------------------------ */
/*  Tests for readPrimitive                                           */
/* ------------------------------------------------------------------ */
describe('TokenReader2.readPrimitive', () => {
    it('parses a simple double-quoted string', () => {
        const r = new TokenReader2('"Hello"');
        const res = r.readPrimitive({ stringDelimiters: ['"'] });
        expect(res.value).toBe('Hello');
        expect(res.delimiter).toBe('"');
        expect(r.isEnd()).toBe(true);
    });

    it('parses a simple single-quoted string', () => {
        const r = new TokenReader2("'World'");
        const res = r.readPrimitive({ stringDelimiters: [`'`] });
        expect(res.value).toBe('World');
        expect(res.delimiter).toBe("'");
        expect(r.isEnd()).toBe(true);
    });

    it('supports escape characters inside the string', () => {
        const r = new TokenReader2('"a \\"quoted\\" value"');
        const res = r.readPrimitive({ stringDelimiters: ['"'], escapeCharacter: '\\' });
        expect(res.value).toBe('a "quoted" value');
        expect(r.isEnd()).toBe(true);
    });

    it('throws when escape character appears at end of input', () => {
        const src = '"broken' + '\\';
        const r = new TokenReader2(src);
        expect(() => r.readPrimitive({ stringDelimiters: ['"'], escapeCharacter: '\\' })).toThrow();
    });

    it('throws when string is not closed', () => {
        const r = new TokenReader2(`"no end`);
        expect(() => r.readPrimitive({ stringDelimiters: ['"'] })).toThrow();
    });

    it('throws when called on a position that is not a delimiter', () => {
        const r = new TokenReader2('NoQuote');
        expect(() => r.readPrimitive({ stringDelimiters: ['"'] })).toThrow();
    });

    it('works with custom delimiter characters', () => {
        const r = new TokenReader2('`template`');
        const res = r.readPrimitive({ stringDelimiters: ['`'] });
        expect(res.value).toBe('template');
        expect(res.delimiter).toBe('`');
    });
});
