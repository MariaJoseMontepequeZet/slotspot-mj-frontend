const ESCAPES = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
};

export const escapeHTML = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ESCAPES[c]);

export const readJSON = (key, fallback) => {
    try {
        const parsed = JSON.parse(localStorage.getItem(key));
        const sameShape =
            parsed !== null &&
            typeof parsed === typeof fallback &&
            Array.isArray(parsed) === Array.isArray(fallback);
        return sameShape ? parsed : fallback;
    } catch {
        return fallback;
    }
};
