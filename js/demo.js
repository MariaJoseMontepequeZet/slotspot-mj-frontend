import { sesion } from './almacen.js';
import { calculateCharge } from './billing.js';
import { activarDemo } from './modo.js';
import { store } from './store.js';

const MINUTO = 60 * 1000;

const ACTIVOS = [
    { placa: 'P-482KLM', tipo: 'Automóvil', slot: 2, haceMinutos: 95 },
    { placa: 'M-317TRX', tipo: 'Moto', slot: 5, haceMinutos: 40 },
    { placa: 'C-905BDF', tipo: 'Camioneta', slot: 8, haceMinutos: 200 },
    { placa: 'P-261QWE', tipo: 'Automóvil', slot: 11, haceMinutos: 25 },
    { placa: 'B-044ZXC', tipo: 'Bicicleta', slot: 14, haceMinutos: 130 },
    { placa: 'S-738PLM', tipo: 'Scooter', slot: 17, haceMinutos: 55 },
    { placa: 'P-590HJK', tipo: 'Automóvil', slot: 3, haceMinutos: 310 },
];

const FINALIZADOS = [
    { placa: 'P-318RTY', tipo: 'Automóvil', salioHaceMinutos: 50, duroMinutos: 150 },
    { placa: 'M-702UIO', tipo: 'Moto', salioHaceMinutos: 90, duroMinutos: 75 },
    { placa: 'C-156ASD', tipo: 'Camioneta', salioHaceMinutos: 180, duroMinutos: 240 },
    { placa: 'P-847FGH', tipo: 'Automóvil', salioHaceMinutos: 420, duroMinutos: 60 },
    { placa: 'B-229JKL', tipo: 'Bicicleta', salioHaceMinutos: 600, duroMinutos: 180 },
    { placa: 'S-413ZXC', tipo: 'Scooter', salioHaceMinutos: 1500, duroMinutos: 95 },
    { placa: 'P-675VBN', tipo: 'Automóvil', salioHaceMinutos: 1700, duroMinutos: 320 },
    { placa: 'M-980QAZ', tipo: 'Moto', salioHaceMinutos: 1900, duroMinutos: 45 },
];

export const crearServiciosDemo = (ahora = new Date(), tipos = store.getTypes()) => {
    const base = ahora.getTime();

    const activos = ACTIVOS.map((vehiculo, i) => ({
        id: base - (i + 1) * 1000,
        placa: vehiculo.placa,
        tipo: vehiculo.tipo,
        slot: vehiculo.slot,
        estado: 'activo',
        entrada: new Date(base - vehiculo.haceMinutos * MINUTO).toISOString(),
    }));

    const finalizados = FINALIZADOS.map((vehiculo, i) => {
        const salida = new Date(base - vehiculo.salioHaceMinutos * MINUTO);
        const entrada = new Date(salida.getTime() - vehiculo.duroMinutos * MINUTO);
        const cobro = calculateCharge(entrada, salida, vehiculo.tipo, tipos);
        if (!cobro) return null;
        return {
            id: base - (ACTIVOS.length + i + 1) * 1000,
            placa: vehiculo.placa,
            tipo: vehiculo.tipo,
            slot: null,
            estado: 'finalizado',
            entrada: entrada.toISOString(),
            salida: salida.toISOString(),
            total: cobro.total,
        };
    }).filter(Boolean);

    return [...activos, ...finalizados];
};

export const sembrarDemo = () => {
    if (store.getServices().length === 0) store.reemplazarServicios(crearServiciosDemo());
};

export const entrarDemo = () => {
    activarDemo();
    store.init();
    sembrarDemo();
    sesion.setItem('cp_logged_in', 'true');
};

export const restablecerDemo = () => {
    store.reiniciar();
    sembrarDemo();
};
