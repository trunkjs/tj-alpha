import { describe, it, expect } from 'vitest';
import { TokenReader } from './TokenReader';

describe('TokenReader', () => {
    it('should read individual words properly', () => {
        const reader = new TokenReader('hello world_test 123');
        expect(reader.readWord()).toBe('hello');
        expect(reader.readWord()).toBe('world_test');
        expect(reader.readWord()).toBe('123');
        expect(reader.readWord()).toBeNull();
    });

    it('should skip whitespace correctly', () => {
        const reader = new TokenReader('    spaced    text');
        reader.skipWhitespace();
        expect(reader.readWord()).toBe('spaced');
        reader.skipWhitespace();
        expect(reader.readWord()).toBe('text');
    });

    it('should peek and read characters properly', () => {
        const reader = new TokenReader('abc');
        expect(reader.peekChar()).toBe('a');
        expect(reader.readChar()).toBe('a');
        expect(reader.peekChar()).toBe('b');
        expect(reader.readChar()).toBe('b');
        expect(reader.peekChar()).toBe('c');
        expect(reader.readChar()).toBe('c');
        expect(reader.peekChar()).toBeNull();
        expect(reader.readChar()).toBeNull();
    });

    it('should recognize end of input', () => {
        const reader = new TokenReader('');
        expect(reader.isEOF()).toBe(true);

        const reader2 = new TokenReader('a');
        expect(reader2.isEOF()).toBe(false);
        reader2.readChar();
        expect(reader2.isEOF()).toBe(true);
    });

    it('should read expressions from input', () => {
        const reader = new TokenReader('>= <= == != + - * /');
        expect(reader.readExpression(['>=', '<=', '==', '!=', '+', '-', '*', '/'])).toBe('>=');
        expect(reader.readExpression(['>=', '<=', '==', '!=', '+', '-', '*', '/'])).toBe('<=');
        expect(reader.readExpression(['>=', '<=', '==', '!=', '+', '-', '*', '/'])).toBe('==');
        expect(reader.readExpression(['>=', '<=', '==', '!=', '+', '-', '*', '/'])).toBe('!=');
        expect(reader.readExpression(['>=', '<=', '==', '!=', '+', '-', '*', '/'])).toBe('+');
        expect(reader.readExpression(['>=', '<=', '==', '!=', '+', '-', '*', '/'])).toBe('-');
        expect(reader.readExpression(['>=', '<=', '==', '!=', '+', '-', '*', '/'])).toBe('*');
        expect(reader.readExpression(['>=', '<=', '==', '!=', '+', '-', '*', '/'])).toBe('/');
        expect(reader.readExpression(['>=', '<=', '==', '!=', '+', '-', '*', '/'])).toBeNull();
    });

    it('should return null if expression not matched', () => {
        const reader = new TokenReader('>>>');
        expect(reader.readExpression(['>=', '<='])).toBeNull();
    });

    it('should read escaped strings', () => {
        const reader = new TokenReader('Hello \\\\\"World\\\\\" End', 1);
        reader.skipWhitespace();
        const str = reader.readEscapedString(' ');
        expect(str).toBe('Hello');
    });

    it('should read properly quoted strings', () => {
        const reader = new TokenReader('"Hello \\"World\\""');
        const openingQuote = reader.readChar();
        expect(openingQuote).toBe('"');
        const content = reader.readEscapedString('"');
        expect(content).toBe('Hello "World"');
    });

    it('should throw error on unterminated escaped string', () => {
        const reader = new TokenReader('"unterminated');
        expect(() => reader.readValue(";")).toThrow(/Unterminated string/);
    });

    it('should provide meaningful fail messages', () => {
        const reader = new TokenReader('abc', 10);
        reader.readChar(); // a
        reader.readChar(); // b
        const msg = reader.failmsg('Unexpected character');
        expect(msg).toBe('Line 10, Col 3: Unexpected character');
    });

    it('should correctly check next character', () => {
        const reader = new TokenReader('abc');
        expect(reader.isNextChar('a')).toBe(true);
        reader.readChar();
        expect(reader.isNextChar('b')).toBe(true);
        expect(reader.isNextChar('c')).toBe(false);
    });

    it('should save and restore reader index', () => {
        const reader = new TokenReader('hello world');
        const saved = reader.saveIndex();
        expect(reader.readWord()).toBe('hello');
        reader.restoreIndex(saved);
        expect(reader.readWord()).toBe('hello');
    });
});

describe('readValue', () => {

    it('parses integers and floats', () => {
        const rdr = new TokenReader('42; -13; 3.1415;');
        expect(rdr.readValue()?.value_number).toBe(42);
        expect(rdr.readValue()?.value_number).toBe(-13);
        expect(rdr.readValue()?.value_number).toBeCloseTo(3.1415);
        expect(rdr.readValue()).toBeNull();      // EOF
    });

    it('returns quoted strings (double & single, with escapes)', () => {
        const rdr = new TokenReader('"hello"; \'he\\\'llo\';');
        const v1 = rdr.readValue(";");
        expect(v1?.quoted).toBe(true);
        expect(v1?.value_str).toBe('hello');
        expect(v1?.value_number).toBeNull();

        rdr.readChar() // skip the semicolon

        const v2 = rdr.readValue(";");
        expect(v2?.quoted).toBe(true);
        expect(v2?.value_str).toBe("he'llo");
    });

    it('returns plain unquoted strings', () => {
        const rdr = new TokenReader('foo;bar;baz;');
        expect(rdr.readValue()?.value_str).toBe('foo');
        expect(rdr.readValue()?.value_str).toBe('bar');
        expect(rdr.readValue()?.value_str).toBe('baz');
    });

    it('throws on unterminated quoted strings', () => {
        const rdr = new TokenReader('\'oops;');
        expect(() => rdr.readValue()).toThrow(/Unterminated string/);
    });
});
