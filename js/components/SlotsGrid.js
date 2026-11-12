import { translations, getLang } from '../i18n.js';
import { TOTAL_SLOTS } from '../config.js';

export class SlotsGrid extends HTMLElement {
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
        const services = JSON.parse(localStorage.getItem('cp_services') || '[]');
        const activos = services.filter((s) => s.estado === 'activo');

        const typeLabels = {
            Automóvil: t.type_automovil,
            Moto: t.type_moto,
            Camioneta: t.type_camioneta,
            Bicicleta: t.type_bicicleta,
            Scooter: t.type_scooter,
        };

        let html = '';
        for (let i = 1; i <= TOTAL_SLOTS; i++) {
            const s = activos.find((item) => parseInt(item.slot) === i);
            const typeLabel = s ? typeLabels[s.tipo] || s.tipo : '';

            html += `
                <div class="slot ${s ? 'occupied' : 'free'}" data-slot="${i}">
                    <span class="num">${i}</span>
                    <div class="type">${typeLabel}</div>
                    <span class="plate">${s ? s.placa : t.slot_free}</span>
                </div>`;
        }

        this.shadowRoot.innerHTML = `
            <link rel="stylesheet" href="css/slots-grid.css">
            <div class="grid">
                ${html}
            </div>`;

        // Evento para editar/dar salida
        this.shadowRoot.querySelectorAll('.occupied').forEach((el) => {
            el.onclick = () => {
                const slotNum = parseInt(el.dataset.slot);
                const s = activos.find((item) => parseInt(item.slot) === slotNum);
                const form = document.querySelector('entry-form');
                if (form) form.editMode = s;
            };
        });
    }
}

if (!customElements.get('slots-grid')) {
    customElements.define('slots-grid', SlotsGrid);
}
