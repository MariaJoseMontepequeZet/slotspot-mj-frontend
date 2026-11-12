import { translations, getLang, setLang } from '../i18n.js';

export class UserProfile extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
    }

    showMsg(id, msg, isError = false) {
        const el = this.shadowRoot.getElementById(id);
        if (el) {
            el.textContent = msg;
            el.className = isError ? 'msg msg-error' : 'msg msg-success';
            el.style.display = 'block';
            setTimeout(() => {
                el.style.display = 'none';
            }, 3000);
        }
    }

    render() {
        const t = translations[getLang()] || translations['es'];
        const user = JSON.parse(localStorage.getItem('cp_user') || '{}');

        this.shadowRoot.innerHTML = `
            <link rel="stylesheet" href="css/profile.css">
            <div class="profile-overlay" id="profileOverlay">
                <div class="profile-modal">
                    <button class="close-btn" id="closeBtn" aria-label="${t.profile_close}">&times;</button>
                    
                    <!-- Header del perfil -->
                    <div class="profile-header">
                        <div class="profile-avatar-big"></div>
                        <h2 id="displayName">${user.nombre || t.profile_default_name}</h2>
                        <p class="profile-email" id="displayEmail">${user.email || 'admin@slotspotmj.com'}</p>
                    </div>

                    <div id="profileMsg" class="msg" style="display:none;"></div>

                    <!-- Formulario de edición -->
                    <div class="settings-section">
                        <h3>${t.profile_personal_data}</h3>
                        
                        <label>${t.profile_name}</label>
                        <input type="text" id="inputName" value="${user.nombre || ''}" placeholder="${t.profile_placeholder_name}">
                        
                        <label>${t.profile_email}</label>
                        <input type="email" id="inputEmail" value="${user.email || ''}" placeholder="${t.profile_placeholder_email}">
                    </div>

                    <div class="settings-section">
                        <h3>${t.profile_change_password}</h3>
                        
                        <label>${t.profile_current_password}</label>
                        <input type="password" id="inputCurrentPass" placeholder="${t.profile_placeholder_current_password}">
                        
                        <label>${t.profile_new_password}</label>
                        <input type="password" id="inputNewPass" placeholder="${t.profile_placeholder_new_password}">
                    </div>

                    <div class="settings-section">
                        <h3>${t.profile_lang}</h3>
                        <select id="langSelect">
                            <option value="es" ${getLang() === 'es' ? 'selected' : ''}>${t.profile_language_option_es}</option>
                            <option value="en" ${getLang() === 'en' ? 'selected' : ''}>${t.profile_language_option_en}</option>
                        </select>
                    </div>

                    <button id="saveBtn" class="save-btn">${t.profile_save}</button>
                    <button id="logoutBtn" class="logout-btn">${t.profile_logout}</button>
                </div>
            </div>
        `;

        const displayName = user.nombre || t.profile_default_name;
        this.shadowRoot.querySelector('.profile-avatar-big').textContent = displayName
            .charAt(0)
            .toUpperCase();

        this.setupEvents();
    }

    setupEvents() {
        const t = translations[getLang()] || translations['es'];
        const user = JSON.parse(localStorage.getItem('cp_user') || '{}');

        // Cerrar modal
        this.shadowRoot.getElementById('closeBtn').onclick = () => {
            window.dispatchEvent(new CustomEvent('show-dashboard'));
        };

        // Clic fuera del modal para cerrar
        this.shadowRoot.getElementById('profileOverlay').onclick = (e) => {
            if (e.target.id === 'profileOverlay') {
                window.dispatchEvent(new CustomEvent('show-dashboard'));
            }
        };

        // Guardar cambios
        this.shadowRoot.getElementById('saveBtn').onclick = () => {
            const newName = this.shadowRoot.getElementById('inputName').value.trim();
            const newEmail = this.shadowRoot.getElementById('inputEmail').value.trim();
            const currentPass = this.shadowRoot.getElementById('inputCurrentPass').value;
            const newPass = this.shadowRoot.getElementById('inputNewPass').value;
            const newLang = this.shadowRoot.getElementById('langSelect').value;

            // Validaciones
            if (!newName) return this.showMsg('profileMsg', t.profile_invalid_name, true);
            if (!newEmail) return this.showMsg('profileMsg', t.profile_invalid_email, true);
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
                return this.showMsg('profileMsg', t.profile_invalid_email_format, true);
            }

            // Actualizar datos del usuario
            const updatedUser = { ...user };
            updatedUser.nombre = newName;
            updatedUser.email = newEmail;

            // Cambiar contraseña solo si se llenaron ambos campos
            if (currentPass || newPass) {
                if (!currentPass)
                    return this.showMsg('profileMsg', t.profile_enter_current_password, true);
                if (currentPass !== user.password)
                    return this.showMsg('profileMsg', t.profile_invalid_current_password, true);
                if (!newPass) return this.showMsg('profileMsg', t.profile_enter_new_password, true);
                if (newPass.length < 4)
                    return this.showMsg('profileMsg', t.profile_invalid_new_password, true);
                updatedUser.password = newPass;
            }

            // Guardar en localStorage
            localStorage.setItem('cp_user', JSON.stringify(updatedUser));

            // Actualizar credenciales guardadas si "recordar" estaba activo
            if (localStorage.getItem('cp_saved_email')) {
                localStorage.setItem('cp_saved_email', updatedUser.email);
                if (updatedUser.password !== user.password) {
                    localStorage.setItem('cp_saved_pass', updatedUser.password);
                }
            }

            // Actualizar display
            this.shadowRoot.getElementById('displayName').textContent = newName;
            this.shadowRoot.getElementById('displayEmail').textContent = newEmail;
            this.shadowRoot.getElementById('inputCurrentPass').value = '';
            this.shadowRoot.getElementById('inputNewPass').value = '';

            this.showMsg('profileMsg', t.profile_saved_success);

            // Cambiar idioma si cambió
            if (newLang !== getLang()) {
                setTimeout(() => setLang(newLang), 1000);
            }
        };

        // Logout
        this.shadowRoot.getElementById('logoutBtn').onclick = () => {
            window.dispatchEvent(new CustomEvent('logout'));
        };
    }
}

if (!customElements.get('user-profile')) {
    customElements.define('user-profile', UserProfile);
}
