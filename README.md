# SlotSpot MJ — Sistema de Administración de Parqueadero

> Aplicación web para la gestión de un parqueadero universitario. Permite registrar vehículos, calcular costos por tiempo de permanencia, administrar slots y generar reportes de ganancias.

> Este repositorio contiene el **frontend**. La API y la base de datos viven en [slotspot-mj](https://github.com/MariaJoseMontepequeZet/slotspot-mj).

**Propietario:** SlotSpot MJ  
**Desarrolladora:** María José Montepeque Zet  
**Tecnologías:** HTML5, CSS3, JavaScript (ES6 Modules), Web Components, localStorage
**Herramientas de desarrollo:** ESLint, Prettier, EditorConfig, Vitest, GitHub Actions

---

## Tabla de Contenidos

1. [Características](#características)
2. [Requisitos de Ejecución](#requisitos-de-ejecución)
3. [Cómo Ejecutar el Proyecto](#cómo-ejecutar-el-proyecto)
4. [Herramientas de Desarrollo](#herramientas-de-desarrollo)
5. [Pruebas e Integración Continua](#pruebas-e-integración-continua)
6. [Despliegue](#despliegue)
7. [Credenciales de Acceso](#credenciales-de-acceso)
8. [Estructura del Proyecto](#estructura-del-proyecto)
9. [Descripción de Archivos](#descripción-de-archivos)
10. [Arquitectura del Sistema](#arquitectura-del-sistema)
11. [Funcionalidades Detalladas](#funcionalidades-detalladas)
12. [Problemas Resueltos](#problemas-resueltos)
13. [Formato de Placas](#formato-de-placas)
14. [Tarifas por Vehículo](#tarifas-por-vehículo)

---

## Características

- **Login con autenticación** — validación de credenciales con opción de recordar sesión
- **Registro de vehículos** — con prefijo automático por tipo y validación de placa
- **20 slots visuales** — con etiqueta del tipo de vehículo y estado ocupado/libre
- **Cálculo automático de cobro** — basado en horas de permanencia × tarifa del tipo
- **Reportes de ganancias** — con hora de entrada, salida, duración y total por vehículo
- **Perfil editable** — cambio de nombre, correo, contraseña e idioma (ES/EN)
- **Validaciones completas** — slots duplicados, placas duplicadas, caracteres especiales
- **Diseño responsive** — adaptado a móvil, tablet y escritorio
- **Internacionalización** — soporte para Español e Inglés
- **Persistencia con localStorage** — los datos se mantienen al recargar la página

---

## Requisitos de Ejecución

El proyecto utiliza **ES6 Modules** (`<script type="module">`), lo cual **requiere un servidor HTTP** para funcionar correctamente. Abrir el archivo `index.html` directamente con `file:///` **no funcionará** debido a restricciones de seguridad CORS del navegador.

**Opciones de servidor:**

| Método | Comando |
|--------|---------|
| Python 3 | `python -m http.server 8080` |
| Node.js | `npx serve .` |
| VS Code | Extensión "Live Server" |

---

## Cómo Ejecutar el Proyecto

```bash
# 1. Clonar el repositorio
git clone https://github.com/MariaJoseMontepequeZet/slotspot-mj-frontend.git

# 2. Entrar al directorio
cd slotspot-mj-frontend

# 3. Iniciar servidor local
python -m http.server 8080

# 4. Abrir en el navegador
# http://localhost:8080
```

---

## Herramientas de Desarrollo

Requiere Node.js. Instalar dependencias una vez con `npm install`.

| Comando | Descripción |
|---------|-------------|
| `npm run lint` | Revisa el código con ESLint |
| `npm run format` | Da formato a JS, CSS, HTML y JSON con Prettier |
| `npm run format:check` | Verifica el formato sin modificar archivos |
| `npm test` | Ejecuta las pruebas automáticas con Vitest |
| `npm run test:coverage` | Ejecuta las pruebas y muestra la cobertura |

---

## Pruebas e Integración Continua

Las pruebas viven en `tests/` y usan Vitest con jsdom, de modo que `localStorage` y `window` existen sin abrir un navegador.

| Archivo | Qué verifica |
|---------|--------------|
| `tests/billing.test.js` | Horas cobradas (0 minutos, 1 hora exacta, 1 hora y 1 ms, fechas inválidas), tarifas inválidas y totales sin errores de coma flotante |
| `tests/utils.test.js` | `escapeHTML` con etiquetas, comillas y cierre de atributos, y `readJSON` con datos dañados o de otro tipo |
| `tests/plate.test.js` | Prefijos por tipo, saneamiento de dígitos y letras, lectura de placas existentes y validación |
| `tests/store.test.js` | Siembra de datos, lecturas seguras, altas, ediciones, suscripciones y cambios desde otra pestaña |

Los módulos con lógica (`billing.js`, `plate.js`, `store.js` y `utils.js`) tienen 100 % de cobertura. Los componentes de interfaz se verifican a mano en el navegador.

El workflow `.github/workflows/ci.yml` ejecuta ESLint, la verificación de formato y las pruebas en cada pull request hacia `dev` o `main` y en cada push a `dev`. Corre en los servidores de GitHub, no en el servidor propio, por lo que el código de un pull request nunca se ejecuta allí.

---

## Despliegue

Cada push a `main` despliega el frontend en el servidor propio mediante un runner self-hosted de GitHub Actions (etiqueta `slotspot`).

1. El workflow `.github/workflows/desplegar.yml` copia solo `index.html`, `css/` y `js/` a `~/slotspot/slotspot-mj-frontend/public` con `rsync`.
2. Ejecuta `~/slotspot/desplegar.sh web`, que levanta el servicio `web` (Caddy) y espera a que responda sano.
3. Caddy sirve los archivos estaticos, envia `/api/*` a la API y agrega cabeceras de seguridad (CSP, X-Content-Type-Options, X-Frame-Options, Referrer-Policy y Permissions-Policy).

Flujo de ramas: una rama por tarea, pull request hacia `dev` y de `dev` a `main` al cerrar cada entrega. Solo el merge a `main` despliega.

El `.env` y los secretos viven en el servidor, fuera del repositorio.

---

## Credenciales de Acceso

| Campo | Valor |
|-------|-------|
| **Email** | `admin@slotspotmj.com` |
| **Contraseña** | `Admin123` |

> **Nota:** Si los datos del usuario ya existen en tu localStorage de una sesión anterior, debes limpiar el almacenamiento local desde la consola del navegador:
> ```javascript
> localStorage.clear(); sessionStorage.clear(); location.reload();
> ```

---

## Estructura del Proyecto

```
slotspot-mj-frontend/
│
├── index.html                  # Página principal (punto de entrada)
├── README.md                   # Documentación del proyecto
├── .github/workflows/
│   ├── ci.yml                  # Lint, formato y pruebas en cada pull request
│   └── desplegar.yml           # Despliegue automatico al hacer push a main
├── package.json                # Scripts de lint, formato y pruebas
├── vitest.config.js            # Configuración de Vitest
├── eslint.config.js            # Reglas de ESLint
├── .prettierrc.json            # Reglas de Prettier
├── .editorconfig               # Estilo de edición compartido
│
├── tests/                      # Pruebas automáticas (Vitest)
│   ├── billing.test.js
│   ├── plate.test.js
│   ├── store.test.js
│   └── utils.test.js
│
├── css/                        # Hojas de estilo
│   ├── style.css               # Estilos globales y layout principal
│   ├── app-nav.css             # Estilos de la barra de navegación
│   ├── entry-form.css          # Estilos del formulario de registro
│   ├── slots-grid.css          # Estilos del grid de slots/espacios
│   ├── login.css               # Estilos de la página de login
│   ├── profile.css             # Estilos del modal de perfil
│   └── reports.css             # Estilos de los reportes de ganancias
│
└── js/                         # Lógica de la aplicación
    ├── app.js                  # Controlador principal (Event Bus)
    ├── config.js               # Constantes compartidas (total de slots)
    ├── store.js                # Almacén central de datos con suscripciones
    ├── billing.js              # Cálculo de horas y cobro por tarifa
    ├── plate.js                # Prefijos, saneamiento y validación de placas
    ├── utils.js                # escapeHTML y readJSON
    ├── i18n.js                 # Sistema de internacionalización (ES/EN)
    │
    └── components/             # Web Components (Custom Elements)
        ├── LoginPage.js        # Componente de autenticación
        ├── AppNav.js           # Barra de navegación con contadores
        ├── SlotsGrid.js        # Grilla visual de 20 espacios
        ├── EntryForm.js        # Formulario de registro/edición
        ├── IncomeReports.js    # Reportes de ganancias e historial
        └── UserProfile.js      # Modal de perfil de usuario
```

---

## Descripción de Archivos

### `index.html` — Punto de Entrada

Página HTML principal que carga los estilos globales y el módulo JavaScript principal. Contiene la estructura base de la aplicación:

- `<app-nav>` — componente de navegación
- `<main id="main-content">` — contenedor dinámico donde se renderizan las vistas
- Carga `js/app.js` como módulo ES6

---

### Archivos JavaScript

#### `js/app.js` — Controlador Principal

Es el **cerebro de la aplicación**. Se encarga de:

- **Verificar la sesión** al cargar: si no hay sesión activa en `sessionStorage`, muestra el login.
- **Renderizar las vistas**: Dashboard, Reportes, Perfil.
- **Manejar eventos globales** con un patrón **Event Bus** usando `window.addEventListener`:
  - `login-success` → oculta login, muestra la app
  - `logout` → limpia sesión, muestra login
  - `show-dashboard` → renderiza grilla + formulario
  - `open-reports` → renderiza reportes de ganancias
  - `open-profile` → renderiza modal de perfil

Los datos ya no viajan por eventos: los componentes leen y escriben mediante `js/store.js` y se actualizan solos al suscribirse a él.

**Problema resuelto:** Los componentes usan Shadow DOM, y los eventos lanzados con `this.dispatchEvent()` no siempre llegaban al listener global. Se solucionó usando `window.dispatchEvent()` directamente.

---

#### `js/store.js` — Almacén Central de Datos

Es la única puerta de acceso a `localStorage`. Crea los datos iniciales si no existen y expone:

| Método | Descripción |
|--------|-------------|
| `init()` | Siembra tipos, servicios y usuario si faltan o son inválidos |
| `subscribe(fn)` | Registra un listener que se ejecuta tras cada cambio; devuelve la función para cancelarlo |
| `getTypes()`, `getServices()`, `getActiveServices()`, `getFinishedServices()`, `getUser()` | Lecturas seguras |
| `addService(s)`, `updateService(s)`, `saveUser(u)` | Escrituras que notifican a los suscriptores |

Si el JSON guardado está dañado, las lecturas devuelven un valor por defecto en lugar de romper la aplicación. También escucha el evento `storage` del navegador, de modo que los cambios hechos en otra pestaña refrescan la interfaz.

| Clave | Contenido |
|-------|-----------|
| `cp_types` | Tipos de vehículo con código, nombre y tarifa |
| `cp_services` | Array vacío de servicios |
| `cp_user` | Usuario admin (`admin@slotspotmj.com` / `Admin123`) |

---

#### `js/billing.js` — Cobro

Una sola implementación del cálculo, usada por el formulario al mostrar el total y al dar salida:

- `billableHours(entrada, salida)`: horas a cobrar, redondeadas hacia arriba con mínimo 1. Una fecha inválida o una salida anterior a la entrada cuentan como 1 hora.
- `getRate(tipo, tipos)`: tarifa del tipo leída de `cp_types`. Devuelve `null` si el tipo no existe o la tarifa no es un número válido.
- `calculateCharge(entrada, salida, tipo, tipos)`: devuelve `{ hours, rate, total }` o `null` si no hay tarifa. El total se calcula en centavos para evitar errores de coma flotante.

Si no hay tarifa definida, el formulario lo avisa y no permite dar salida, en lugar de cobrar un valor inventado.

---

#### `js/plate.js` — Placas

Funciones puras que `EntryForm` usa para el formato de la placa y que se pueden probar sin interfaz:

- `getPrefix(tipo)`: prefijo del tipo de vehículo (`P`, `M`, `C`, `B` o `S`), con `P` por defecto.
- `sanitizeDigits(valor)` y `sanitizeLetters(valor)`: dejan solo dígitos o letras mayúsculas y cortan a 3 caracteres.
- `parsePlate(placa)`: separa dígitos y letras de una placa guardada.
- `validatePlate(dígitos, letras)`: devuelve `incomplete`, `numbers`, `letters` o `null` si es válida.
- `buildPlate(tipo, dígitos, letras)`: arma la placa final, por ejemplo `M-456DEF`.

---

#### `js/utils.js` — Utilidades

- `escapeHTML(valor)`: convierte `&`, `<`, `>`, `"` y `'` en entidades. Se usa en todo dato del usuario que entra en una plantilla con `innerHTML`.
- `readJSON(clave, valorPorDefecto)`: lee y parsea `localStorage` dentro de un `try/catch` y verifica que el tipo coincida con el valor por defecto.

---

#### `js/i18n.js` — Internacionalización

Sistema de traducción con soporte para **Español** e **Inglés**. Funciones:

- `getLang()` → obtiene el idioma actual de `localStorage`
- `setLang(lang)` → cambia el idioma y recarga la página
- `translations` → objeto con todas las traducciones

---

#### `js/components/LoginPage.js` — Autenticación

Componente que se muestra al inicio de la aplicación. Características:

- Lee credenciales desde `localStorage` (`cp_user`) para validar dinámicamente
- **"Recordar mi correo"**: guarda solo el correo en `localStorage`. La contraseña nunca se guarda, y la clave antigua `cp_saved_pass` se elimina al abrir el login
- Botón de **mostrar/ocultar contraseña**
- Mensajes de error con **animación shake**
- Si las credenciales son correctas → guarda sesión en `sessionStorage` y dispara `login-success`

---

#### `js/components/AppNav.js` — Barra de Navegación

Barra superior que muestra:

- **Logo** "SLOTSPOTMJ"
- **Contadores por tipo** de vehículo (Autos, Camionetas, Motos, Bicis, Scoots)
- **Contador de Vacíos/Ocupados** — calculado como `20 - activos.length` (verde) y `activos.length` (rojo)
- **Botones de navegación**: Inicio y Ganancias
- **Botón de perfil** con el nombre del usuario (leído de `cp_user` en localStorage)

**Problema resuelto:** El botón de perfil no funcionaba porque el texto "Administrador" estaba dentro de un `<strong>` que permitía selección de texto. Se reemplazó por un `<button>` unificado con `user-select: none` y `pointer-events: none` en los hijos.

---

#### `js/components/SlotsGrid.js` — Grilla de Espacios

Renderiza una cuadrícula de **20 slots** con:

- **Etiqueta por tipo**: Automóvil, Moto, Camioneta, Bicicleta o Scooter (traducida al idioma activo)
- **Estado visual**: slot ocupado (morado con borde) vs libre (translúcido)
- **Placa visible** en cada slot ocupado
- **Clic en slot ocupado** → abre el formulario de edición con los datos del vehículo

Se suscribe a `store` para refrescarse automáticamente.

---

#### `js/components/EntryForm.js` — Formulario de Registro/Edición

Componente dual que funciona en **modo inserción** y **modo edición**.

**Modo Inserción:**
- Selector de tipo de vehículo
- Input de placa con **prefijo automático** (P, M, C, B, S)
- Dos campos separados: 3 dígitos + 3 letras
- Selector de slot (1-20)

**Modo Edición** (al hacer clic en un slot ocupado):
- Muestra datos del vehículo
- Permite actualizar placa y tipo
- Muestra el **total a cobrar** calculado
- Botón "Dar Salida (Cobrar)"
- Botón "Cancelar"

**Validaciones implementadas:**
1. Solo se admiten **números** en el campo de dígitos — sin caracteres especiales
2. Solo se admiten **letras** en el campo de letras — sin caracteres especiales
3. **Exactamente 3 dígitos** y **3 letras** obligatorios
4. **Slot ocupado** → `"El Slot X ya está ocupado por PLACA. Elige otro espacio."`
5. **Placa duplicada** → `"La placa X ya está registrada en el Slot Y."`
6. **Bloqueo de pegado** de caracteres especiales
7. **Auto-focus**: al completar 3 números, salta automáticamente al campo de letras

Los mensajes de error se muestran **inline** con una animación shake en rojo, sin usar `alert()`.

---

#### `js/components/IncomeReports.js` — Reportes de Ganancias

Muestra:

- **Tarjetas de resumen**: total acumulado + total por cada tipo de vehículo
- **Tabla de historial de pagos** con las columnas:
  - Placa
  - Tipo de vehículo
  - Fecha
  - Hora de entrada (verde)
  - Hora de salida (rojo)
  - Duración calculada (ej: "2h 30m")
  - Total pagado

El cálculo del cobro se basa en: `horas × tarifa_del_tipo`, con la tarifa leída de `cp_types` (ver `js/billing.js`).

---

#### `js/components/UserProfile.js` — Modal de Perfil

Modal overlay con glassmorphism que permite:

- **Ver datos**: avatar, nombre y correo del usuario
- **Editar nombre**: campo de texto
- **Editar correo**: campo de email con validación de formato
- **Cambiar contraseña**: requiere contraseña actual + nueva contraseña
- **Cambiar idioma**: selector Español/Inglés
- **Cerrar sesión**: limpia `sessionStorage` y regresa al login

Las validaciones incluyen:
- Nombre no puede estar vacío
- Correo debe ser un formato válido
- Contraseña actual debe coincidir con la guardada
- Nueva contraseña debe tener al menos 4 caracteres

Los cambios se guardan en `localStorage` (`cp_user`) y se actualizan en toda la aplicación.

---

### Archivos CSS

#### `css/style.css` — Estilos Globales

- **Reset global**: `box-sizing: border-box` en todos los elementos
- **Fondo**: gradiente radial oscuro (`#0a041a` → `#1a0b2e`)
- **Layout principal**: CSS Grid de 2 columnas (`1fr 380px`) que cambia a 1 columna en tablets/móvil
- **Clase `.glass-panel`**: panel glassmorfismo con blur, borde morado y border-radius
- **`overflow-x: hidden`**: previene scroll horizontal en móvil
- **Media queries**: breakpoints a 1024px, 768px y 480px

#### `css/app-nav.css` — Navegación

- Navbar con `display: flex` y `backdrop-filter: blur(15px)`
- Contenedores de estadísticas con gap y fondo oscuro
- Botones de navegación con borde morado y hover suave
- Botón de perfil unificado con `user-select: none`
- **Responsive**: en móvil usa `flex-wrap`, las stats bajan a fila completa, en <420px se oculta el nombre del usuario

#### `css/entry-form.css` — Formulario

- Inputs con fondo oscuro, borde morado y `font-size: 16px` (evita zoom en iOS)
- **Grupo de placa**: flex row con badge de prefijo (gradiente morado), separador, y 2 inputs
- **Mensaje de error**: fondo rojo translúcido con animación `@keyframes shakeError`
- **Hint**: texto pequeño gris para indicar formato permitido

#### `css/login.css` — Login

- Overlay de pantalla completa con fondo del tema
- Tarjeta centrada con glassmorfismo
- Grupo de contraseña con botón toggle al lado
- Checkbox "Recordar mi correo" con accent-color morado
- Botón con gradiente morado y efecto hover con sombra

#### `css/profile.css` — Perfil Modal

- Overlay con `backdrop-filter: blur(8px)` y fondo oscuro semi-transparente
- Modal con scroll interno, botón de cerrar y secciones separadas
- Mensajes de éxito (verde) y error (rojo) con estilo diferenciado
- Botón de logout con estilo rojo sutil

#### `css/slots-grid.css` — Grilla de Slots

- Grid responsive con `repeat(auto-fill, minmax(110px, 1fr))`
- Slots con altura fija, bordes redondeados y efecto hover
- Slots ocupados con fondo morado intenso y borde visible
- En móvil: slots más pequeños (85px → 75px)

---

## Arquitectura del Sistema

```
┌──────────────────────────────────────────────┐
│                  index.html                   │
│         Carga estilos + app.js (module)       │
└──────────────────┬───────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────┐
│               app.js (Event Bus)              │
│                                               │
│  ┌─────────┐  ┌──────────┐  ┌─────────────┐ │
│  │ login-  │  │ show-    │  │ open-       │  │
│  │ success │  │ dashboard│  │ reports     │  │
│  └────┬────┘  └────┬─────┘  └──────┬──────┘ │
│       │            │               │         │
│       ▼            ▼               ▼         │
│  ┌─────────┐ ┌──────────┐  ┌────────────┐   │
│  │ Show    │ │ Render   │  │ Render     │   │
│  │ App     │ │ Dashboard│  │ Reports    │   │
│  └─────────┘ └──────────┘  └────────────┘   │
└──────────────────────────────────────────────┘

┌──────── Web Components (Shadow DOM) ─────────┐
│                                               │
│  LoginPage → Autenticación                    │
│  AppNav    → Navegación + contadores          │
│  SlotsGrid → Grilla visual de 20 espacios     │
│  EntryForm → Registro/Edición de vehículos    │
│  IncomeReports → Reportes de ganancias        │
│  UserProfile   → Modal de perfil              │
│                                               │
│  Navegación: window.dispatchEvent()           │
│  Datos: store.js (lecturas, escrituras y      │
│         suscripciones)                        │
└──────────────────────────────────────────────┘

┌──────────── localStorage ────────────────────┐
│                                               │
│  cp_user     → {nombre, email, password}      │
│  cp_types    → [{codigo, nombre, tarifa}]     │
│  cp_services → [{placa, tipo, slot, ...}]     │
│  cp_lang     → "es" | "en"                    │
│  cp_saved_email → email guardado (opcional)    │
│                                               │
└──────────────────────────────────────────────┘
```

---

## Funcionalidades Detalladas

### Login

1. La aplicación abre con la página de login
2. El usuario ingresa email y contraseña
3. Se valida contra los datos en `localStorage` (`cp_user`)
4. Si es correcto → se guarda en `sessionStorage` y se muestra el dashboard
5. Si "Recordar mi correo" está activo → se guarda solo el correo en `localStorage`
6. Si es incorrecto → se muestra mensaje de error con animación

### Registro de Vehículo

1. Seleccionar tipo de vehículo → el prefijo de la placa se actualiza automáticamente
2. Ingresar 3 dígitos (se valida en tiempo real, no permite caracteres especiales)
3. Al completar 3 dígitos → el cursor salta al campo de letras automáticamente
4. Ingresar 3 letras (se convierten a mayúsculas automáticamente)
5. Ingresar número de slot (1-20)
6. Al registrar se valida:
   - Que el slot no esté ocupado
   - Que la placa no esté ya registrada
7. Si pasa validaciones → se guarda en `localStorage` y se refresca todo

### Dar Salida (Cobro)

1. Clic en un slot ocupado → se abre el formulario en modo edición
2. Se muestra el total a cobrar: `horas_de_permanencia × tarifa_del_tipo`
3. Clic en "Dar Salida (Cobrar)" → se marca como finalizado con fecha/hora de salida
4. El slot se libera y el pago se registra en el historial

### Perfil

1. Clic en el botón de perfil (nombre + avatar) en la navegación
2. Se abre un modal con los datos del usuario
3. Se pueden editar: nombre, correo, contraseña e idioma
4. Los cambios se guardan en `localStorage`
5. Cerrar sesión → regresa al login

---

## Problemas Resueltos

### 1. Botón de Perfil no clickeable

**Problema:** El texto "Administrador" estaba dentro de un `<strong>` que permitía selección de texto, interceptando el evento `click`.

**Solución:** Se reemplazó por un `<button>` unificado con `user-select: none` en el botón y `pointer-events: none` en los elementos hijos.

### 2. Botón "Actualizar" no funcionaba

**Problema:** Los eventos `update-service` y `exit-service` se disparaban con `this.dispatchEvent()` dentro del Shadow DOM, y no llegaban al listener en `window`.

**Solución:** Se cambió a `window.dispatchEvent()` para garantizar que todos los eventos lleguen al Event Bus global.

### 3. Módulos ES6 no cargan con `file:///`

**Problema:** Al abrir `index.html` directamente, los `<script type="module">` fallan por restricciones CORS.

**Solución:** Se requiere un servidor HTTP local (`python -m http.server 8080`).

### 4. Slots y placas se sobrescribían

**Problema:** Se podía registrar un vehículo en un slot ya ocupado, sobreescribiendo el anterior.

**Solución:** Se agregó validación que consulta los servicios activos antes de registrar, verificando que el slot y la placa no estén en uso.

### 5. Responsive roto en móvil

**Problema:** El navbar se desbordaba y los slots eran muy grandes en pantallas pequeñas.

**Solución:** Se agregaron media queries en todos los CSS de los componentes con breakpoints a 768px y 420px.

### 6. Cantidad de slots inconsistente

**Problema:** La grilla y el contador de la barra mostraban 50 slots, mientras el formulario aceptaba solo del 1 al 20.

**Solución:** Se creó `js/config.js` con la constante `TOTAL_SLOTS = 20`, usada por la grilla, la barra de navegación y el formulario.

### 7. Listeners acumulados en `window`

**Problema:** `SlotsGrid` y `AppNav` registraban un listener de `storage-update` en cada conexión y nunca lo quitaban, de modo que cada cambio de vista dejaba renders huérfanos.

**Solución:** Se guarda el handler y se elimina en `disconnectedCallback`.

### 8. Mensaje incorrecto al duplicar una placa

**Problema:** Registrar una placa ya existente mostraba "El Slot X ya está ocupado", aunque el slot elegido estaba libre.

**Solución:** Se agregó el mensaje `form_error_plate_duplicate` (ES/EN) para ese caso.

### 9. Resaltado de filas bloqueado por la politica de seguridad

**Problema:** La tabla de reportes usaba `onmouseover` y `onmouseout` en linea, que la politica CSP del servidor (`script-src 'self'`) bloquea.

**Solucion:** Se reemplazo por la clase `.report-row` con `:hover` en `css/reports.css`.

### 10. HTML sin escapar en las plantillas

**Problema:** Placa, tipo, nombre y correo se insertaban en `innerHTML` sin escapar, de modo que un valor como `<img onerror=...>` en `localStorage` se interpretaba como HTML.

**Solucion:** Se creo `escapeHTML()` en `js/utils.js` y se aplica en la barra, la grilla, los reportes, el perfil y el login.

### 11. Contrasena guardada en el navegador

**Problema:** "Recordar credenciales" guardaba el correo y la contrasena en texto plano en `cp_saved_pass`.

**Solucion:** Ahora solo se recuerda el correo. La clave antigua se elimina automaticamente.

### 12. Datos corruptos rompian la aplicacion

**Problema:** Un JSON invalido en `cp_services` o `cp_user` lanzaba una excepcion al cargar y la aplicacion no arrancaba.

**Solucion:** `readJSON` captura el error y devuelve un valor por defecto. Las lecturas pasan por `store.getServices()` y `getUser()`, y el usuario administrador se recrea si falta.

### 13. La barra no reflejaba el nombre nuevo al guardar el perfil

**Problema:** Tras guardar el perfil, la barra seguia mostrando el nombre anterior hasta recargar.

**Solucion:** El perfil guarda con `store.saveUser()`, que notifica a los suscriptores, y la barra se actualiza.

### 14. Tarifas escritas a mano y valor inventado

**Problema:** Las tarifas estaban duplicadas en `EntryForm`, una para mostrar el total y otra al dar salida, con un valor por defecto de 10 para cualquier tipo desconocido. `cp_types` existía pero nadie la leía.

**Solucion:** `js/billing.js` calcula el cobro con las tarifas de `cp_types`. Si un tipo no tiene tarifa válida, el formulario lo avisa y bloquea la salida.

### 15. Datos y eventos repartidos por todos los componentes

**Problema:** Cada componente leía `localStorage` por su cuenta, y los cambios viajaban por eventos globales (`add-service`, `update-service`, `exit-service` y `storage-update`) que `app.js` procesaba y luego volvía a dibujar todo.

**Solucion:** `js/store.js` centraliza lecturas y escrituras y notifica a los componentes suscritos. `app.js` ya no gestiona datos, solo navegación y sesión.

### 16. Reglas de placa atadas al componente

**Problema:** El prefijo, el saneamiento y la validación de la placa vivían dentro de `EntryForm`, mezclados con el DOM, y no se podían probar.

**Solucion:** Se extrajeron a funciones puras en `js/plate.js`, con pruebas automáticas. El formulario solo las invoca.

---

## Formato de Placas

El formato de placa es: **`PREFIJO-000XXX`**

| Tipo de Vehículo | Prefijo | Ejemplo |
|:-----------------|:-------:|:--------|
| Automóvil | **P** | P-123ABC |
| Moto | **M** | M-456DEF |
| Camioneta | **C** | C-789GHI |
| Bicicleta | **B** | B-012JKL |
| Scooter | **S** | S-345MNO |

- El prefijo se **asigna automáticamente** según el tipo de vehículo seleccionado
- Solo se permiten **3 dígitos** (0-9) y **3 letras** (A-Z)
- No se permiten caracteres especiales (@, #, $, etc.)

---

## Tarifas por Vehículo

| Tipo | Tarifa por Hora (Q) |
|------|:-------------------:|
| Automóvil | Q15.00 |
| Camioneta | Q20.00 |
| Moto | Q5.00 |
| Scooter | Q3.00 |
| Bicicleta | Q2.00 |

El cobro se calcula como: **`ceil(horas_de_permanencia) × tarifa`** (mínimo 1 hora). Las tarifas se leen de `cp_types` en `localStorage`.

---

## Responsive Design

| Breakpoint | Adaptaciones |
|:----------:|:-------------|
| > 1024px | Layout de 2 columnas (grilla + formulario) |
| 768px - 1024px | Layout de 1 columna, navbar compacto |
| 420px - 768px | Slots más pequeños, botones reducidos |
| < 420px | Nombre de usuario oculto, stats minimizadas |

---

## Licencia

Este proyecto fue desarrollado como parte del programa académico de SlotSpot MJ.

---

*Desarrollado por María José Montepeque Zet*
