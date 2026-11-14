import { describe, expect, it } from 'vitest';
import { billableHours, calculateCharge, getRate } from '../js/billing.js';

const HOUR = 60 * 60 * 1000;
const entrada = new Date('2026-11-12T10:00:00Z');
const despues = (ms) => new Date(entrada.getTime() + ms);

const types = [
    { codigo: 'AUT', nombre: 'Automóvil', tarifa: '15.00' },
    { codigo: 'MOT', nombre: 'Moto', tarifa: '5.00' },
    { codigo: 'DEC', nombre: 'Decimal', tarifa: '0.10' },
    { codigo: 'FRE', nombre: 'Gratis', tarifa: '0' },
    { codigo: 'RAR', nombre: 'NoNumerica', tarifa: 'abc' },
    { codigo: 'VAC', nombre: 'Vacia', tarifa: '' },
    { codigo: 'NUL', nombre: 'Nula', tarifa: null },
    { codigo: 'NEG', nombre: 'Negativa', tarifa: '-3' },
];

describe('billableHours', () => {
    it('cobra 1 hora como minimo con 0 minutos', () => {
        expect(billableHours(entrada, entrada)).toBe(1);
    });

    it('cobra 1 hora con 1 milisegundo', () => {
        expect(billableHours(entrada, despues(1))).toBe(1);
    });

    it('cobra 1 hora cuando pasa exactamente 1 hora', () => {
        expect(billableHours(entrada, despues(HOUR))).toBe(1);
    });

    it('cobra 2 horas cuando pasa 1 hora y 1 milisegundo', () => {
        expect(billableHours(entrada, despues(HOUR + 1))).toBe(2);
    });

    it('redondea hacia arriba 2 horas 30 minutos a 3', () => {
        expect(billableHours(entrada, despues(2.5 * HOUR))).toBe(3);
    });

    it('cobra 1 hora si la salida es anterior a la entrada', () => {
        expect(billableHours(despues(HOUR), entrada)).toBe(1);
    });

    it('cobra 1 hora si la entrada no es una fecha valida', () => {
        expect(billableHours('no-es-fecha', entrada)).toBe(1);
        expect(billableHours(undefined, entrada)).toBe(1);
    });

    it('acepta cadenas ISO', () => {
        expect(billableHours('2026-11-12T10:00:00Z', '2026-11-12T12:30:00Z')).toBe(3);
    });
});

describe('getRate', () => {
    it('lee la tarifa del tipo', () => {
        expect(getRate('Automóvil', types)).toBe(15);
        expect(getRate('Moto', types)).toBe(5);
    });

    it('acepta una tarifa de 0', () => {
        expect(getRate('Gratis', types)).toBe(0);
    });

    it('devuelve null para un tipo desconocido', () => {
        expect(getRate('Tanque', types)).toBeNull();
    });

    it('devuelve null para tarifas vacias, nulas, no numericas o negativas', () => {
        expect(getRate('Vacia', types)).toBeNull();
        expect(getRate('Nula', types)).toBeNull();
        expect(getRate('NoNumerica', types)).toBeNull();
        expect(getRate('Negativa', types)).toBeNull();
    });

    it('devuelve null si no hay tipos', () => {
        expect(getRate('Moto', [])).toBeNull();
    });
});

describe('calculateCharge', () => {
    it('calcula 1 hora de automovil', () => {
        expect(calculateCharge(entrada, despues(HOUR), 'Automóvil', types)).toEqual({
            hours: 1,
            rate: 15,
            total: '15.00',
        });
    });

    it('calcula 2 horas 30 de automovil como 3 horas', () => {
        expect(calculateCharge(entrada, despues(2.5 * HOUR), 'Automóvil', types)).toEqual({
            hours: 3,
            rate: 15,
            total: '45.00',
        });
    });

    it('cobra 2 horas de moto con 1 hora y 1 milisegundo', () => {
        expect(calculateCharge(entrada, despues(HOUR + 1), 'Moto', types).total).toBe('10.00');
    });

    it('evita errores de coma flotante con tarifas decimales', () => {
        expect(calculateCharge(entrada, despues(3 * HOUR), 'Decimal', types).total).toBe('0.30');
    });

    it('permite una tarifa de 0', () => {
        expect(calculateCharge(entrada, despues(HOUR), 'Gratis', types).total).toBe('0.00');
    });

    it('devuelve null si el tipo no tiene tarifa valida', () => {
        expect(calculateCharge(entrada, despues(HOUR), 'Tanque', types)).toBeNull();
        expect(calculateCharge(entrada, despues(HOUR), 'NoNumerica', types)).toBeNull();
        expect(calculateCharge(entrada, despues(HOUR), 'Moto', [])).toBeNull();
    });
});
