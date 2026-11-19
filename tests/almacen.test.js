import { afterEach, describe, expect, it, vi } from 'vitest';

const descriptorOriginal = Object.getOwnPropertyDescriptor(window, 'localStorage');

const reemplazarLocalStorage = (descriptor) => {
    Object.defineProperty(window, 'localStorage', { configurable: true, ...descriptor });
};

const importarAlmacenNuevo = async () => {
    vi.resetModules();
    return import('../js/almacen.js');
};

afterEach(() => {
    if (descriptorOriginal) {
        Object.defineProperty(window, 'localStorage', descriptorOriginal);
    } else {
        delete window.localStorage;
    }
    localStorage.clear();
    sessionStorage.clear();
});

describe('almacen con el navegador disponible', () => {
    it('guarda, lee y borra en localStorage', async () => {
        const { almacen } = await importarAlmacenNuevo();
        almacen.setItem('clave', 'valor');
        expect(localStorage.getItem('clave')).toBe('valor');
        expect(almacen.getItem('clave')).toBe('valor');
        almacen.removeItem('clave');
        expect(localStorage.getItem('clave')).toBeNull();
        expect(almacen.getItem('clave')).toBeNull();
    });

    it('devuelve null para una clave que no existe', async () => {
        const { almacen } = await importarAlmacenNuevo();
        expect(almacen.getItem('no-existe')).toBeNull();
    });

    it('guarda los valores como texto', async () => {
        const { almacen } = await importarAlmacenNuevo();
        almacen.setItem('numero', 42);
        expect(almacen.getItem('numero')).toBe('42');
    });

    it('la sesion usa sessionStorage y no mezcla con localStorage', async () => {
        const { almacen, sesion } = await importarAlmacenNuevo();
        sesion.setItem('solo-sesion', '1');
        expect(sessionStorage.getItem('solo-sesion')).toBe('1');
        expect(almacen.getItem('solo-sesion')).toBeNull();
    });
});

describe('almacen con localStorage bloqueado (iframe de terceros)', () => {
    const bloquear = () =>
        reemplazarLocalStorage({
            get() {
                throw new DOMException('Acceso bloqueado', 'SecurityError');
            },
        });

    it('no lanza errores y funciona en memoria', async () => {
        bloquear();
        const { almacen } = await importarAlmacenNuevo();
        expect(() => almacen.setItem('clave', 'valor')).not.toThrow();
        expect(almacen.getItem('clave')).toBe('valor');
        expect(() => almacen.removeItem('clave')).not.toThrow();
        expect(almacen.getItem('clave')).toBeNull();
    });

    it('la lectura de una clave inexistente devuelve null', async () => {
        bloquear();
        const { almacen } = await importarAlmacenNuevo();
        expect(almacen.getItem('nada')).toBeNull();
    });

    it('cada recarga del modulo empieza vacia', async () => {
        bloquear();
        const primero = await importarAlmacenNuevo();
        primero.almacen.setItem('clave', 'valor');
        const segundo = await importarAlmacenNuevo();
        expect(segundo.almacen.getItem('clave')).toBeNull();
    });

    it('la sesion sigue funcionando aunque localStorage este bloqueado', async () => {
        bloquear();
        const { sesion } = await importarAlmacenNuevo();
        sesion.setItem('cp_logged_in', 'true');
        expect(sesion.getItem('cp_logged_in')).toBe('true');
    });
});

describe('almacen cuando el navegador falla despues del arranque', () => {
    const crearFalso = ({ escritura, lectura }) => {
        const datos = new Map();
        return {
            getItem: (clave) => {
                if (lectura) throw new Error('lectura rechazada');
                return datos.get(clave) ?? null;
            },
            setItem: (clave, valor) => {
                if (escritura) {
                    throw new DOMException('Cuota llena', 'QuotaExceededError');
                }
                datos.set(clave, valor);
            },
            removeItem: (clave) => datos.delete(clave),
        };
    };

    it('si la escritura falla por cuota, el valor queda en memoria', async () => {
        reemplazarLocalStorage({ value: crearFalso({ escritura: true }) });
        const { almacen } = await importarAlmacenNuevo();
        expect(() => almacen.setItem('clave', 'valor')).not.toThrow();
        expect(almacen.getItem('clave')).toBe('valor');
    });

    it('si la lectura falla, devuelve null en lugar de lanzar', async () => {
        reemplazarLocalStorage({ value: crearFalso({ lectura: true }) });
        const { almacen } = await importarAlmacenNuevo();
        expect(almacen.getItem('clave')).toBeNull();
    });
});
