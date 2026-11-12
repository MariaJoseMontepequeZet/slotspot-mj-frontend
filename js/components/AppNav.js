import { translations, getLang } from '../i18n.js';
import { TOTAL_SLOTS } from '../config.js';

export class AppNav extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
        window.addEventListener('storage-update', this.onUpdate);
    }

    disconnectedCallback() {
        window.removeEventListener('storage-update', this.onUpdate);
    }

    onUpdate = () => this.render();

    render() {
        const t = translations[getLang()] || translations['es'];
        const services = JSON.parse(localStorage.getItem('cp_services')) || [];
        const user = JSON.parse(localStorage.getItem('cp_user') || '{}');

        // FILTRO DE SEGURIDAD:
        // 1. Que el estado sea 'activo'.
        // 2. Que tenga un slot asignado (que no sea null o undefined).
        const activos = services.filter(
            (s) => s.estado === 'activo' && s.slot !== null && s.slot !== undefined,
        );

        // Función de conteo exacta
        const getCount = (tipo) => {
            return activos.filter((s) => s.tipo && s.tipo.trim() === tipo).length;
        };

        this.shadowRoot.innerHTML = `
            <link rel="stylesheet" href="css/app-nav.css">
            <nav class="navbar">
                <div class="brand">
                    <span class="logo-text">SLOTSPOT<span>MJ</span></span>
                </div>
                
                <div class="stats-container">
                    <div class="stat-item">
                        <span class="stat-value">${getCount('Automóvil')}</span>
                        <span class="stat-label">${t.nav_cars}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${getCount('Camioneta')}</span>
                        <span class="stat-label">${t.nav_trucks}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${getCount('Moto')}</span>
                        <span class="stat-label">${t.nav_motos}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${getCount('Bicicleta')}</span>
                        <span class="stat-label">${t.nav_bikes}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${getCount('Scooter')}</span>
                        <span class="stat-label">${t.nav_scooters}</span>
                    </div>
                </div>

                <div class="stats-container counter-box">
                    <div class="stat-item">
                        <span class="stat-value" style="color: #4ade80;">${TOTAL_SLOTS - activos.length}</span>
                        <span class="stat-label">${t.nav_empty}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value" style="color: #f87171;">${activos.length}</span>
                        <span class="stat-label">${t.nav_occupied}</span>
                    </div>
                </div>

                <div class="nav-right">
                    <div class="nav-actions">
                        <button id="btnHome" class="btn-nav">${t.nav_home}</button>
                        <button id="btnReports" class="btn-nav">${t.nav_reports}</button>
                    </div>
                    
                    <button id="btnProfile" class="user-profile-btn">
                        <span class="user-name">${user.nombre || t.profile_default_name}</span>
                        <div class="avatar"></div>
                    </button>
                </div>
            </nav>
        `;

        const displayName = user.nombre || t.profile_default_name;
        this.shadowRoot.querySelector('.avatar').textContent = displayName.charAt(0).toUpperCase();

        this.setupListeners();
    }

    setupListeners() {
        this.shadowRoot.getElementById('btnHome').onclick = () => {
            window.dispatchEvent(
                new CustomEvent('show-dashboard', { bubbles: true, composed: true }),
            );
        };

        this.shadowRoot.getElementById('btnReports').onclick = () => {
            window.dispatchEvent(
                new CustomEvent('open-reports', { bubbles: true, composed: true }),
            );
        };

        this.shadowRoot.getElementById('btnProfile').onclick = () => {
            window.dispatchEvent(
                new CustomEvent('open-profile', { bubbles: true, composed: true }),
            );
        };
    }
}

if (!customElements.get('app-nav')) {
    customElements.define('app-nav', AppNav);
}
