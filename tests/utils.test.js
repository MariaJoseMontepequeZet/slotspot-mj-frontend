import { beforeEach, describe, expect, it } from 'vitest';
import { escapeHTML, readJSON } from '../js/utils.js';

describe('escapeHTML', () => {
    it('escapa los cinco caracteres peligrosos', () => {
        expect(escapeHTML('& < > " \'')).toBe('&amp; &lt; &gt; &quot; &#39;');
    });

    it('neutraliza una etiqueta con manejador de eventos', () => {
        expect(escapeHTML('<img src=x onerror=alert(1)>')).toBe(
            '&lt;img src=x onerror=alert(1)&gt;',
        );
    });

    it('neutraliza el cierre de un atributo', () => {
        expect(escapeHTML('"><b id=pwn>x</b>')).toBe('&quot;&gt;&lt;b id=pwn&gt;x&lt;/b&gt;');
    });

    it('no vuelve a escapar un texto ya escapado de forma distinta', () => {
        expect(escapeHTML('&amp;')).toBe('&amp;amp;');
    });

    it('deja intacto el texto normal', () => {
        expect(escapeHTML('P-123ABC')).toBe('P-123ABC');
    });

    it('convierte null, undefined y numeros en texto', () => {
        expect(escapeHTML(null)).toBe('');
        expect(escapeHTML(undefined)).toBe('');
        expect(escapeHTML(42)).toBe('42');
        expect(escapeHTML(0)).toBe('0');
    });
});

describe('readJSON', () => {
    beforeEach(() => localStorage.clear());

    it('devuelve el valor por defecto si la clave no existe', () => {
        expect(readJSON('falta', [])).toEqual([]);
        expect(readJSON('falta', {})).toEqual({});
    });

    it('lee un arreglo y un objeto validos', () => {
        localStorage.setItem('lista', JSON.stringify([1, 2]));
        localStorage.setItem('objeto', JSON.stringify({ a: 1 }));
        expect(readJSON('lista', [])).toEqual([1, 2]);
        expect(readJSON('objeto', {})).toEqual({ a: 1 });
    });

    it('devuelve el valor por defecto si el JSON esta danado', () => {
        localStorage.setItem('roto', '{{no es json');
        expect(readJSON('roto', [])).toEqual([]);
    });

    it('devuelve el valor por defecto si el JSON es null', () => {
        localStorage.setItem('nulo', 'null');
        expect(readJSON('nulo', {})).toEqual({});
    });

    it('devuelve el valor por defecto si el tipo no coincide', () => {
        localStorage.setItem('objeto', JSON.stringify({ a: 1 }));
        localStorage.setItem('lista', JSON.stringify([1]));
        localStorage.setItem('texto', JSON.stringify('hola'));
        expect(readJSON('objeto', [])).toEqual([]);
        expect(readJSON('lista', {})).toEqual({});
        expect(readJSON('texto', [])).toEqual([]);
    });
});
