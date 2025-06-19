import { describe, it, expect } from 'vitest';
import { parseSelector, ParsedSelector } from '../parse-css-selector';

describe('parseSelector basic cases', () => {
    it('parses tag only', () => {
        expect(parseSelector('div')).toEqual({
            tag: 'div',
            classes: [],
            id: null,
        });
    });

    it('parses tag with class', () => {
        expect(parseSelector('span.active')).toEqual({
            tag: 'span',
            classes: ['active'],
            id: null,
        });
    });

    it('parses tag with id', () => {
        expect(parseSelector('input#main')).toEqual({
            tag: 'input',
            classes: [],
            id: 'main',
        });
    });

    it('parses tag with id and class', () => {
        expect(parseSelector('label#foo.bar')).toEqual({
            tag: 'label',
            classes: ['bar'],
            id: 'foo',
        });
    });

    it('parses tag with multiple classes', () => {
        expect(parseSelector('div.aaa.bbb.ccc')).toEqual({
            tag: 'div',
            classes: ['aaa', 'bbb', 'ccc'],
            id: null,
        });
        expect(parseSelector('h1.x.y.z')).toEqual({
            tag: 'h1',
            classes: ['x', 'y', 'z'],
            id: null,
        });
    });

    it('parses tag with ID and multiple classes', () => {
        expect(parseSelector('section#sec1.aaa.bbb.ccc')).toEqual({
            tag: 'section',
            classes: ['aaa', 'bbb', 'ccc'],
            id: 'sec1',
        });
    });
});

describe('parseSelector edge & weird/edge cases', () => {
    it('parses only class (no tag)', () => {
        expect(parseSelector('.foo')).toEqual({
            tag: null,
            classes: ['foo'],
            id: null,
        });
        expect(parseSelector('.foo.bar')).toEqual({
            tag: null,
            classes: ['foo','bar'],
            id: null,
        });
    });

    it('parses only id', () => {
        expect(parseSelector('#john')).toEqual({
            tag: null,
            classes: [],
            id: 'john',
        });
    });

    it('parses only class with dashes or underscore', () => {
        expect(parseSelector('.foo-bar_baz')).toEqual({
            tag: null,
            classes: ['foo-bar_baz'],
            id: null,
        });
    });

    it('parses tag with numeric chars, dash and underscore', () => {
        expect(parseSelector('my-tag_123')).toEqual({
            tag: 'my-tag_123',
            classes: [],
            id: null,
        });
        expect(parseSelector('x1-y2:role')).toEqual({
            tag: 'x1-y2:role',
            classes: [],
            id: null,
        });
    });

    it('parses selector with tag, ID, dash/underscore classes, and colons', () => {
        expect(parseSelector('foo-bar#id_one.class-1__colon:part')).toEqual({
            tag: 'foo-bar',
            classes: ['class-1__colon:part'],
            id: 'id_one',
        });
    });

    it('parses weird ordering (class first, then id)', () => {
        expect(parseSelector('.header#mainNav')).toEqual({
            tag: null,
            classes: ['header'],
            id: 'mainNav',
        });
    });

    it('parses selector with multiple IDs (should pick first)', () => {
        expect(parseSelector('div#foo#bar.baz')).toEqual({
            tag: 'div',
            classes: ['baz'],
            id: 'foo', // first # encountered
        });
    });

    it('parses selector with nothing (empty string)', () => {
        expect(parseSelector('')).toEqual({
            tag: null,
            classes: [],
            id: null,
        });
    });

    it('parses selector with multiple periods as broken classes', () => {
        expect(parseSelector('div..foo...bar')).toEqual({
            tag: 'div',
            classes: ['foo', 'bar'],
            id: null,
        });
    });

    it('parses selector with combination of class and id only, no tag', () => {
        expect(parseSelector('.abc#def')).toEqual({
            tag: null,
            classes: ['abc'],
            id: 'def',
        });
    });

    it('parses selector with invalid characters', () => {
        // Only letters/numbers/_:- will be considered for tag/classes/id per regex
        expect(parseSelector('div$#id!@.cl@ss$')).toEqual({
            tag: 'div',
            classes: ["cl"],
            id: 'id',
        });
    });

    it('parses selector with colons in the tag, classes etc.', () => {
        expect(parseSelector('svg:path.icon')).toEqual({
            tag: 'svg:path',
            classes: ['icon'],
            id: null,
        });
    });

    it('parses selector with id after class', () => {
        expect(parseSelector('.foo#bar')).toEqual({
            tag: null,
            classes: ['foo'],
            id: 'bar',
        });
    });
});

describe('parseSelector: complex non-standard edge cases', () => {
    it('parses multiple classes bordering each other', () => {
        expect(parseSelector('.foo.bar.baz')).toEqual({
            tag: null,
            classes: ['foo','bar','baz'],
            id: null
        });
        expect(parseSelector('button..foo..bar')).toEqual({
            tag: 'button',
            classes: ['foo','bar'],
            id: null
        });
    });

    it('parses id with digits, hyphens, and underscores', () => {
        expect(parseSelector('div#id-123_abc.b')).toEqual({
            tag: 'div',
            classes: ['b'],
            id: 'id-123_abc',
        });
    });

    it('parses selector with nothing matching tag, id, or classes', () => {
        expect(parseSelector('@@!!')).toEqual({
            tag: null,
            classes: [],
            id: null,
        });
    });

    it('parses class with colon, underscore, hyphen', () => {
        expect(parseSelector('.foo_bar:baz-x')).toEqual({
            tag: null,
            classes: ['foo_bar:baz-x'],
            id: null,
        });
    });

    it('parses selector with both id and class and weird characters', () => {
        expect(parseSelector('#id._-:')).toEqual({
            tag: null,
            classes: ['_-:'],
            id: 'id',
        });
    });
});
