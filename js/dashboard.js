// js/dashboard.js
import { getAllClients } from "../utils/storage.js";

/**
 * LocalStorage key para facturas
 */
const INVOICES_KEY = "invoices_fx";

/**
 * Obtiene todas las facturas del localStorage
 */
function getAllInvoices() {
    try {
        return JSON.parse(localStorage.getItem(INVOICES_KEY)) || [];
    } catch {
        return [];
    }
}

/**
 * Calcula métricas generales del sistema
 */
function calculateMetrics() {
    const clients = getAllClients();
    const invoices = getAllInvoices();

    // Total de clientes
    const totalClientes = clients.length;

    // Totales de facturas
    const totalFacturas = invoices.length;
    const facturasP = invoices.filter(inv => inv.status === "PENDIENTE").length;
    const facturasPagadas = invoices.filter(inv => inv.status === "PAGADA").length;
    const facturasCanceladas = invoices.filter(inv => inv.status === "CANCELADA").length;

    // Cálculo de montos
    let montoPendiente = 0;
    let montoCobrado = 0;

    invoices.forEach(inv => {
        const monto = parseFloat(inv.amount) || 0;
        if (inv.status === "PENDIENTE") {
            montoPendiente += monto;
        } else if (inv.status === "PAGADA") {
            montoCobrado += monto;
        }
    });

    return {
        totalClientes,
        totalFacturas,
        facturasP,
        facturasPagadas,
        facturasCanceladas,
        montoPendiente,
        montoCobrado
    };
}

/**
 * Formatea un número como moneda
 */
function formatCurrency(value) {
    return new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN'
    }).format(value);
}

/**
 * Obtiene facturas vencidas (próximas a vencer)
 * - Vencidas: dueDate < hoy
 * - Próximas: hoy <= dueDate <= hoy + 3 días
 */
function getOverdueAndUpcomingInvoices() {
    const invoices = getAllInvoices().filter(inv => inv.status === "PENDIENTE");
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdueInvoices = [];
    const upcomingInvoices = [];

    invoices.forEach(inv => {
        const dueDate = new Date(inv.dueDate);
        dueDate.setHours(0, 0, 0, 0);

        const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

        // Vencidas: daysUntilDue < 0
        if (daysUntilDue < 0) {
            overdueInvoices.push({
                ...inv,
                daysOverdue: Math.abs(daysUntilDue)
            });
        }
        // Próximas: 0 <= daysUntilDue <= 3
        else if (daysUntilDue >= 0 && daysUntilDue <= 3) {
            upcomingInvoices.push({
                ...inv,
                daysUntilDue: daysUntilDue
            });
        }
    });

    return { overdueInvoices, upcomingInvoices };
}

/**
 * Actualiza los indicadores en el dashboard
 */
function updateDashboard() {
    const metrics = calculateMetrics();

    // Total Clientes
    const clientesCard = document.querySelector('[data-metric="total-clientes"]');
    if (clientesCard) {
        clientesCard.textContent = metrics.totalClientes;
    }

    // Facturas Totales
    const facturasCard = document.querySelector('[data-metric="total-facturas"]');
    if (facturasCard) {
        facturasCard.textContent = metrics.totalFacturas;
    }

    // Monto Pendiente
    const pendienteCard = document.querySelector('[data-metric="monto-pendiente"]');
    if (pendienteCard) {
        pendienteCard.textContent = formatCurrency(metrics.montoPendiente);
    }

    // Monto Cobrado
    const cobradoCard = document.querySelector('[data-metric="monto-cobrado"]');
    if (cobradoCard) {
        cobradoCard.textContent = formatCurrency(metrics.montoCobrado);
    }

    // Actualizar alertas de vencimiento (HU008)
    updateAlertsSection();

    // Actualizar gráficos (HU009)
    updateCharts();
}

/**
 * Calcula estadísticas para los gráficos (HU009)
 */
function getChartData() {
    const invoices = getAllInvoices();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Contar facturas por estado
    const statusCounts = {
        pagadas: 0,
        pendientes: 0,
        vencidas: 0,
        canceladas: 0
    };

    invoices.forEach(inv => {
        if (inv.status === "PAGADA") {
            statusCounts.pagadas++;
        } else if (inv.status === "CANCELADA") {
            statusCounts.canceladas++;
        } else if (inv.status === "PENDIENTE") {
            const dueDate = new Date(inv.dueDate);
            dueDate.setHours(0, 0, 0, 0);
            if (dueDate < today) {
                statusCounts.vencidas++;
            } else {
                statusCounts.pendientes++;
            }
        }
    });

    // Calcular recaudación mensual (últimos 4 meses)
    const monthlyReceipts = {};
    const currentDate = new Date();
    
    // Inicializar últimos 4 meses
    for (let i = 3; i >= 0; i--) {
        const date = new Date(currentDate);
        date.setMonth(date.getMonth() - i);
        const key = date.toLocaleString('es-PE', { month: 'short' }).toUpperCase();
        monthlyReceipts[key] = 0;
    }

    // Sumar recaudación por mes
    invoices.forEach(inv => {
        if (inv.status === "PAGADA" || inv.status === "CANCELADA") {
            const invoiceDate = new Date(inv.issueDate);
            const key = invoiceDate.toLocaleString('es-PE', { month: 'short' }).toUpperCase();
            if (monthlyReceipts.hasOwnProperty(key)) {
                monthlyReceipts[key] += parseFloat(inv.amount) || 0;
            }
        }
    });

    return {
        statusCounts,
        monthlyReceipts,
        months: Object.keys(monthlyReceipts)
    };
}

/**
 * Actualiza los gráficos dinámicamente (HU009)
 */
function updateCharts() {
    const chartData = getChartData();
    const { statusCounts, monthlyReceipts, months } = chartData;

    // Actualizar gráfico de barras - Estado de Facturas
    const total = statusCounts.pagadas + statusCounts.pendientes + statusCounts.vencidas + statusCounts.canceladas;
    
    if (total > 0) {
        // Calcular porcentajes
        const pagadasPct = (statusCounts.pagadas / total) * 100;
        const pendientesPct = (statusCounts.pendientes / total) * 100;
        const vencidasPct = (statusCounts.vencidas / total) * 100;
        const canceladasPct = (statusCounts.canceladas / total) * 100;

        // Actualizar barras
        const baraPagadas = document.querySelector('[data-chart="bar-pagadas"]');
        const baraPendientes = document.querySelector('[data-chart="bar-pendientes"]');
        const baraVencidas = document.querySelector('[data-chart="bar-vencidas"]');
        const baraCanceladas = document.querySelector('[data-chart="bar-canceladas"]');

        if (baraPagadas) baraPagadas.style.height = (pagadasPct > 5 ? pagadasPct : 5) + '%';
        if (baraPendientes) baraPendientes.style.height = (pendientesPct > 5 ? pendientesPct : 5) + '%';
        if (baraVencidas) baraVencidas.style.height = (vencidasPct > 5 ? vencidasPct : 5) + '%';
        if (baraCanceladas) baraCanceladas.style.height = (canceladasPct > 5 ? canceladasPct : 5) + '%';

        // Actualizar etiquetas de cantidad
        const labelPagadas = document.querySelector('[data-chart-label="pagadas"]');
        const labelPendientes = document.querySelector('[data-chart-label="pendientes"]');
        const labelVencidas = document.querySelector('[data-chart-label="vencidas"]');
        const labelCanceladas = document.querySelector('[data-chart-label="canceladas"]');

        if (labelPagadas) labelPagadas.textContent = statusCounts.pagadas;
        if (labelPendientes) labelPendientes.textContent = statusCounts.pendientes;
        if (labelVencidas) labelVencidas.textContent = statusCounts.vencidas;
        if (labelCanceladas) labelCanceladas.textContent = statusCounts.canceladas;
    }

    // Actualizar gráfico de líneas - Recaudación Mensual
    const maxRecaudacion = Math.max(...Object.values(monthlyReceipts), 1);
    const pathData = months.map((month, index) => {
        const value = monthlyReceipts[month] || 0;
        const yPos = 80 - (value / maxRecaudacion) * 60; // Normalizar a rango de 20 a 80
        const xPos = (index / (months.length - 1)) * 100;
        return { xPos, yPos, value };
    });

    // Generar path SVG
    let pathString = '';
    let circlesString = '';
    pathData.forEach((point, index) => {
        if (index === 0) {
            pathString += `M ${point.xPos} ${point.yPos}`;
        } else {
            const prevPoint = pathData[index - 1];
            pathString += ` Q ${(prevPoint.xPos + point.xPos) / 2} ${prevPoint.yPos}, ${point.xPos} ${point.yPos}`;
        }
        circlesString += `<circle cx="${point.xPos}" cy="${point.yPos}" fill="#0d46a0" r="1.5"></circle>`;
    });

    const lineChart = document.querySelector('[data-chart="line-recaudacion"]');
    if (lineChart) {
        lineChart.innerHTML = `
            <path d="${pathString}" fill="none" stroke="#0d46a0" stroke-width="2"></path>
            ${circlesString}
            <line class="text-slate-100 dark:text-slate-700" stroke="currentColor" stroke-dasharray="2" x1="0" x2="100" y1="20" y2="20"></line>
            <line class="text-slate-100 dark:text-slate-700" stroke="currentColor" stroke-dasharray="2" x1="0" x2="100" y1="40" y2="40"></line>
            <line class="text-slate-100 dark:text-slate-700" stroke="currentColor" stroke-dasharray="2" x1="0" x2="100" y1="60" y2="60"></line>
        `;
    }

    // Actualizar etiquetas de meses
    const monthsContainer = document.querySelector('[data-chart="months"]');
    if (monthsContainer) {
        monthsContainer.innerHTML = months.map(month => `<span>${month}</span>`).join('');
    }

    console.log('Gráficos actualizados:', chartData);
}
function updateAlertsSection() {
    const { overdueInvoices, upcomingInvoices } = getOverdueAndUpcomingInvoices();
    const alertsContainer = document.getElementById('alertsContainer');
    
    if (!alertsContainer) return;

    // Limpiar alertas existentes
    alertsContainer.innerHTML = '';

    // Mostrar mensaje si no hay alertas
    if (overdueInvoices.length === 0 && upcomingInvoices.length === 0) {
        alertsContainer.innerHTML = `
            <div class="col-span-1 md:col-span-2 text-center py-8">
                <span class="material-symbols-outlined text-green-500 text-3xl mb-2 block">check_circle</span>
                <p class="text-slate-600 dark:text-slate-400">No hay alertas. Todas las facturas están al día.</p>
            </div>
        `;
        return;
    }

    // Mostrar facturas vencidas
    overdueInvoices.forEach(inv => {
        const alertHTML = `
            <div class="flex items-stretch justify-between gap-4 rounded-xl bg-red-50 dark:bg-red-950/20 p-5 border border-red-100 dark:border-red-900/30">
                <div class="flex flex-col gap-3">
                    <div>
                        <span class="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Crítico</span>
                        <p class="text-slate-900 dark:text-slate-100 text-lg font-bold mt-1">Factura #${inv.invoiceNumber} - ${inv.daysOverdue} día${inv.daysOverdue > 1 ? 's' : ''} de retraso</p>
                        <p class="text-slate-600 dark:text-slate-400 text-sm">Cliente: ${inv.clientName}. Monto: ${formatCurrency(inv.amount)}</p>
                    </div>
                    <button class="flex items-center justify-center rounded-lg h-9 px-4 bg-red-600 text-white text-sm font-bold w-fit hover:bg-red-700 transition">
                        Gestionar Cobro
                    </button>
                </div>
                <div class="hidden sm:block size-16 flex-shrink-0 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center text-red-600">
                    <span class="material-symbols-outlined text-3xl">error</span>
                </div>
            </div>
        `;
        alertsContainer.insertAdjacentHTML('beforeend', alertHTML);
    });

    // Mostrar facturas próximas a vencer
    upcomingInvoices.forEach(inv => {
        const daysText = inv.daysUntilDue === 0 ? 'Vence hoy' : 
                         inv.daysUntilDue === 1 ? 'Vence mañana' : 
                         `Vence en ${inv.daysUntilDue} días`;
        
        const alertHTML = `
            <div class="flex items-stretch justify-between gap-4 rounded-xl bg-orange-50 dark:bg-orange-950/20 p-5 border border-orange-100 dark:border-orange-900/30">
                <div class="flex flex-col gap-3">
                    <div>
                        <span class="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Próximo</span>
                        <p class="text-slate-900 dark:text-slate-100 text-lg font-bold mt-1">Factura #${inv.invoiceNumber} - ${daysText}</p>
                        <p class="text-slate-600 dark:text-slate-400 text-sm">Cliente: ${inv.clientName}. Monto: ${formatCurrency(inv.amount)}</p>
                    </div>
                    <button class="flex items-center justify-center rounded-lg h-9 px-4 bg-orange-500 text-white text-sm font-bold w-fit hover:bg-orange-600 transition">
                        Enviar Recordatorio
                    </button>
                </div>
                <div class="hidden sm:block size-16 flex-shrink-0 bg-orange-100 dark:bg-orange-900/40 rounded-full flex items-center justify-center text-orange-500">
                    <span class="material-symbols-outlined text-3xl">warning</span>
                </div>
            </div>
        `;
        alertsContainer.insertAdjacentHTML('beforeend', alertHTML);
    });
}

/**
 * Inicializa el dashboard cuando carga la página
 */
document.addEventListener('DOMContentLoaded', () => {
    updateDashboard();

    // Escuchar cambios en storage (para actualizar si hay cambios en otras pestañas)
    window.addEventListener('storage', () => {
        updateDashboard();
    });
});

