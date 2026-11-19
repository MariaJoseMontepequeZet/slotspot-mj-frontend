import { sesion } from './almacen.js';
import { entrarDemo, restablecerDemo } from './demo.js';
import { store } from './store.js';
import { translations, getLang } from './i18n.js';
import { demoPedidaPorUrl, desactivarDemo, esDemo } from './modo.js';
import './components/AppNav.js';
import './components/EntryForm.js';
import './components/SlotsGrid.js';
import './components/IncomeReports.js';
import './components/UserProfile.js';
import './components/LoginPage.js';

document.addEventListener('DOMContentLoaded', () => {
    store.init();

    const t = translations[getLang()] || translations['es'];
    document.documentElement.lang = getLang();
    document.title = t.app_title;

    const appContainer = document.querySelector('.app-container');
    const mainContent = document.getElementById('main-content');

    // ===== VERIFICAR SESIÓN =====
    const isLoggedIn = () => sesion.getItem('cp_logged_in') === 'true';

    const aviso = document.getElementById('avisoDemo');
    const actualizarAvisoDemo = () => {
        const textos = translations[getLang()] || translations['es'];
        aviso.hidden = !esDemo();
        if (!esDemo()) return;
        aviso.querySelector('[data-aviso-titulo]').textContent = textos.demo_banner_title;
        aviso.querySelector('[data-aviso-texto]').textContent = textos.demo_banner_text;
        aviso.querySelector('[data-aviso-reiniciar]').textContent = textos.demo_reset_button;
    };

    const showLogin = () => {
        // Ocultar la app y mostrar login
        appContainer.style.display = 'none';
        // Remover login anterior si existe
        const oldLogin = document.querySelector('login-page');
        if (oldLogin) oldLogin.remove();
        // Crear login
        const login = document.createElement('login-page');
        document.body.appendChild(login);
    };

    const showApp = () => {
        // Remover login si existe
        const loginEl = document.querySelector('login-page');
        if (loginEl) loginEl.remove();
        // Mostrar la app
        appContainer.style.display = 'block';
        actualizarAvisoDemo();
        renderDashboard();
    };

    // ===== VISTAS =====
    const renderDashboard = () => {
        const t = translations[getLang()] || translations['es'];
        mainContent.innerHTML = '';
        mainContent.className = 'main-layout';
        mainContent.style.display = 'grid';

        const section = document.createElement('section');
        section.className = 'glass-panel';
        section.innerHTML = `<h2>${t.dashboard_title}</h2>`;
        section.appendChild(document.createElement('slots-grid'));

        const aside = document.createElement('aside');
        aside.className = 'glass-panel';
        aside.appendChild(document.createElement('entry-form'));

        mainContent.appendChild(section);
        mainContent.appendChild(aside);
    };

    const renderReports = () => {
        mainContent.innerHTML = '';
        mainContent.className = 'reports-view';
        mainContent.style.display = 'block';
        mainContent.appendChild(document.createElement('income-reports'));
    };

    const renderProfile = () => {
        mainContent.innerHTML = '';
        mainContent.className = 'reports-view';
        mainContent.style.display = 'block';
        mainContent.appendChild(document.createElement('user-profile'));
    };

    // ===== NAVEGACIÓN =====
    window.addEventListener('show-dashboard', renderDashboard);
    window.addEventListener('open-reports', renderReports);
    window.addEventListener('open-profile', renderProfile);

    // Login exitoso
    window.addEventListener('login-success', showApp);

    window.addEventListener('demo-login', () => {
        entrarDemo();
        showApp();
    });

    aviso.querySelector('[data-aviso-reiniciar]').onclick = () => {
        restablecerDemo();
        renderDashboard();
    };

    // Logout
    window.addEventListener('logout', () => {
        sesion.removeItem('cp_logged_in');
        desactivarDemo();
        actualizarAvisoDemo();
        showLogin();
    });

    // ===== INICIAR =====
    if (demoPedidaPorUrl() && !esDemo()) {
        entrarDemo();
        showApp();
    } else if (isLoggedIn()) {
        showApp();
    } else {
        showLogin();
    }
});
