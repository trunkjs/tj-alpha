import { describe, it, expect } from 'vitest';
import { hydrateKeyValueString, dehydrateKeyValueString } from '../key-value-string-parser';

describe('hydrateKeyValueString', () => {
    it('parses simple key-value pairs', () => {
        const input = 'key1:value1; key2:value2;';
        const result = hydrateKeyValueString(input);
        expect(result).toEqual({ key1: 'value1', key2: 'value2' });
    });

    it('parses quoted values with spaces and escaped quotes', () => {
        const input = 'key1:"value with spaces"; key2:"escaped \\"quote\\"";';
        const result = hydrateKeyValueString(input);
        expect(result).toEqual({
            key1: 'value with spaces',
            key2: 'escaped "quote"',
        });
    });

    it('handles newlines inside quoted values', () => {
        const input = 'key1:"line1\\nline2";';
        const result = hydrateKeyValueString(input);
        expect(result).toEqual({ key1: 'line1\nline2' });
    });

    it('throws error on missing colon', () => {
        expect(() => {
            hydrateKeyValueString('key1 value1;');
        }).toThrow(/Expected ":" after key/);
    });

    it('throws error on empty key', () => {
        expect(() => {
            hydrateKeyValueString(':value1;');
        }).toThrow(/Empty key/);
    });

    it('throws error on unterminated quoted value', () => {
        expect(() => {
            hydrateKeyValueString('key1:"unterminated value;');
        }).toThrow(/Unterminated quoted value/);
    });

    it('throws error on missing semicolon after value', () => {
        expect(() => {
            hydrateKeyValueString('key1:value1 key2:value2;');
        }).toThrow(/Unexpected ":" in unquoted value/);
    });

    it('handles escaped backslashes in quoted values', () => {
        const input = 'key1:"path\\\\to\\\\file";';
        const result = hydrateKeyValueString(input);
        expect(result).toEqual({ key1: 'path\\to\\file' });
    });

    it('ignores whitespace between entries', () => {
        const input = '   key1:value1;    key2:   value2   ; ';
        const result = hydrateKeyValueString(input);
        expect(result).toEqual({ key1: 'value1', key2: 'value2' });
    });

    it('skips stray semicolons', () => {
        const input = '; key1:value1;; key2:value2;;;';
        const result = hydrateKeyValueString(input);
        expect(result).toEqual({ key1: 'value1', key2: 'value2' });
    });

    it('throws error on colon in unquoted value', () => {
        expect(() => {
            hydrateKeyValueString('key1:value:with:colon;');
        }).toThrow(/Unexpected ":" in unquoted value/);
    });
});

describe('dehydrateKeyValueString', () => {
    it('serializes simple key-value pairs', () => {
        const input = { key1: 'value1', key2: 'value2' };
        const result = dehydrateKeyValueString(input);
        expect(result).toBe('key1:value1; key2:value2');
    });

    it('quotes values with spaces', () => {
        const input = { key1: 'value with spaces', key2: 'simple' };
        const result = dehydrateKeyValueString(input);
        expect(result).toBe('key1:"value with spaces"; key2:simple');
    });

    it('quotes values with special characters', () => {
        const input = { key1: 'value:with:colon', key2: 'value;with;semicolon' };
        const result = dehydrateKeyValueString(input);
        expect(result).toBe('key1:"value:with:colon"; key2:"value;with;semicolon"');
    });

    it('escapes quotes correctly', () => {
        const input = { key1: 'value with "quotes"' };
        const result = dehydrateKeyValueString(input);
        expect(result).toBe('key1:"value with \\"quotes\\""');
    });

    it('preserves backslashes in values', () => {
        const input = { key1: 'path\\to\\file' };
        const result = dehydrateKeyValueString(input);
        expect(result).toBe('key1:path\\to\\file');
    });

    it('round-trips correctly between hydrate and dehydrate', () => {
        const original = {
            simple: 'value',
            spaced: 'value with spaces',
            quoted: 'value with "quotes"',
            special: 'value:with;special',
            multiline: 'line1\nline2'
        };
        const dehydrated = dehydrateKeyValueString(original);
        const hydrated = hydrateKeyValueString(dehydrated);
        expect(hydrated).toEqual(original);
    });
});
