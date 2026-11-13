import { readJSON } from './utils.js';

const KEYS = {
    services: 'cp_services',
    types: 'cp_types',
    user: 'cp_user',
};

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
const writeJSON = (key, value) => localStorage.setItem(key, JSON.stringify(value));

window.addEventListener('storage', (event) => {
    if (event.key === null || Object.values(KEYS).includes(event.key)) notify();
});

export const store = {
    init() {
        if (store.getTypes().length === 0) writeJSON(KEYS.types, DEFAULT_TYPES);
        if (!localStorage.getItem(KEYS.services)) writeJSON(KEYS.services, []);
        if (!store.getUser().email) writeJSON(KEYS.user, DEFAULT_USER);
    },

    subscribe(listener) {
        listeners.add(listener);
        return () => listeners.delete(listener);
    },

    getTypes() {
        return readJSON(KEYS.types, []).filter(isObject);
    },

    getServices() {
        return readJSON(KEYS.services, []).filter(isObject);
    },

    getActiveServices() {
        return store.getServices().filter((s) => s.estado === 'activo');
    },

    getFinishedServices() {
        return store.getServices().filter((s) => s.estado === 'finalizado');
    },

    getUser() {
        return readJSON(KEYS.user, {});
    },

    saveUser(user) {
        writeJSON(KEYS.user, user);
        notify();
    },

    addService(service) {
        writeJSON(KEYS.services, [...store.getServices(), service]);
        notify();
    },

    updateService(service) {
        const services = store.getServices();
        const index = services.findIndex((item) => item.id === service.id);
        if (index === -1) return false;
        services[index] = service;
        writeJSON(KEYS.services, services);
        notify();
        return true;
    },
};
