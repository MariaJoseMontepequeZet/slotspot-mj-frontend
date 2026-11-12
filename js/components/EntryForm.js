import { translations, getLang } from '../i18n.js';
import { TOTAL_SLOTS } from '../config.js';

export class EntryForm extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._mode = 'insert';
    }

    set editMode(s) {
        this._mode = 'edit';
        this._selected = s;
        this.render();
    }

    connectedCallback() {
        this.render();
    }

    // Mapeo de prefijo según tipo de vehículo
    getPrefix(tipo) {
        const prefixes = {
            Automóvil: 'P',
            Moto: 'M',
            Camioneta: 'C',
            Bicicleta: 'B',
            Scooter: 'S',
        };
        return prefixes[tipo] || 'P';
    }

    // Parsear placa existente para extraer números y letras
    parsePlaca(placa) {
        if (!placa) return { nums: '', letters: '' };
        const clean = placa.replace(/^[PMCBS]-?/, '');
        const nums = clean.replace(/[^0-9]/g, '').substring(0, 3);
        const letters = clean.replace(/[^A-Z]/g, '').substring(0, 3);
        return { nums, letters };
    }

    // Mostrar mensaje de error inline
    showError(msg) {
        const errorBox = this.shadowRoot.getElementById('errorMsg');
        if (errorBox) {
            errorBox.textContent = msg;
            errorBox.style.display = 'block';
            setTimeout(() => {
                errorBox.style.display = 'none';
            }, 4000);
        }
    }

    render() {
        const t = translations[getLang()] || translations['es'];
        const isEdit = this._mode === 'edit';
        let billHTML = '';
        const currentTipo = isEdit ? this._selected.tipo : 'Automóvil';
        const prefix = this.getPrefix(currentTipo);

        let parsedNums = '';
        let parsedLetters = '';
        if (isEdit) {
            const parsed = this.parsePlaca(this._selected.placa);
            parsedNums = parsed.nums;
            parsedLetters = parsed.letters;

            const entrada = new Date(this._selected.entrada);
            const ahora = new Date();
            const hours = Math.max(1, Math.ceil((ahora - entrada) / (1000 * 60 * 60)));
            const rates = { Automóvil: 15, Moto: 5, Camioneta: 20, Bicicleta: 2, Scooter: 3 };
            const rate = rates[this._selected.tipo] || 10;
            const total = (hours * rate).toFixed(2);

            billHTML = `
                <div class="price-tag">
                    ${t.edit_total_charge} Q${total} (${hours}h)
                </div>`;
        }

        this.shadowRoot.innerHTML = `
            <link rel="stylesheet" href="css/entry-form.css">
            <div class="form-container">
                <h3>${isEdit ? t.edit_title : t.form_title}</h3>

                <!-- Mensaje de error inline -->
                <div id="errorMsg" class="error-msg" style="display:none;"></div>
                
                <label>${t.form_type}</label>
                <select id="tipo">
                    <option value="Automóvil" ${currentTipo === 'Automóvil' ? 'selected' : ''}>${t.type_automovil}</option>
                    <option value="Moto" ${currentTipo === 'Moto' ? 'selected' : ''}>${t.type_moto}</option>
                    <option value="Camioneta" ${currentTipo === 'Camioneta' ? 'selected' : ''}>${t.type_camioneta}</option>
                    <option value="Bicicleta" ${currentTipo === 'Bicicleta' ? 'selected' : ''}>${t.type_bicicleta}</option>
                    <option value="Scooter" ${currentTipo === 'Scooter' ? 'selected' : ''}>${t.type_scooter}</option>
                </select>

                <label>${t.form_plate}</label>
                <div class="placa-group">
                    <span class="placa-prefix" id="prefixLabel">${prefix}</span>
                    <span class="placa-sep">-</span>
                    <input type="text" id="placaNums" placeholder="123" maxlength="3" 
                           value="${parsedNums}" class="placa-input placa-nums"
                           inputmode="numeric">
                    <input type="text" id="placaLetters" placeholder="ABC" maxlength="3" 
                           value="${parsedLetters}" class="placa-input placa-letters">
                </div>
                <span class="hint">${t.form_hint}</span>

                ${!isEdit ? `<label>${t.form_slot}</label><input type="number" id="slot" min="1" max="${TOTAL_SLOTS}">` : ''}
                
                ${billHTML}

                <button id="mainBtn">${isEdit ? t.btn_update : t.form_btn}</button>
                
                ${
                    isEdit
                        ? `
                    <button id="exitBtn" style="background:#ff4d4d; color:white; border:none; padding:10px; border-radius:8px; width:100%; margin-top:10px; cursor:pointer; font-weight:bold;">
                        ${t.btn_exit}
                    </button>
                    <button id="cancelBtn" style="background:transparent; color:#b0a0ca; border:none; width:100%; margin-top:5px; cursor:pointer;">
                        ${t.btn_cancel}
                    </button>`
                        : ''
                }
            </div>`;

        this.setupEvents(isEdit);
    }

    setupEvents(isEdit) {
        const t = translations[getLang()] || translations['es'];
        const tipoSelect = this.shadowRoot.getElementById('tipo');
        const prefixLabel = this.shadowRoot.getElementById('prefixLabel');
        const numsInput = this.shadowRoot.getElementById('placaNums');
        const lettersInput = this.shadowRoot.getElementById('placaLetters');

        // Cambiar prefijo cuando cambia el tipo de vehículo
        tipoSelect.onchange = () => {
            prefixLabel.textContent = this.getPrefix(tipoSelect.value);
        };

        // Validar: solo números (sin caracteres especiales)
        numsInput.oninput = () => {
            numsInput.value = numsInput.value.replace(/[^0-9]/g, '').substring(0, 3);
            if (numsInput.value.length === 3) lettersInput.focus();
        };

        // Validar: solo letras (sin caracteres especiales)
        lettersInput.oninput = () => {
            lettersInput.value = lettersInput.value
                .replace(/[^A-Za-z]/g, '')
                .toUpperCase()
                .substring(0, 3);
        };

        // Bloquear pegar caracteres especiales
        numsInput.onpaste = (e) => {
            const text = (e.clipboardData || window.clipboardData).getData('text');
            if (/[^0-9]/.test(text)) {
                e.preventDefault();
                this.showError(t.form_error_numbers);
            }
        };
        lettersInput.onpaste = (e) => {
            const text = (e.clipboardData || window.clipboardData).getData('text');
            if (/[^A-Za-z]/.test(text)) {
                e.preventDefault();
                this.showError(t.form_error_letters);
            }
        };

        // Botón principal (registrar / actualizar)
        this.shadowRoot.getElementById('mainBtn').onclick = () => {
            const tipo = tipoSelect.value;
            const nums = numsInput.value;
            const letters = lettersInput.value.toUpperCase();

            // Validaciones con mensajes de error inline
            if (nums.length === 0 && letters.length === 0) {
                return this.showError(t.form_error_incomplete);
            }
            if (nums.length !== 3 || !/^\d{3}$/.test(nums)) {
                return this.showError(t.form_error_numbers);
            }
            if (letters.length !== 3 || !/^[A-Z]{3}$/.test(letters)) {
                return this.showError(t.form_error_letters);
            }

            const prefix = this.getPrefix(tipo);
            const placa = `${prefix}-${nums}${letters}`;

            // Obtener servicios activos para validar duplicados
            const services = JSON.parse(localStorage.getItem('cp_services') || '[]');
            const activos = services.filter((s) => s.estado === 'activo');

            if (isEdit) {
                // Al actualizar, verificar que la nueva placa no esté en uso por OTRO vehículo
                const placaDuplicada = activos.find(
                    (s) => s.placa === placa && s.id !== this._selected.id,
                );
                if (placaDuplicada) {
                    return this.showError(
                        t.form_error_plate_duplicate
                            .replace('{slot}', placaDuplicada.slot)
                            .replace('{placa}', placa),
                    );
                }

                window.dispatchEvent(
                    new CustomEvent('update-service', {
                        detail: { ...this._selected, placa, tipo },
                    }),
                );
            } else {
                const slot = parseInt(this.shadowRoot.getElementById('slot').value);

                if (!slot || slot < 1 || slot > TOTAL_SLOTS) {
                    return this.showError(t.form_error_slot_invalid.replace('{max}', TOTAL_SLOTS));
                }

                // Verificar si el slot ya está ocupado
                const slotOcupado = activos.find((s) => parseInt(s.slot) === slot);
                if (slotOcupado) {
                    return this.showError(
                        t.form_error_slot_occupied
                            .replace('{slot}', slot)
                            .replace('{placa}', slotOcupado.placa),
                    );
                }

                // Verificar si la placa ya existe activa
                const placaExiste = activos.find((s) => s.placa === placa);
                if (placaExiste) {
                    return this.showError(
                        t.form_error_plate_duplicate
                            .replace('{slot}', placaExiste.slot)
                            .replace('{placa}', placa),
                    );
                }

                window.dispatchEvent(
                    new CustomEvent('add-service', {
                        detail: {
                            placa,
                            tipo,
                            slot,
                            id: Date.now(),
                            estado: 'activo',
                            entrada: new Date().toISOString(),
                        },
                    }),
                );
            }
            this.clear();
        };

        // Botón cancelar
        const cancelBtn = this.shadowRoot.getElementById('cancelBtn');
        if (cancelBtn) cancelBtn.onclick = () => this.clear();

        // Botón dar salida
        const exitBtn = this.shadowRoot.getElementById('exitBtn');
        if (exitBtn)
            exitBtn.onclick = () => {
                const rates = { Automóvil: 15, Moto: 5, Camioneta: 20, Bicicleta: 2, Scooter: 3 };
                const rate = rates[this._selected.tipo] || 10;
                const hours = Math.max(
                    1,
                    Math.ceil((new Date() - new Date(this._selected.entrada)) / (1000 * 60 * 60)),
                );

                window.dispatchEvent(
                    new CustomEvent('exit-service', {
                        detail: {
                            ...this._selected,
                            estado: 'finalizado',
                            total: (hours * rate).toFixed(2),
                            salida: new Date().toISOString(),
                            slot: null,
                        },
                    }),
                );
                this.clear();
            };
    }

    clear() {
        this._mode = 'insert';
        this._selected = null;
        this.render();
    }
}

if (!customElements.get('entry-form')) {
    customElements.define('entry-form', EntryForm);
}
