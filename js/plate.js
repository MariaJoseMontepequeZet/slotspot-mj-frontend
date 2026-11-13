const PREFIXES = {
    Automóvil: 'P',
    Moto: 'M',
    Camioneta: 'C',
    Bicicleta: 'B',
    Scooter: 'S',
};

const DEFAULT_PREFIX = 'P';

export const getPrefix = (tipo) => PREFIXES[tipo] ?? DEFAULT_PREFIX;

export const sanitizeDigits = (value) =>
    String(value ?? '')
        .replace(/[^0-9]/g, '')
        .slice(0, 3);

export const sanitizeLetters = (value) =>
    String(value ?? '')
        .replace(/[^A-Za-z]/g, '')
        .toUpperCase()
        .slice(0, 3);

export const parsePlate = (placa) => {
    if (typeof placa !== 'string' || placa === '') return { nums: '', letters: '' };
    const clean = placa.replace(/^[PMCBS]-?/, '');
    return {
        nums: clean.replace(/[^0-9]/g, '').slice(0, 3),
        letters: clean.replace(/[^A-Z]/g, '').slice(0, 3),
    };
};

export const validatePlate = (nums, letters) => {
    if (nums.length === 0 && letters.length === 0) return 'incomplete';
    if (!/^\d{3}$/.test(nums)) return 'numbers';
    if (!/^[A-Z]{3}$/.test(letters)) return 'letters';
    return null;
};

export const buildPlate = (tipo, nums, letters) => `${getPrefix(tipo)}-${nums}${letters}`;
