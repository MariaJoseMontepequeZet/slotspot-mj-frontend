import { almacen } from './almacen.js';
import { esDemo } from './modo.js';
import { readJSON } from './utils.js';

const NOMBRES = ['services', 'types', 'user'];
const clave = (nombre) => `${esDemo() ? 'cp_demo_' : 'cp_'}${nombre}`;
const CLAVES_VIGILADAS = NOMBRES.flatMap((nombre) => [`cp_${nombre}`, `cp_demo_${nombre}`]);

const DEFAULT_TYPES = [
    { codigo: 'MOT', nombre: 'Moto', tarifa: '5.00' },
    { codigo: 'AUT', nombre: 'Automóvil', tarifa: '15.00' },
    { codigo: 'CAM', nombre: 'Camioneta', tarifa: '20.00' },
    { codigo: 'BIC', nombre: 'Bicicleta', tarifa: '2.00' },
    { codigo: 'SCO', nombre: 'Scooter', tarifa: '3.00' },
];

const DEFAULT_USER = {
    nombre: 'Administrador',
    email: 'admin@slotspotmj.com',
    password: 'Admin123',
};

const listeners = new Set();
const notify = () => listeners.forEach((listener) => listener());
const isObject = (value) => value !== null && typeof value === 'object';
const writeJSON = (key, value) => almacen.setItem(key, JSON.stringify(value));

window.addEventListener('storage', (event) => {
    if (event.key === null || CLAVES_VIGILADAS.includes(event.key)) notify();
});

export const store = {
    init() {
        if (store.getTypes().length === 0) writeJSON(clave('types'), DEFAULT_TYPES);
        if (!almacen.getItem(clave('services'))) writeJSON(clave('services'), []);
        if (!store.getUser().email) writeJSON(clave('user'), DEFAULT_USER);
    },

    reemplazarServicios(servicios) {
        writeJSON(clave('services'), servicios);
        notify();
    },

    reiniciar() {
        NOMBRES.forEach((nombre) => almacen.removeItem(clave(nombre)));
        store.init();
        notify();
    },

    subscribe(listener) {
        listeners.add(listener);
        return () => listeners.delete(listener);
    },

    getTypes() {
        return readJSON(clave('types'), []).filter(isObject);
    },

    getServices() {
        return readJSON(clave('services'), []).filter(isObject);
    },

    getActiveServices() {
        return store.getServices().filter((s) => s.estado === 'activo');
    },

    getFinishedServices() {
        return store.getServices().filter((s) => s.estado === 'finalizado');
    },

    getUser() {
        return readJSON(clave('user'), {});
    },

    saveUser(user) {
        writeJSON(clave('user'), user);
        notify();
    },

    addService(service) {
        writeJSON(clave('services'), [...store.getServices(), service]);
        notify();
    },

    updateService(service) {
        const services = store.getServices();
        const index = services.findIndex((item) => item.id === service.id);
        if (index === -1) return false;
        services[index] = service;
        writeJSON(clave('services'), services);
        notify();
        return true;
    },
};
