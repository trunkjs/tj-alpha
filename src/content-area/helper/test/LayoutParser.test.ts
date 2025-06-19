import { describe, it, expect,beforeEach, assert } from 'vitest';
import { LayoutParser } from '../LayoutParser';
import { ElementI } from '../ElementI';

describe('LayoutParser', () => {
  let parser: LayoutParser;

  beforeEach(() => {
    parser = new LayoutParser();
  });

  describe('Valid layout strings', () => {
    it('should parse a layout string with i, tag, classes, and attributes with enabled', () => {
      // Example: 1.5:div.box.class2;attribute1: 'attval'; attribute2: 'attval';enabled
      const input = "1.5:div.box.class2;attribute1: 'attval'; attribute2: 'attval';enabled";
      // Expected:
      // i= 1.5 tag: 'div' inlineclass: 'box class2 attributes: {
      //   attribute1: 'attval',
      //   attribute2: 'attval',
      //   enabled: true
      // }'
      let expectedI = new ElementI('1.5');
      let result = parser.parseLayoutSting(input);

      expect(result.i).toBe('1.5');
      expect(result.tag).toBe('div');
      expect(result.inlineClasses).toEqual(['box', 'class2']);
      expect(result.attributes).toMatchObject({
        attribute1: 'attval',
        attribute2: 'attval',
        enabled: true
      });
    });

    it('should parse a layout string with +i, tag and classes, no attributes', () => {
      // Example: +1.5:div.box.class2
      const input = "+1.5:div.box.class2";
      let expectedI = new ElementI('+1.5');
      let result = parser.parseLayoutSting(input);

      expect(result.i).toBe('+1.5');
      expect(result.tag).toBe('div');
      expect(result.inlineClasses).toEqual(['box', 'class2']);
      expect(result.attributes).toEqual({});
    });

    it('should parse a layout string with only tag and classes, with attributes', () => {
      // Example: div.box.class1;attribute1: 'attval'; attribute2: 'attval'
      const input = "div.box.class1;attribute1: 'attval'; attribute2: 'attval'";
      let result = parser.parseLayoutSting(input);

      expect(result.i).toBeUndefined();
      expect(result.tag).toBe('div');
      expect(result.inlineClasses).toEqual(['box', 'class1']);
      expect(result.attributes).toMatchObject({
        attribute1: 'attval',
        attribute2: 'attval',
      });
    });

    it('should parse layout string with i only as class', () => {
      // Example: 2:.box
      const input = "2:.box";
      let expectedI = new ElementI('2');
      let result = parser.parseLayoutSting(input);

      expect(result.i).toBe('2.0');
      expect(result.tag).toBeUndefined();
      expect(result.inlineClasses).toEqual(['box']);
      expect(result.attributes).toEqual({});
    });
  });

  describe('Invalid format strings', () => {
    it('should throw an error on an empty string', () => {
      expect(() => parser.parseLayoutSting("")).toThrow(/Invalid layout string format/);
    });

    it('should throw an error if no tag/class or i is present', () => {
      expect(() => parser.parseLayoutSting(";")).toThrow();
    });

    it('should throw an error on invalid i value', () => {
      // Example: abc:div.box
      expect(() => parser.parseLayoutSting("abc:div.box"))
        .toThrow(/Invalid layout string format|Invalid number/);
    });

    it('should provide detailed error location on malformed attribute', () => {
      // Example: div.box;attribute1 attribute2: 'a'
      try {
        parser.parseLayoutSting("div.box;attribute1 attribute2: 'a'");
        assert.fail("Should have thrown");
      } catch (e: any) {
        expect(e.message).toMatch(/attribute/i);
        expect(e.message).toMatch(/attribute1/i);
      }
    });

    it('should provide detailed error for unmatched quote in attribute value', () => {
      // Example: div.box;attribute1: 'unclosed
      try {
        parser.parseLayoutSting("div.box;attribute1: 'unclosed");
        assert.fail("Should have thrown");
      } catch (e: any) {
        expect(e.message).toMatch(/unclosed/i);
        expect(e.message).toMatch(/attribute1/i);
      }
    });
  });
});
