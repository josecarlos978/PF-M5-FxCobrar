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
    const facturasP = invoices.filter(inv => inv.estado === "Pendiente").length;
    const facturasPagadas = invoices.filter(inv => inv.estado === "Pagada").length;
    const facturasCanceladas = invoices.filter(inv => inv.estado === "Cancelada").length;

    // Cálculo de montos
    let montoPendiente = 0;
    let montoCobrado = 0;

    invoices.forEach(inv => {
        const monto = parseFloat(inv.amount) || 0;
        if (inv.estado === "Pendiente") {
            montoPendiente += monto;
        } else if (inv.estado === "Pagada" || inv.estado === "Cancelada") {
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

    // Desglose de estados (si es necesario mostrar)
    console.log('Métricas actualizadas:', metrics);
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
