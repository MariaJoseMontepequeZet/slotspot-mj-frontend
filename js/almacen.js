const crear = (obtenerBase) => {
    const memoria = new Map();
    let base = null;

    try {
        base = obtenerBase();
    } catch {
        base = null;
    }

    return {
        getItem(clave) {
            if (memoria.has(clave)) return memoria.get(clave);
            try {
                return base ? base.getItem(clave) : null;
            } catch {
                return null;
            }
        },

        setItem(clave, valor) {
            const texto = String(valor);
            if (base) {
                try {
                    base.setItem(clave, texto);
                    memoria.delete(clave);
                    return;
                } catch {
                    // El navegador rechazo la escritura (por ejemplo, cuota llena).
                }
            }
            memoria.set(clave, texto);
        },

        removeItem(clave) {
            memoria.delete(clave);
            try {
                base?.removeItem(clave);
            } catch {
                // Sin acceso al almacenamiento: no hay nada mas que borrar.
            }
        },
    };
};

export const almacen = crear(() => window.localStorage);
export const sesion = crear(() => window.sessionStorage);
