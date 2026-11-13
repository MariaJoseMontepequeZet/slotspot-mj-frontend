import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { store } from '../js/store.js';

const servicio = (id, estado = 'activo', extra = {}) => ({
    id,
    placa: 'P-' + String(id).padStart(3, '0') + 'AAA',
    tipo: 'Moto',
    slot: id,
    estado,
    entrada: '2026-11-12T10:00:00.000Z',
    ...extra,
});

describe('store', () => {
    let listener;
    let unsubscribe;

    beforeEach(() => {
        localStorage.clear();
        listener = vi.fn();
        unsubscribe = store.subscribe(listener);
    });

    afterEach(() => unsubscribe());

    describe('init', () => {
        it('siembra tipos, servicios y usuario cuando no existen', () => {
            store.init();
            expect(store.getTypes()).toHaveLength(5);
            expect(store.getServices()).toEqual([]);
            expect(store.getUser().email).toBe('admin@slotspotmj.com');
        });

        it('repite la siembra sin duplicar datos', () => {
            store.init();
            store.init();
            expect(store.getTypes()).toHaveLength(5);
        });

        it('recrea tipos vacios y un usuario invalido', () => {
            localStorage.setItem('cp_types', '[]');
            localStorage.setItem('cp_user', 'null');
            store.init();
            expect(store.getTypes()).toHaveLength(5);
            expect(store.getUser().email).toBe('admin@slotspotmj.com');
        });

        it('conserva un usuario valido existente', () => {
            localStorage.setItem('cp_user', JSON.stringify({ nombre: 'Maria', email: 'm@x.com' }));
            store.init();
            expect(store.getUser()).toEqual({ nombre: 'Maria', email: 'm@x.com' });
        });

        it('conserva las tarifas personalizadas', () => {
            localStorage.setItem(
                'cp_types',
                JSON.stringify([{ codigo: 'MOT', nombre: 'Moto', tarifa: '9.00' }]),
            );
            store.init();
            expect(store.getTypes()).toEqual([{ codigo: 'MOT', nombre: 'Moto', tarifa: '9.00' }]);
        });
    });

    describe('lecturas', () => {
        it('ignora elementos que no son objetos', () => {
            localStorage.setItem('cp_services', JSON.stringify([servicio(1), null, 5, 'texto']));
            expect(store.getServices()).toEqual([servicio(1)]);
        });

        it('devuelve una lista vacia si el JSON esta danado', () => {
            localStorage.setItem('cp_services', '{{no es json');
            expect(store.getServices()).toEqual([]);
        });

        it('separa servicios activos y finalizados', () => {
            localStorage.setItem(
                'cp_services',
                JSON.stringify([servicio(1), servicio(2, 'finalizado'), servicio(3)]),
            );
            expect(store.getActiveServices().map((s) => s.id)).toEqual([1, 3]);
            expect(store.getFinishedServices().map((s) => s.id)).toEqual([2]);
        });
    });

    describe('escrituras', () => {
        it('addService guarda el servicio y notifica', () => {
            store.addService(servicio(1));
            expect(store.getServices()).toEqual([servicio(1)]);
            expect(listener).toHaveBeenCalledTimes(1);
        });

        it('addService conserva los servicios anteriores', () => {
            store.addService(servicio(1));
            store.addService(servicio(2));
            expect(store.getServices().map((s) => s.id)).toEqual([1, 2]);
        });

        it('updateService reemplaza el servicio y notifica', () => {
            store.addService(servicio(1));
            listener.mockClear();
            const resultado = store.updateService(servicio(1, 'finalizado', { total: '15.00' }));
            expect(resultado).toBe(true);
            expect(store.getServices()[0]).toMatchObject({ estado: 'finalizado', total: '15.00' });
            expect(listener).toHaveBeenCalledTimes(1);
        });

        it('updateService devuelve false y no notifica si el id no existe', () => {
            store.addService(servicio(1));
            listener.mockClear();
            expect(store.updateService(servicio(99))).toBe(false);
            expect(store.getServices()).toEqual([servicio(1)]);
            expect(listener).not.toHaveBeenCalled();
        });

        it('saveUser guarda el usuario y notifica', () => {
            store.saveUser({ nombre: 'Maria', email: 'm@x.com' });
            expect(store.getUser()).toEqual({ nombre: 'Maria', email: 'm@x.com' });
            expect(listener).toHaveBeenCalledTimes(1);
        });
    });

    describe('suscripciones', () => {
        it('la funcion devuelta cancela la suscripcion', () => {
            unsubscribe();
            store.addService(servicio(1));
            expect(listener).not.toHaveBeenCalled();
        });

        it('notifica a todos los suscriptores', () => {
            const otro = vi.fn();
            const cancelar = store.subscribe(otro);
            store.addService(servicio(1));
            expect(listener).toHaveBeenCalledTimes(1);
            expect(otro).toHaveBeenCalledTimes(1);
            cancelar();
        });

        it('notifica cuando otra pestana cambia una clave vigilada', () => {
            window.dispatchEvent(new StorageEvent('storage', { key: 'cp_services' }));
            expect(listener).toHaveBeenCalledTimes(1);
        });

        it('notifica cuando otra pestana limpia todo el almacenamiento', () => {
            window.dispatchEvent(new StorageEvent('storage', { key: null }));
            expect(listener).toHaveBeenCalledTimes(1);
        });

        it('ignora claves que no son de la aplicacion', () => {
            window.dispatchEvent(new StorageEvent('storage', { key: 'otra_clave' }));
            expect(listener).not.toHaveBeenCalled();
        });
    });
});
