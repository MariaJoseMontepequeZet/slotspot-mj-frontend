import { translations, getLang } from '../i18n.js';

export class LoginPage extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
    }

    render() {
        const t = translations[getLang()] || translations['es'];
        const savedEmail = localStorage.getItem('cp_saved_email') || '';
        const savedPass = localStorage.getItem('cp_saved_pass') || '';
        const rememberChecked = savedEmail ? 'checked' : '';

        this.shadowRoot.innerHTML = `
            <link rel="stylesheet" href="css/login.css">
            <div class="login-overlay">
                <div class="login-card">
                    <div class="login-header">
                        <div class="login-logo">P</div>
                        <h1>SLOTSPOT<span>MJ</span></h1>
                        <p class="login-subtitle">${t.login_subtitle}</p>
                    </div>

                    <div id="errorMsg" class="login-error" style="display:none;"></div>

                    <form id="loginForm">
                        <label>${t.login_email}</label>
                        <input type="email" id="email" placeholder="${t.login_placeholder_email}" 
                               value="${savedEmail}" autocomplete="email" required>

                        <label>${t.login_password}</label>
                        <div class="password-group">
                            <input type="password" id="password" placeholder="${t.login_placeholder_password}" 
                                   value="${savedPass}" autocomplete="current-password" required>
                            <button type="button" id="togglePass" class="toggle-pass">${t.login_password_show}</button>
                        </div>

                        <div class="remember-row">
                            <label class="checkbox-label">
                                <input type="checkbox" id="remember" ${rememberChecked}>
                                <span>${t.login_remember}</span>
                            </label>
                        </div>

                        <button type="submit" id="loginBtn" class="login-btn">${t.login_button}</button>
                    </form>
                </div>
            </div>
        `;

        this.setupEvents(t);
    }

    setupEvents(t) {
        const form = this.shadowRoot.getElementById('loginForm');
        const emailInput = this.shadowRoot.getElementById('email');
        const passInput = this.shadowRoot.getElementById('password');
        const rememberCheck = this.shadowRoot.getElementById('remember');
        const toggleBtn = this.shadowRoot.getElementById('togglePass');

        toggleBtn.onclick = () => {
            if (passInput.type === 'password') {
                passInput.type = 'text';
                toggleBtn.textContent = t.login_password_hide;
            } else {
                passInput.type = 'password';
                toggleBtn.textContent = t.login_password_show;
            }
        };

        form.onsubmit = (e) => {
            e.preventDefault();

            const email = emailInput.value.trim();
            const password = passInput.value;

            if (!email) return this.showError(t.login_error_no_email);
            if (!password) return this.showError(t.login_error_no_password);

            const user = JSON.parse(localStorage.getItem('cp_user') || '{}');

            if (email === user.email && password === user.password) {
                if (rememberCheck.checked) {
                    localStorage.setItem('cp_saved_email', email);
                    localStorage.setItem('cp_saved_pass', password);
                } else {
                    localStorage.removeItem('cp_saved_email');
                    localStorage.removeItem('cp_saved_pass');
                }

                sessionStorage.setItem('cp_logged_in', 'true');
                window.dispatchEvent(new CustomEvent('login-success'));
            } else {
                this.showError(t.login_error_credentials);
                passInput.value = '';
                passInput.focus();
            }
        };
    }

    showError(msg) {
        const errorMsg = this.shadowRoot.getElementById('errorMsg');
        errorMsg.textContent = msg;
        errorMsg.style.display = 'block';
        errorMsg.style.animation = 'none';
        errorMsg.offsetHeight;
        errorMsg.style.animation = 'shakeLogin 0.4s ease';
        setTimeout(() => {
            errorMsg.style.display = 'none';
        }, 5000);
    }
}

if (!customElements.get('login-page')) {
    customElements.define('login-page', LoginPage);
}
