import { translations, getLang } from '../i18n.js';

export class IncomeReports extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
    }

    render() {
        const t = translations[getLang()] || translations['es'];
        const services = JSON.parse(localStorage.getItem('cp_services')) || [];
        const pagos = services.filter((s) => s.estado === 'finalizado');

        const totalGlobal = pagos
            .reduce((acc, s) => acc + parseFloat(s.total || s.costo || 0), 0)
            .toFixed(2);

        const typeLabels = {
            Automóvil: t.type_automovil,
            Moto: t.type_moto,
            Camioneta: t.type_camioneta,
            Bicicleta: t.type_bicicleta,
            Scooter: t.type_scooter,
        };
        const tipos = ['Automóvil', 'Moto', 'Camioneta', 'Bicicleta', 'Scooter'];
        const stats = tipos.map((tipo) => {
            const suma = pagos
                .filter((s) => s.tipo === tipo)
                .reduce((acc, s) => acc + parseFloat(s.total || s.costo || 0), 0)
                .toFixed(2);
            return { tipo, label: typeLabels[tipo], suma };
        });

        const translateTipo = (tipo) =>
            ({
                Automóvil: t.type_automovil,
                Moto: t.type_moto,
                Camioneta: t.type_camioneta,
                Bicicleta: t.type_bicicleta,
                Scooter: t.type_scooter,
            })[tipo] || tipo;

        // Función para formatear hora
        const locale = getLang() === 'en' ? 'en-US' : 'es-GT';

        const formatTime = (iso) => {
            if (!iso) return '--:--';
            const d = new Date(iso);
            return d.toLocaleTimeString(locale, {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
            });
        };

        const formatDate = (iso) => {
            if (!iso) return '--/--/--';
            const d = new Date(iso);
            return d.toLocaleDateString(locale, {
                day: '2-digit',
                month: '2-digit',
                year: '2-digit',
            });
        };

        // Calcular duración entre entrada y salida
        const calcDuration = (entrada, salida) => {
            if (!entrada || !salida) return '--';
            const diff = new Date(salida) - new Date(entrada);
            const mins = Math.floor(diff / 60000);
            const hrs = Math.floor(mins / 60);
            const remainMins = mins % 60;
            if (hrs > 0) return `${hrs}h ${remainMins}m`;
            return `${remainMins}m`;
        };

        this.shadowRoot.innerHTML = `
            <link rel="stylesheet" href="css/style.css">
            <link rel="stylesheet" href="css/reports.css">
            <div class="glass-panel" style="margin-top: 10px;">
                <h2 style="color: #deff9a; margin-bottom: 20px;">${t.reports_title}</h2>
                
                <div class="reports-container">
                    <div class="report-card total-general">
                        <h3>${t.report_total_accumulated}</h3>
                        <div class="amount">Q${totalGlobal}</div>
                    </div>
                    ${stats
                        .map(
                            (s) => `
                        <div class="report-card">
                            <h3>${s.label}</h3>
                            <div class="amount">Q${s.suma}</div>
                        </div>
                    `,
                        )
                        .join('')}
                </div>

                <div style="margin-top: 40px;">
                    <h3 style="color: #b0a0ca; font-size: 0.8rem; letter-spacing: 1px; margin-bottom: 15px;">${t.report_history_title}</h3>
                    <div style="overflow-x: auto;">
                        <table style="width: 100%; border-collapse: collapse; color: white; font-family: 'Inter', sans-serif;">
                            <thead>
                                <tr style="border-bottom: 1px solid #9d4edd; color: #deff9a; font-size: 0.7rem;">
                                    <th style="padding: 12px 8px; text-align: left;">${t.report_plate}</th>
                                    <th style="padding: 12px 8px; text-align: left;">${t.report_vehicle}</th>
                                    <th style="padding: 12px 8px; text-align: center;">${t.report_date}</th>
                                    <th style="padding: 12px 8px; text-align: center;">${t.report_entry}</th>
                                    <th style="padding: 12px 8px; text-align: center;">${t.report_exit}</th>
                                    <th style="padding: 12px 8px; text-align: center;">${t.report_duration}</th>
                                    <th style="padding: 12px 8px; text-align: right;">${t.report_total}</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${
                                    pagos.length === 0
                                        ? `<tr><td colspan="7" style="text-align:center; padding:30px; opacity:0.5;">${t.report_no_transactions}</td></tr>`
                                        : pagos
                                              .map(
                                                  (p) => `
                                    <tr class="report-row">
                                        <td style="padding: 12px 8px; font-weight: bold;">${p.placa}</td>
                                        <td style="padding: 12px 8px;">${translateTipo(p.tipo)}</td>
                                        <td style="padding: 12px 8px; text-align: center; font-size: 0.8rem;">${formatDate(p.entrada)}</td>
                                        <td style="padding: 12px 8px; text-align: center; color: #4ade80; font-size: 0.8rem;">${formatTime(p.entrada)}</td>
                                        <td style="padding: 12px 8px; text-align: center; color: #f87171; font-size: 0.8rem;">${formatTime(p.salida)}</td>
                                        <td style="padding: 12px 8px; text-align: center; color: #b0a0ca; font-size: 0.8rem;">${calcDuration(p.entrada, p.salida)}</td>
                                        <td style="padding: 12px 8px; text-align: right; color: #deff9a; font-weight: 800;">Q${parseFloat(p.total || p.costo).toFixed(2)}</td>
                                    </tr>
                                `,
                                              )
                                              .join('')
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }
}
if (!customElements.get('income-reports')) {
    customElements.define('income-reports', IncomeReports);
}
