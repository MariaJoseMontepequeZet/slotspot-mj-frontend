import { sesion } from './almacen.js';

const CLAVE_DEMO = 'cp_demo';

export const esDemo = () => sesion.getItem(CLAVE_DEMO) === '1';
export const activarDemo = () => sesion.setItem(CLAVE_DEMO, '1');
export const desactivarDemo = () => sesion.removeItem(CLAVE_DEMO);

export const demoPedidaPorUrl = (busqueda = window.location.search) =>
    new URLSearchParams(busqueda).get('demo') === '1';
