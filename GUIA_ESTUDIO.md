# Guía de Estudio — SlotSpot MJ

> Esta guía está diseñada para que puedas responder cualquier pregunta técnica sobre el proyecto.

---

## ¿Cómo se conectan los archivos?

### Flujo completo desde que abres la página:

```
index.html
   │
   ├── Carga css/style.css (estilos globales)
   │
   └── Carga js/app.js (type="module")
          │
          ├── Importa js/storage.js ──→ Inicializa localStorage
          │                              (cp_user, cp_types, cp_services)
          │
          ├── Importa js/components/LoginPage.js
          ├── Importa js/components/AppNav.js
          ├── Importa js/components/EntryForm.js
          ├── Importa js/components/SlotsGrid.js
          ├── Importa js/components/IncomeReports.js
          └── Importa js/components/UserProfile.js
```

**En resumen:** `index.html` solo carga `app.js`, y `app.js` importa TODO lo demás.

---

## Preguntas Frecuentes con Respuestas

### 1. "¿Por qué usas `type="module"` en el script?"

Porque el proyecto usa **ES6 Modules** con `import` y `export`. Sin `type="module"`, el navegador no entiende esas instrucciones. Esto también obliga a usar un servidor HTTP (no funciona con `file:///`).

```html
<!-- index.html línea 28 -->
<script type="module" src="js/app.js"></script>
```

---

### 2. "¿Qué son los Web Components y por qué los usas?"

Los Web Components son **elementos HTML personalizados** que encapsulan su propio HTML, CSS y JavaScript. Cada componente extiende `HTMLElement` y usa **Shadow DOM** para que sus estilos no interfieran con el resto de la página.

```javascript
// Ejemplo: cómo se crea un componente
export class LoginPage extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' }); // Shadow DOM
    }
    connectedCallback() { this.render(); } // Se ejecuta cuando se agrega al DOM
    render() {
        this.shadowRoot.innerHTML = `
            <link rel="stylesheet" href="css/login.css">
            <div>...</div>
        `;
    }
}
customElements.define('login-page', LoginPage); // Registra la etiqueta <login-page>
```

**¿Por qué?** Para **reutilización**. En vez de escribir todo el HTML junto, cada componente es independiente. Puedo poner `<login-page></login-page>` en cualquier parte y funciona solo.

---

### 3. "¿Cómo se comunican los componentes entre sí?"

Usando un **patrón Event Bus** con `window.dispatchEvent()` y `window.addEventListener()`.

```
EntryForm.js ──dispara──→ window.dispatchEvent('add-service')
                                    │
app.js ◄──────escucha───── window.addEventListener('add-service')
    │
    └──→ Guarda en localStorage
    └──→ Refresca los componentes (dispara 'storage-update')
                                    │
AppNav.js ◄──escucha───── window.addEventListener('storage-update')
SlotsGrid.js ◄──escucha── window.addEventListener('storage-update')
```

**¿Por qué `window` y no `this`?** Porque los componentes están dentro de Shadow DOM. Si usas `this.dispatchEvent()`, el evento puede no llegar al listener global. Con `window.dispatchEvent()` siempre llega.

---

### 4. "¿Cómo funciona el login?"

1. `app.js` verifica `sessionStorage.getItem('cp_logged_in')` al cargar
2. Si no hay sesión → muestra `<login-page>` y oculta la app
3. El usuario ingresa email y contraseña
4. `LoginPage.js` lee `localStorage.getItem('cp_user')` y compara
5. Si coincide → `sessionStorage.setItem('cp_logged_in', 'true')` y dispara `login-success`
6. `app.js` escucha `login-success` → remueve el login y muestra el dashboard

```javascript
// LoginPage.js - Verificación de credenciales
const user = JSON.parse(localStorage.getItem('cp_user') || '{}');
if (email === user.email && password === user.password) {
    sessionStorage.setItem('cp_logged_in', 'true');
    window.dispatchEvent(new CustomEvent('login-success'));
}
```

**¿Por qué `sessionStorage` y no `localStorage`?** Porque `sessionStorage` se borra al cerrar la pestaña. Así el usuario tiene que loguearse cada vez que abre la página. `localStorage` es permanente (se usa para guardar los datos del usuario, servicios, etc.).

---

### 5. "¿Cómo funciona el prefijo automático de la placa?"

En `EntryForm.js` hay un método `getPrefix()` que mapea tipo → letra:

```javascript
getPrefix(tipo) {
    const prefixes = {
        'Automóvil': 'P',   // P de "Particular"
        'Moto': 'M',
        'Camioneta': 'C',
        'Bicicleta': 'B',
        'Scooter': 'S'
    };
    return prefixes[tipo] || 'P';
}
```

Cuando el usuario cambia el `<select>` de tipo de vehículo, se ejecuta:
```javascript
tipoSelect.onchange = () => {
    prefixLabel.textContent = this.getPrefix(tipoSelect.value);
};
```

Y cuando registra, la placa final se arma así:
```javascript
const placa = `${prefix}-${nums}${letters}`; // Ej: "P-123ABC"
```

---

### 6. "¿Cómo validas que no se repitan slots ni placas?"

En `EntryForm.js`, antes de registrar, se consulta `localStorage`:

```javascript
// Obtener todos los servicios activos
const services = JSON.parse(localStorage.getItem('cp_services') || '[]');
const activos = services.filter(s => s.estado === 'activo');

// ¿El slot ya está ocupado?
const slotOcupado = activos.find(s => parseInt(s.slot) === slot);
if (slotOcupado) {
    return this.showError(`El Slot ${slot} ya está ocupado por ${slotOcupado.placa}`);
}

// ¿La placa ya existe?
const placaExiste = activos.find(s => s.placa === placa);
if (placaExiste) {
    return this.showError(`La placa ${placa} ya está registrada en el Slot ${placaExiste.slot}`);
}
```

Si alguna validación falla, se muestra un mensaje de error **inline** (dentro del formulario) con un cuadro rojo que tiene animación shake.

---

### 7. "¿Cómo se calcula el cobro?"

Se calcula en dos lugares: en el formulario al mostrar el detalle, y al dar salida.

```javascript
// Tarifas por hora según el tipo
const rates = { "Automóvil": 15, "Moto": 5, "Camioneta": 20, "Bicicleta": 2, "Scooter": 3 };

// Calcular horas (mínimo 1 hora, redondeando hacia arriba)
const hours = Math.max(1, Math.ceil(
    (new Date() - new Date(this._selected.entrada)) / (1000 * 60 * 60)
));

// Total
const total = (hours * rate).toFixed(2);
```

**Desglose de la fórmula:**
- `new Date() - new Date(entrada)` → da la diferencia en milisegundos
- `/ (1000 * 60 * 60)` → convierte a horas (1000ms × 60s × 60min)
- `Math.ceil()` → redondea hacia arriba (si estuvo 1h 20min, cobra 2 horas)
- `Math.max(1, ...)` → mínimo cobra 1 hora

---

### 8. "¿Cómo funciona el responsive?"

Se usan **media queries** en cada archivo CSS. Como los componentes usan Shadow DOM, cada CSS es independiente.

**Breakpoints usados:**

| Breakpoint | ¿Qué cambia? |
|:----------:|:-------------|
| `1024px` | El layout principal pasa de 2 columnas a 1 columna |
| `768px` | Navbar se envuelve (flex-wrap), slots más pequeños, padding reducido |
| `420px` | Se oculta el nombre del usuario, stats minimizadas |

**Ejemplo en `style.css`:**
```css
/* Escritorio: 2 columnas */
.main-layout {
    display: grid;
    grid-template-columns: 1fr 380px;
}

/* Tablet: 1 columna */
@media (max-width: 1024px) {
    .main-layout {
        grid-template-columns: 1fr;
    }
}

/* Móvil: menos padding */
@media (max-width: 768px) {
    body { padding: 10px; }
    .glass-panel { padding: 15px; border-radius: 16px; }
}
```

**Ejemplo en `app-nav.css`:**
```css
@media (max-width: 768px) {
    .navbar {
        flex-wrap: wrap; /* Permite que los elementos se bajen a la siguiente fila */
    }
    .stats-container {
        order: 3;        /* Las stats bajan al final */
        width: 100%;     /* Ocupan todo el ancho */
    }
}

@media (max-width: 420px) {
    .user-name {
        display: none;   /* Se oculta el nombre, solo queda el avatar */
    }
}
```

**¿Por qué `font-size: 16px` en los inputs?**
```css
input, select {
    font-size: 16px; /* Previene el zoom automático en iOS al hacer focus */
}
```
En iPhones, si un input tiene `font-size` menor a 16px, Safari hace zoom automático al campo. Poner 16px lo previene.

---

### 9. "¿Qué es el Shadow DOM y para qué sirve?"

El Shadow DOM es una **encapsulación** del DOM. Cada componente tiene su propio árbol DOM interno que está aislado del resto de la página.

**Ventajas:**
- Los estilos CSS de un componente **no afectan** a otros
- Los IDs pueden repetirse sin conflicto (cada Shadow DOM es independiente)
- Cada componente carga su propio CSS con `<link rel="stylesheet">`

**Desventaja que tuvimos que resolver:**
- Los eventos no salen del Shadow DOM automáticamente → por eso usamos `window.dispatchEvent()`

```javascript
// Cada componente carga su CSS así:
this.shadowRoot.innerHTML = `
    <link rel="stylesheet" href="css/entry-form.css">
    <div class="form-container">...</div>
`;
```

---

### 10. "¿Cómo funciona el localStorage en este proyecto?"

`localStorage` persiste datos en el navegador. Se usa como "base de datos" del proyecto.

| Clave | Qué guarda | Ejemplo |
|-------|------------|---------|
| `cp_user` | Datos del administrador | `{"nombre":"admin","email":"admin@slotspotmj.com","password":"Admin123"}` |
| `cp_types` | Tipos de vehículos con tarifa | `[{"codigo":"AUT","nombre":"Automóvil","tarifa":"15.00"},...]` |
| `cp_services` | Todos los servicios (activos y finalizados) | `[{"placa":"P-123ABC","tipo":"Automóvil","slot":1,"estado":"activo",...}]` |
| `cp_lang` | Idioma seleccionado | `"es"` o `"en"` |
| `cp_saved_email` | Email guardado (recordar) | `"admin@slotspotmj.com"` |
| `cp_saved_pass` | Password guardado (recordar) | `"Admin123"` |

**Cómo se usa:**
```javascript
// Guardar
localStorage.setItem('cp_services', JSON.stringify(services));

// Leer
const services = JSON.parse(localStorage.getItem('cp_services') || '[]');
```

**`sessionStorage` vs `localStorage`:**
- `sessionStorage` → se borra al cerrar la pestaña (usado para el login)
- `localStorage` → permanente hasta que se borre manualmente (usado para datos)

---

### 11. "¿Qué pasa cuando hago clic en un slot ocupado?"

```
Usuario hace clic en slot 3 (ocupado con P-123ABC)
        │
        ▼
SlotsGrid.js: el.onclick ejecuta:
        │
        ├── Busca el servicio activo con slot === 3
        │   const s = activos.find(item => parseInt(item.slot) === 3)
        │
        ├── Obtiene el componente <entry-form> del DOM
        │   const form = document.querySelector('entry-form')
        │
        └── Le asigna el modo edición:
            form.editMode = s;
                │
                ▼
        EntryForm.js ejecuta el setter:
            set editMode(s) {
                this._mode = 'edit';
                this._selected = s;    ← guarda los datos del vehículo
                this.render();          ← re-renderiza en modo edición
            }
                │
                ▼
        El formulario ahora muestra:
        - Placa pre-llenada
        - Tipo seleccionado
        - Total a cobrar
        - Botón "Actualizar Datos"
        - Botón "Dar Salida (Cobrar)"
        - Botón "Cancelar"
```

---

### 12. "¿Cómo funciona el cambio de idioma?"

En `i18n.js`:
```javascript
export const getLang = () => localStorage.getItem('cp_lang') || 'es';

export const setLang = (lang) => {
    localStorage.setItem('cp_lang', lang);
    window.location.reload(); // Recarga toda la página
};
```

Cada componente lee las traducciones así:
```javascript
import { translations, getLang } from '../i18n.js';

const t = translations[getLang()]; // t.form_title, t.btn_update, etc.
```

Al recargar, todos los componentes leen el nuevo idioma de `localStorage` y se renderizan con las traducciones correctas.

---

### 13. "¿Cómo funciona el modal del perfil?"

Es un **overlay de pantalla completa** que se renderiza dentro de `<main>`:

```css
.profile-overlay {
    position: fixed;     /* Se posiciona sobre toda la ventana */
    top: 0; left: 0;
    width: 100vw; height: 100vh;
    background: rgba(0, 0, 0, 0.6);   /* Fondo oscuro semi-transparente */
    backdrop-filter: blur(8px);         /* Desenfoca el contenido detrás */
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;       /* Asegura que esté sobre todo */
}
```

Se cierra de 3 formas:
1. Botón  → `window.dispatchEvent(new CustomEvent('show-dashboard'))`
2. Clic fuera del modal → mismo evento
3. Cerrar sesión → `window.dispatchEvent(new CustomEvent('logout'))`

---

### 14. "¿Qué es `glassmorphism` y dónde lo usas?"

Es un estilo visual donde los paneles se ven como **vidrio esmerilado**: fondo semi-transparente + desenfoque detrás.

```css
.glass-panel {
    background: rgba(30, 12, 58, 0.7);       /* Fondo morado con transparencia */
    backdrop-filter: blur(20px);               /* Desenfoque del contenido detrás */
    border: 1px solid rgba(157, 78, 221, 0.2); /* Borde morado sutil */
    border-radius: 24px;                       /* Esquinas redondeadas */
}
```

Se usa en: paneles principales, navbar, modal de perfil, login card.

---

### 15. "¿Cuál es la diferencia entre `estado: 'activo'` y `estado: 'finalizado'`?"

Cada servicio en `cp_services` tiene un campo `estado`:

| Estado | Significado | ¿Tiene slot? | ¿Aparece en grilla? | ¿Aparece en reportes? |
|--------|------------|:------------:|:-------------------:|:---------------------:|
| `activo` | Vehículo estacionado |  Sí |  Sí |  No |
| `finalizado` | Ya se fue y pagó |  No (null) |  No |  Sí |

Cuando das salida, el servicio cambia de `activo` a `finalizado`, se le asigna `slot: null`, y se le agrega `salida` (hora de salida) y `total` (monto cobrado).

---

## Resumen de Tecnologías Usadas

| Tecnología | Para qué se usa |
|------------|----------------|
| **HTML5** | Estructura de la página, etiquetas semánticas |
| **CSS3** | Estilos, glassmorphism, animaciones, responsive (media queries) |
| **JavaScript ES6** | Lógica, módulos (import/export), clases |
| **Web Components** | Componentes reutilizables con Shadow DOM |
| **Custom Events** | Comunicación entre componentes (Event Bus) |
| **localStorage** | Persistencia de datos (base de datos del cliente) |
| **sessionStorage** | Control de sesión del login |
| **CSS Grid** | Layout principal de 2 columnas y grilla de slots |
| **Flexbox** | Navbar, formularios, grupos de inputs |
| **backdrop-filter** | Efecto glassmorphism (blur detrás de paneles) |

---

*Si estudias esta guía y el README.md, podrás responder cualquier pregunta sobre el código. *
