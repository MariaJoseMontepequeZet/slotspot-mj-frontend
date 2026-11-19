import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TOTAL_SLOTS } from '../js/config.js';
import { calculateCharge } from '../js/billing.js';
import { crearServiciosDemo, entrarDemo, restablecerDemo, sembrarDemo } from '../js/demo.js';
import { activarDemo, demoPedidaPorUrl, desactivarDemo, esDemo } from '../js/modo.js';
import { getPrefix, parsePlate, validatePlate } from '../js/plate.js';
import { store } from '../js/store.js';

const AHORA = new Date('2026-11-19T15:00:00Z');

beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
});

describe('modo demo', () => {
    it('empieza desactivado', () => {
        expect(esDemo()).toBe(false);
    });

    it('se activa y se desactiva', () => {
        activarDemo();
        expect(esDemo()).toBe(true);
        desactivarDemo();
        expect(esDemo()).toBe(false);
    });

    it.each([
        ['?demo=1', true],
        ['?x=1&demo=1', true],
        ['?demo=0', false],
        ['?demo=true', false],
        ['?demostracion=1', false],
        ['', false],
    ])('la direccion %s pide la demo: %s', (busqueda, esperado) => {
        expect(demoPedidaPorUrl(busqueda)).toBe(esperado);
    });
});

describe('datos de ejemplo', () => {
    const tipos = () => {
        store.init();
        return store.getTypes();
    };

    it('crea vehiculos activos y finalizados', () => {
        const servicios = crearServiciosDemo(AHORA, tipos());
        expect(servicios.filter((s) => s.estado === 'activo')).toHaveLength(7);
        expect(servicios.filter((s) => s.estado === 'finalizado')).toHaveLength(8);
    });

    it('todas las placas cumplen el formato y el prefijo de su tipo', () => {
        for (const servicio of crearServiciosDemo(AHORA, tipos())) {
            const { nums, letters } = parsePlate(servicio.placa);
            expect(validatePlate(nums, letters), servicio.placa).toBeNull();
            expect(servicio.placa[0], servicio.placa).toBe(getPrefix(servicio.tipo));
        }
    });

    it('no repite placas ni identificadores', () => {
        const servicios = crearServiciosDemo(AHORA, tipos());
        expect(new Set(servicios.map((s) => s.placa)).size).toBe(servicios.length);
        expect(new Set(servicios.map((s) => s.id)).size).toBe(servicios.length);
    });

    it('los activos ocupan slots distintos y validos', () => {
        const slots = crearServiciosDemo(AHORA, tipos())
            .filter((s) => s.estado === 'activo')
            .map((s) => s.slot);
        expect(new Set(slots).size).toBe(slots.length);
        for (const slot of slots) {
            expect(slot).toBeGreaterThanOrEqual(1);
            expect(slot).toBeLessThanOrEqual(TOTAL_SLOTS);
        }
    });

    it('los activos entraron antes de ahora y siguen sin salida', () => {
        const activos = crearServiciosDemo(AHORA, tipos()).filter((s) => s.estado === 'activo');
        for (const servicio of activos) {
            expect(new Date(servicio.entrada).getTime()).toBeLessThan(AHORA.getTime());
            expect(servicio.salida).toBeUndefined();
        }
    });

    it('los finalizados tienen salida posterior a la entrada, sin slot y con el total correcto', () => {
        const lista = tipos();
        const finalizados = crearServiciosDemo(AHORA, lista).filter(
            (s) => s.estado === 'finalizado',
        );
        for (const servicio of finalizados) {
            expect(new Date(servicio.salida).getTime()).toBeGreaterThan(
                new Date(servicio.entrada).getTime(),
            );
            expect(new Date(servicio.salida).getTime()).toBeLessThan(AHORA.getTime());
            expect(servicio.slot).toBeNull();
            const cobro = calculateCharge(servicio.entrada, servicio.salida, servicio.tipo, lista);
            expect(servicio.total).toBe(cobro.total);
            expect(Number(servicio.total)).toBeGreaterThan(0);
        }
    });

    it('omite los finalizados de un tipo que no tiene tarifa', () => {
        const soloMoto = [{ codigo: 'MOT', nombre: 'Moto', tarifa: '5.00' }];
        const finalizados = crearServiciosDemo(AHORA, soloMoto).filter(
            (s) => s.estado === 'finalizado',
        );
        expect(finalizados.length).toBeGreaterThan(0);
        expect(finalizados.every((s) => s.tipo === 'Moto')).toBe(true);
    });
});

describe('entrar a la demo', () => {
    it('activa la demo, abre la sesion y carga los datos de ejemplo', () => {
        entrarDemo();
        expect(esDemo()).toBe(true);
        expect(sessionStorage.getItem('cp_logged_in')).toBe('true');
        expect(store.getServices()).toHaveLength(15);
        expect(store.getActiveServices()).toHaveLength(7);
        expect(store.getFinishedServices()).toHaveLength(8);
    });

    it('guarda en un espacio propio y no toca los datos normales', () => {
        store.init();
        store.addService({
            id: 1,
            placa: 'P-111AAA',
            tipo: 'Automóvil',
            slot: 1,
            estado: 'activo',
        });
        const antes = localStorage.getItem('cp_services');

        entrarDemo();

        expect(localStorage.getItem('cp_services')).toBe(antes);
        expect(localStorage.getItem('cp_demo_services')).not.toBeNull();

        desactivarDemo();
        expect(store.getServices()).toHaveLength(1);
        expect(store.getServices()[0].placa).toBe('P-111AAA');
    });

    it('entrar otra vez no duplica ni pisa los datos de la demo', () => {
        entrarDemo();
        store.addService({
            id: 2,
            placa: 'P-999ZZZ',
            tipo: 'Automóvil',
            slot: 20,
            estado: 'activo',
        });
        entrarDemo();
        expect(store.getServices()).toHaveLength(16);
    });

    it('en la demo el usuario es el administrador de ejemplo', () => {
        entrarDemo();
        expect(store.getUser().email).toBe('admin@slotspotmj.com');
    });

    it('sembrar no reemplaza datos que ya existen', () => {
        activarDemo();
        store.init();
        store.addService({
            id: 3,
            placa: 'P-123ABC',
            tipo: 'Automóvil',
            slot: 1,
            estado: 'activo',
        });
        sembrarDemo();
        expect(store.getServices()).toHaveLength(1);
    });
});

describe('restablecer la demo', () => {
    it('devuelve los datos de ejemplo y descarta los cambios', () => {
        entrarDemo();
        store.addService({
            id: 4,
            placa: 'P-555EEE',
            tipo: 'Automóvil',
            slot: 20,
            estado: 'activo',
        });
        store.saveUser({ nombre: 'Otra persona', email: 'otra@x.com', password: 'x' });
        expect(store.getServices()).toHaveLength(16);

        restablecerDemo();

        expect(store.getServices()).toHaveLength(15);
        expect(store.getServices().some((s) => s.placa === 'P-555EEE')).toBe(false);
        expect(store.getUser().email).toBe('admin@slotspotmj.com');
        expect(esDemo()).toBe(true);
    });

    it('avisa a los componentes suscritos', () => {
        entrarDemo();
        const oyente = vi.fn();
        const cancelar = store.subscribe(oyente);
        restablecerDemo();
        expect(oyente).toHaveBeenCalled();
        cancelar();
    });

    it('no toca los datos normales', () => {
        store.init();
        store.addService({
            id: 5,
            placa: 'P-777GGG',
            tipo: 'Automóvil',
            slot: 1,
            estado: 'activo',
        });
        entrarDemo();
        restablecerDemo();
        desactivarDemo();
        expect(store.getServices()).toHaveLength(1);
    });
});
