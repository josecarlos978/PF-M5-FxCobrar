// js/facturas.js
import { getAllClients } from "../utils/storage.js";

/**
 * LocalStorage keys (simples y claras)
 */
const INVOICES_KEY = "invoices_fx";
const FOLLOWUPS_KEY = "followups_fx"; // opcional (aquí lo usamos dentro de invoice también)

const state = {
  currentPage: 1,
  itemsPerPage: 5,
  filteredInvoices: null,
  selectedInvoiceId: null,
};

document.addEventListener("DOMContentLoaded", () => {
  initFacturasPage();
});

function initFacturasPage() {
  // Capturar DOM
  const invoiceForm = document.getElementById("invoiceForm");
  const clearBtn = document.getElementById("invoiceClearBtn");
  const searchInput = document.getElementById("invoiceSearchInput");

  const clientSelect = document.getElementById("invoiceClientSelect");
  const rucAuto = document.getElementById("invoiceRucAuto");

  const tableBody = document.getElementById("invoicesTableBody");
  const followupForm = document.getElementById("followupForm");

  if (!invoiceForm || !clientSelect || !tableBody) return;

  // 1) Cargar clientes en el select
  loadClientsIntoSelect(clientSelect);

  // 2) Autocompletar RUC al seleccionar cliente
  clientSelect.addEventListener("change", () => {
    const client = getAllClients().find((c) => c.id === clientSelect.value);
    rucAuto.value = client ? client.ruc : "";
  });

  // 3) Registrar factura
  invoiceForm.addEventListener("submit", onInvoiceSubmit);

  // 4) Limpiar form
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      invoiceForm.reset();
      rucAuto.value = "";
    });
  }

  // 5) Búsqueda
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const q = e.target.value.trim().toLowerCase();
      state.currentPage = 1;

      if (!q) {
        state.filteredInvoices = null;
        renderInvoices();
        return;
      }

      const all = getAllInvoices();
      state.filteredInvoices = all.filter((inv) => {
        return (
          inv.invoiceNumber.toLowerCase().includes(q) ||
          inv.clientName.toLowerCase().includes(q) ||
          inv.clientRuc.toLowerCase().includes(q)
        );
      });

      renderInvoices();
    });
  }

  // 6) Acciones en tabla (delegación)
  tableBody.addEventListener("click", onTableClick);

  // 7) Seguimiento (registro contacto)
  if (followupForm) {
    followupForm.addEventListener("submit", onFollowupSubmit);
  }

  // Render inicial
  renderInvoices();
  renderSelectedInvoiceCard();
  renderFollowupHistory([]);
}

/**
 * =========================
 *  DATA (localStorage)
 * =========================
 */
function getAllInvoices() {
  try {
    return JSON.parse(localStorage.getItem(INVOICES_KEY)) || [];
  } catch {
    return [];
  }
}

function saveAllInvoices(invoices) {
  localStorage.setItem(INVOICES_KEY, JSON.stringify(invoices));
}

function addInvoice(invoice) {
  const invoices = getAllInvoices();
  invoices.unshift(invoice); // más reciente arriba
  saveAllInvoices(invoices);
}

function deleteInvoice(invoiceId) {
  const invoices = getAllInvoices().filter((inv) => inv.id !== invoiceId);
  saveAllInvoices(invoices);

  // si borras la seleccionada
  if (state.selectedInvoiceId === invoiceId) {
    state.selectedInvoiceId = null;
    renderSelectedInvoiceCard();
    renderFollowupHistory([]);
  }
}

function updateInvoice(invoiceId, changes) {
  const invoices = getAllInvoices();
  const idx = invoices.findIndex((inv) => inv.id === invoiceId);
  if (idx === -1) return;

  invoices[idx] = { ...invoices[idx], ...changes };
  saveAllInvoices(invoices);
}

/**
 * =========================
 *  CLIENTES (select)
 * =========================
 */
function loadClientsIntoSelect(selectEl) {
  const clients = getAllClients();

  selectEl.innerHTML = `<option value="">Seleccionar cliente...</option>`;

  if (!clients || clients.length === 0) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.disabled = true;
    opt.textContent = "No hay clientes registrados (ve a Clientes)";
    selectEl.appendChild(opt);
    return;
  }

  clients.forEach((client) => {
    const opt = document.createElement("option");
    opt.value = client.id;
    opt.textContent = `${client.razonSocial} (${client.ruc})`;
    selectEl.appendChild(opt);
  });
}

/**
 * =========================
 *  HANDLERS
 * =========================
 */
function onInvoiceSubmit(e) {
  e.preventDefault();

  const clientSelect = document.getElementById("invoiceClientSelect");
  const rucAuto = document.getElementById("invoiceRucAuto");
  const numberInput = document.getElementById("invoiceNumberInput");
  const amountInput = document.getElementById("invoiceAmountInput");
  const issueInput = document.getElementById("invoiceIssueDateInput");
  const dueInput = document.getElementById("invoiceDueDateInput");
  const statusSelect = document.getElementById("invoiceStatusSelect");
  const currencySelect = document.getElementById("invoiceCurrencySelect");

  const client = getAllClients().find((c) => c.id === clientSelect.value);

  // Validaciones básicas (nivel clase)
  if (!client) return alert("Selecciona un cliente.");
  if (!numberInput.value.trim()) return alert("Ingresa el número de factura.");
  if (!amountInput.value || Number(amountInput.value) <= 0) return alert("Ingresa un monto válido.");
  if (!issueInput.value) return alert("Selecciona la fecha de emisión.");
  if (!dueInput.value) return alert("Selecciona la fecha de vencimiento.");

  const invoice = {
    id: generateId(),
    clientId: client.id,
    clientName: client.razonSocial,
    clientRuc: client.ruc,
    invoiceNumber: numberInput.value.trim(),
    amount: Number(amountInput.value),
    currency: currencySelect.value,
    issueDate: issueInput.value,
    dueDate: dueInput.value,
    status: statusSelect.value,
    followups: [], // gestión de cobranza (HU006 básico)
    createdAt: new Date().toISOString(),
  };

  addInvoice(invoice);

  // reset form
  e.currentTarget.reset();
  rucAuto.value = "";

  state.currentPage = 1;
  state.filteredInvoices = null;

  renderInvoices();
  alert("Factura registrada correctamente ✅");
}

function onTableClick(e) {
  const row = e.target.closest("tr[data-invoice-id]");
  const actionBtn = e.target.closest("button[data-action]");

  // Click en botón de acción
  if (actionBtn) {
    const action = actionBtn.dataset.action;
    const invoiceId = actionBtn.dataset.id;

    if (action === "mark-paid") {
    const ok = confirm("¿Marcar esta factura como PAGADA?");
    if (!ok) return;
    const inv = getInvoiceById(invoiceId);
    if (inv?.status === "CANCELADA") {
    alert("No se puede marcar como PAGADA una factura CANCELADA.");
    return;
    }

    updateInvoice(invoiceId, { status: "PAGADA" });

    // refrescar UI
    renderInvoices();
    if (state.selectedInvoiceId === invoiceId) {
        renderSelectedInvoiceCard();
    }
    return;
    }

    if (action === "mark-canceled") {
    const ok = confirm("¿Marcar esta factura como CANCELADA?");
    if (!ok) return;
    const inv = getInvoiceById(invoiceId);
    if (inv?.status === "PAGADA") {
    alert("No se puede CANCELAR una factura PAGADA.");
    return;
    }

    updateInvoice(invoiceId, { status: "CANCELADA" });

    // refrescar UI
    renderInvoices();
    if (state.selectedInvoiceId === invoiceId) {
        renderSelectedInvoiceCard();
    }
    return;
    }

    if (action === "delete") {
      const ok = confirm("¿Eliminar esta factura?");
      if (!ok) return;
      deleteInvoice(invoiceId);
      renderInvoices();
      return;
    }

    if (action === "select") {
      state.selectedInvoiceId = invoiceId;
      renderSelectedInvoiceCard();
      const inv = getInvoiceById(invoiceId);
      renderFollowupHistory(inv ? inv.followups : []);
      return;
    }
  }

  // Click en la fila (seleccionar)
  if (row) {
    const invoiceId = row.dataset.invoiceId;
    state.selectedInvoiceId = invoiceId;
    renderSelectedInvoiceCard();
    const inv = getInvoiceById(invoiceId);
    renderFollowupHistory(inv ? inv.followups : []);
  }
}

function onFollowupSubmit(e) {
  e.preventDefault();

  if (!state.selectedInvoiceId) {
    alert("Selecciona una factura del listado.");
    return;
  }

  const date = document.getElementById("followupDateInput").value;
  const channel = document.getElementById("followupChannelSelect").value;
  const comment = document.getElementById("followupCommentInput").value.trim();

  if (!date) return alert("Selecciona la fecha de gestión.");
  if (!channel) return alert("Selecciona el medio.");
  if (!comment) return alert("Escribe un comentario.");

  const inv = getInvoiceById(state.selectedInvoiceId);
  if (!inv) return alert("Factura no encontrada.");

  const followup = {
    id: generateId(),
    date,
    channel,
    comment,
  };

  const updated = [...(inv.followups || []), followup];
  updateInvoice(inv.id, { followups: updated });

  e.currentTarget.reset();

  renderSelectedInvoiceCard();
  renderFollowupHistory(updated);
  alert("Gestión registrada ✅");
}

/**
 * =========================
 *  HELPERS
 * =========================
 */
function getInvoiceById(invoiceId) {
  return getAllInvoices().find((inv) => inv.id === invoiceId);
}

function generateId() {
  return "inv_" + Math.random().toString(16).slice(2) + "_" + Date.now();
}

function formatMoney(amount, currency) {
  const symbol = currency === "USD" ? "$" : "S/";
  return `${symbol} ${amount.toFixed(2)}`;
}

function formatDate(yyyyMmDd) {
  if (!yyyyMmDd) return "-";
  const [y, m, d] = yyyyMmDd.split("-");
  return `${d}/${m}/${y}`;
}

function badgeForStatus(status) {
  if (status === "PAGADA") return "bg-green-50 text-green-700 border-green-200";
  if (status === "CANCELADA") return "bg-slate-100 text-slate-700 border-slate-200";
  return "bg-yellow-50 text-yellow-700 border-yellow-200"; // PENDIENTE
}

/**
 * =========================
 *  RENDER
 * =========================
 */
function renderInvoices() {
  const tbody = document.getElementById("invoicesTableBody");
  const countSpan = document.getElementById("invoiceCountSpan");

  const invoices = state.filteredInvoices !== null ? state.filteredInvoices : getAllInvoices();

  const totalItems = invoices.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / state.itemsPerPage));
  if (state.currentPage > totalPages) state.currentPage = totalPages;

  const start = (state.currentPage - 1) * state.itemsPerPage;
  const pageItems = invoices.slice(start, start + state.itemsPerPage);

  tbody.innerHTML = "";

  if (pageItems.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="py-10 text-center text-slate-500">
          No hay facturas registradas.
        </td>
      </tr>`;
    if (countSpan) countSpan.textContent = `Mostrando 0 facturas`;
    renderInvoicePagination(totalPages);
    return;
  }
  function normalizeInvoice(inv) {
    return {
        id: inv.id,
        clientName: inv.clientName || inv.razonSocial || inv.clienteNombre || inv.cliente || "",
        clientRuc: inv.clientRuc || inv.ruc || inv.clienteRuc || "",
        invoiceNumber: inv.invoiceNumber || inv.numeroFactura || inv.factura || "",
        amount: Number(inv.amount ?? inv.monto ?? inv.total ?? 0),
        currency: inv.currency || inv.moneda || "PEN",
        issueDate: inv.issueDate || inv.fechaEmision || inv.emision || "",
        dueDate: inv.dueDate || inv.fechaVencimiento || inv.vencimiento || "",
        status: inv.status || inv.estado || "PENDIENTE",
        followups: inv.followups || inv.gestiones || [],
    };}


  pageItems.forEach((raw, index) => {
    const inv = normalizeInvoice(raw);

    const tr = document.createElement("tr");
    tr.dataset.invoiceId = inv.id;
    tr.className = "border-b border-slate-100 hover:bg-slate-50 transition cursor-pointer";
    if (index % 2 === 1) tr.classList.add("bg-slate-50/40");

    tr.innerHTML = `
        <td class="py-4 text-slate-700">${formatDate(inv.issueDate)}</td>
        <td class="py-4 text-slate-900 font-medium">${inv.clientName}</td>
        <td class="py-4 text-slate-700 text-sm">${inv.clientRuc}</td>
        <td class="py-4 text-slate-900 font-semibold">${inv.invoiceNumber}</td>
        <td class="py-4 text-right text-slate-900 font-semibold">${formatMoney(inv.amount, inv.currency)}</td>
        <td class="py-4 text-slate-700">${formatDate(inv.dueDate)}</td>
        <td class="py-4">
        <span class="inline-flex items-center px-2 py-1 text-xs font-bold border rounded-lg ${badgeForStatus(inv.status)}">
            ${inv.status}
        </span>
        </td>
        <td class="py-4 text-center">
        <div class="flex justify-center gap-2 flex-wrap">
            <button data-action="select" data-id="${inv.id}" class="text-primary hover:opacity-80" title="Seleccionar">
            <span class="material-symbols-outlined">touch_app</span>
            </button>

            <button data-action="mark-paid" data-id="${inv.id}"
            class="px-2 py-1 text-xs font-bold rounded-lg border border-green-200 bg-green-50 text-green-700 hover:opacity-80 transition">
            Pagada
            </button>

            <button data-action="mark-canceled" data-id="${inv.id}"
            class="px-2 py-1 text-xs font-bold rounded-lg border border-slate-200 bg-slate-100 text-slate-700 hover:opacity-80 transition">
            Cancelar
            </button>

            <button data-action="delete" data-id="${inv.id}" class="text-red-500 hover:opacity-80" title="Eliminar">
            <span class="material-symbols-outlined">delete</span>
            </button>
        </div>
        </td>
    `;

    tbody.appendChild(tr);
    });


  if (countSpan) {
    const shownStart = totalItems === 0 ? 0 : start + 1;
    const shownEnd = start + pageItems.length;
    countSpan.textContent = `Mostrando ${shownStart} a ${shownEnd} de ${totalItems} facturas`;
  }

  renderInvoicePagination(totalPages);
}

function renderInvoicePagination(totalPages) {
  const container = document.getElementById("invoicePagination");
  if (!container) return;

  container.innerHTML = "";

  const prev = document.createElement("button");
  prev.className =
    "px-3 py-1 text-xs font-bold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50";
  prev.textContent = "Anterior";
  prev.disabled = state.currentPage === 1;
  prev.addEventListener("click", () => {
    state.currentPage--;
    renderInvoices();
  });
  container.appendChild(prev);

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.className =
      i === state.currentPage
        ? "px-3 py-1 text-xs font-bold bg-primary text-white rounded-lg shadow-sm"
        : "px-3 py-1 text-xs font-bold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50";
    btn.textContent = i;
    btn.addEventListener("click", () => {
      state.currentPage = i;
      renderInvoices();
    });
    container.appendChild(btn);
  }

  const next = document.createElement("button");
  next.className =
    "px-3 py-1 text-xs font-bold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50";
  next.textContent = "Siguiente";
  next.disabled = state.currentPage === totalPages;
  next.addEventListener("click", () => {
    state.currentPage++;
    renderInvoices();
  });
  container.appendChild(next);
}

function renderSelectedInvoiceCard() {
  const card = document.getElementById("selectedInvoiceCard");
  if (!card) return;

  if (!state.selectedInvoiceId) {
    card.innerHTML = `
      <p class="text-sm font-bold text-slate-900">Ninguna factura seleccionada</p>
      <p class="text-xs text-slate-500">Selecciona una factura del listado para registrar una gestión.</p>
    `;
    return;
  }

  const inv = getInvoiceById(state.selectedInvoiceId);
  if (!inv) {
    card.innerHTML = `
      <p class="text-sm font-bold text-slate-900">Factura no encontrada</p>
      <p class="text-xs text-slate-500">Puede que haya sido eliminada.</p>
    `;
    return;
  }

  card.innerHTML = `
    <p class="text-sm font-extrabold text-slate-900">${inv.invoiceNumber}</p>
    <p class="text-xs text-slate-600">${inv.clientName} — ${inv.clientRuc}</p>
    <p class="text-xs text-slate-600">Vence: ${formatDate(inv.dueDate)} · ${inv.status}</p>
  `;
}

function renderFollowupHistory(followups) {
  const container = document.getElementById("followupHistory");
  if (!container) return;

  container.innerHTML = "";

  if (!followups || followups.length === 0) {
    container.innerHTML = `<p class="text-sm text-slate-500">Sin gestiones registradas.</p>`;
    return;
  }

  followups
    .slice()
    .reverse()
    .forEach((f) => {
      const div = document.createElement("div");
      div.className = "rounded-xl border border-slate-200 p-3 bg-white";

      div.innerHTML = `
        <p class="text-xs text-slate-500">${formatDate(f.date)} · ${f.channel}</p>
        <p class="text-sm font-semibold text-slate-900 mt-1">${f.comment}</p>
      `;

      container.appendChild(div);
    });
}
