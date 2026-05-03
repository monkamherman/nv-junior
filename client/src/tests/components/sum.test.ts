// sum.test.ts
import { sum } from '../test-sum';
import { describe, it, expect } from 'vitest'; // Ou Jest, Mocha, etc.

describe('Test de la fonction sum', () => {
    it('devrait retourner la somme de deux nombres positifs', () => {
        const result = sum(2, 3);
        expect(result).toBe(5);
    });

    it('devrait retourner la somme d\'un nombre positif et d\'un nombre négatif', () => {
        const result = sum(5, -3);
        expect(result).toBe(2);
    });

    it('devrait retourner 0 pour deux zéros', () => {
        const result = sum(0, 0);
        expect(result).toBe(0);
    });
});