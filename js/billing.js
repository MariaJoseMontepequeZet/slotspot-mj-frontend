const MS_PER_HOUR = 60 * 60 * 1000;

export const billableHours = (entrada, salida = new Date()) => {
    const elapsed = new Date(salida) - new Date(entrada);
    if (!Number.isFinite(elapsed) || elapsed <= 0) return 1;
    return Math.ceil(elapsed / MS_PER_HOUR);
};

export const getRate = (tipo, types) => {
    const type = types.find((item) => item.nombre === tipo);
    const raw = type?.tarifa;
    if (raw === undefined || raw === null || String(raw).trim() === '') return null;
    const rate = Number(raw);
    return Number.isFinite(rate) && rate >= 0 ? rate : null;
};

export const calculateCharge = (entrada, salida, tipo, types) => {
    const rate = getRate(tipo, types);
    if (rate === null) return null;
    const hours = billableHours(entrada, salida);
    const cents = Math.round(rate * 100) * hours;
    return { hours, rate, total: (cents / 100).toFixed(2) };
};
