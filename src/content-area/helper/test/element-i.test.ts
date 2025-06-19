import { describe, it, expect } from 'vitest';
import { ElementI } from '../ElementI';

describe('ElementI', () => {
    it('should parse plain number string as float and convert to int internally', () => {
        const e = new ElementI('3.2');
        expect(e.getNasInt()).toBe(32);
        expect(e.getNasString()).toBe('3.2');
    });

    it('should parse plus sign modifier for APPEND', () => {
        const e = new ElementI('+4.5');
        expect(e.getNasInt()).toBe(45);
        expect(e.getNasString()).toBe('+4.5');
    });

    it('should handle "none" modifier', () => {
        const e = new ElementI('none');
        expect(e.getNasInt()).toBe(0); // Internally n is left at 0
        expect(e.getNasString()).toBe('none');
    });

    it('should trim and lowercase input before parsing', () => {
        const e = new ElementI('  +5.0  ');
        expect(e.getNasInt()).toBe(50);
        expect(e.getNasString()).toBe('+5.0');
    });

    it('should override modifier and number with setNewN', () => {
        const e = new ElementI('2.3');
        expect(e.getNasInt()).toBe(23);
        e.setNewN('+6.7');
        expect(e.getNasInt()).toBe(67);
        expect(e.getNasString()).toBe('+6.7');
        e.setNewN('none');
        expect(e.getNasString()).toBe('none');
    });

    it('should parse integer strings as float', () => {
        const e = new ElementI('7');
        expect(e.getNasInt()).toBe(70);
        expect(e.getNasString()).toBe('7.0');
    });
});
