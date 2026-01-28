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
        } else if (inv.status === "PAGADA" || inv.status === "CANCELADA") {
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

    console.log('Dashboard actualizado');
}

/**
 * Actualiza la sección de alertas (HU008)
 */
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

