import { describe, expect, it } from 'vitest';
import {
    buildPlate,
    getPrefix,
    parsePlate,
    sanitizeDigits,
    sanitizeLetters,
    validatePlate,
} from '../js/plate.js';

describe('getPrefix', () => {
    it('devuelve el prefijo de cada tipo de vehiculo', () => {
        expect(getPrefix('Automóvil')).toBe('P');
        expect(getPrefix('Moto')).toBe('M');
        expect(getPrefix('Camioneta')).toBe('C');
        expect(getPrefix('Bicicleta')).toBe('B');
        expect(getPrefix('Scooter')).toBe('S');
    });

    it('usa P para tipos desconocidos o ausentes', () => {
        expect(getPrefix('Tanque')).toBe('P');
        expect(getPrefix(undefined)).toBe('P');
    });
});

describe('sanitizeDigits', () => {
    it('conserva solo los digitos y corta a 3', () => {
        expect(sanitizeDigits('a1b2c3d4')).toBe('123');
        expect(sanitizeDigits('12')).toBe('12');
    });

    it('elimina espacios y simbolos', () => {
        expect(sanitizeDigits(' 1-2.3 ')).toBe('123');
    });

    it('acepta null, undefined y numeros', () => {
        expect(sanitizeDigits(null)).toBe('');
        expect(sanitizeDigits(undefined)).toBe('');
        expect(sanitizeDigits(4567)).toBe('456');
    });
});

describe('sanitizeLetters', () => {
    it('conserva solo letras en mayusculas y corta a 3', () => {
        expect(sanitizeLetters('a1b-c.d?e')).toBe('ABC');
    });

    it('elimina letras con acento o enie', () => {
        expect(sanitizeLetters('ñandú')).toBe('AND');
    });

    it('acepta null y undefined', () => {
        expect(sanitizeLetters(null)).toBe('');
        expect(sanitizeLetters(undefined)).toBe('');
    });
});

describe('parsePlate', () => {
    it('separa digitos y letras de una placa con guion', () => {
        expect(parsePlate('P-123ABC')).toEqual({ nums: '123', letters: 'ABC' });
    });

    it('acepta una placa sin guion', () => {
        expect(parsePlate('M456DEF')).toEqual({ nums: '456', letters: 'DEF' });
    });

    it('acepta una placa incompleta', () => {
        expect(parsePlate('P-12')).toEqual({ nums: '12', letters: '' });
    });

    it('corta los excedentes', () => {
        expect(parsePlate('P-1234ABCDE')).toEqual({ nums: '123', letters: 'ABC' });
    });

    it('devuelve vacio para valores que no son texto o estan vacios', () => {
        expect(parsePlate('')).toEqual({ nums: '', letters: '' });
        expect(parsePlate(null)).toEqual({ nums: '', letters: '' });
        expect(parsePlate(undefined)).toEqual({ nums: '', letters: '' });
        expect(parsePlate(123)).toEqual({ nums: '', letters: '' });
    });
});

describe('validatePlate', () => {
    it('acepta 3 digitos y 3 letras', () => {
        expect(validatePlate('123', 'ABC')).toBeNull();
    });

    it('detecta datos incompletos cuando ambos estan vacios', () => {
        expect(validatePlate('', '')).toBe('incomplete');
    });

    it('detecta digitos invalidos', () => {
        expect(validatePlate('12', 'ABC')).toBe('numbers');
        expect(validatePlate('12a', 'ABC')).toBe('numbers');
        expect(validatePlate('', 'ABC')).toBe('numbers');
    });

    it('detecta letras invalidas', () => {
        expect(validatePlate('123', 'AB')).toBe('letters');
        expect(validatePlate('123', 'ab1')).toBe('letters');
        expect(validatePlate('123', '')).toBe('letters');
    });
});

describe('buildPlate', () => {
    it('arma la placa con el prefijo del tipo', () => {
        expect(buildPlate('Moto', '456', 'DEF')).toBe('M-456DEF');
        expect(buildPlate('Automóvil', '123', 'ABC')).toBe('P-123ABC');
    });

    it('usa el prefijo por defecto para un tipo desconocido', () => {
        expect(buildPlate('Tanque', '111', 'AAA')).toBe('P-111AAA');
    });
});
