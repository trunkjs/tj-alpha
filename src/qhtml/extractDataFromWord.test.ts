import { describe, it, expect } from 'vitest';
import { extractDataFromWord } from './qhtml';

describe('extractDataFromWord', () => {
    it('should extract only a tag', () => {
        const result = extractDataFromWord('div');
        expect(result).toEqual({ tag: 'div', classes: [] });
    });

    it('should extract tag with one class', () => {
        const result = extractDataFromWord('div.box');
        expect(result).toEqual({ tag: 'div', classes: ['box'] });
    });

    it('should extract tag with multiple classes', () => {
        const result = extractDataFromWord('div.box.red.bold');
        expect(result).toEqual({ tag: 'div', classes: ['box', 'red', 'bold'] });
    });

    it('should extract tag with id', () => {
        const result = extractDataFromWord('div#main');
        expect(result).toEqual({ tag: 'div', classes: [], id: 'main' });
    });

    it('should extract tag with id and classes mixed', () => {
        const result = extractDataFromWord('section.hero#home-page.highlighted');
        expect(result).toEqual({ tag: 'section', classes: ['hero',  'highlighted'], id: 'home-page' });
    });

    it('should extract only class without tag', () => {
        const result = extractDataFromWord('.only-class');
        expect(result).toEqual({ classes: ['only-class'] });
    });

    it('should extract only id without tag', () => {
        const result = extractDataFromWord('#unique-id');
        expect(result).toEqual({ classes: [], id: 'unique-id' });
    });

    it('should extract multiple classes without tag', () => {
        const result = extractDataFromWord('.class-one.class-two.class-three');
        expect(result).toEqual({ classes: ['class-one', 'class-two', 'class-three'] });
    });

    it('should handle complex combination', () => {
        const result = extractDataFromWord('article.featured.news#main-article.popular');
        expect(result).toEqual({
            tag: 'article',
            classes: ['featured', 'news',  'popular'],
            id: 'main-article'
        });
    });


});
