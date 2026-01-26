// Gestión de clientes - Funcionalidad de registro y control
import { validateFullClient } from "../utils/validation.js";
import { saveClient, getAllClients, rucExists, deleteClient, searchClients, updateClient } from '../utils/storage.js';


/**
 * Estado de la vista (en vez de variables globales sueltas)
 * - filteredClients:
 *    null  => no hay filtro (mostrar todos)
 *    []    => filtro activo sin resultados
 *    [..]  => filtro activo con resultados
 */
const state = {
  currentPage: 1,
  itemsPerPage: 5,
  filteredClients: null,

  // edición
  editingClientId: null,
  originalRuc: null,
};


export function initClientesPage() {
  // 1) Capturar elementos del DOM (una sola vez)
  const form = document.getElementById("clientForm");
  const searchInput = document.getElementById("searchInput");
  const tbody = document.getElementById("clientsTableBody");

  if (!form || !tbody) return;

  // 2) Eventos
  form.addEventListener("submit", onFormSubmit);

  if (searchInput) {
    searchInput.addEventListener("input", onSearchInput);
  }

  // Event delegation: un solo listener para todos los botones de la tabla
  tbody.addEventListener("click", onTableClick);

  // 3) Render inicial
  render();
}

/**
 * === Handlers ===
 */

function onFormSubmit(e) {
  e.preventDefault();

  const form = e.currentTarget;
  const clientData = readClientForm();

  const rucTrim = clientData.ruc.trim();

  // ✅ Validación de RUC duplicado:
  // - si NO estoy editando: no debe existir
  // - si estoy editando: solo validar duplicado si el RUC cambió
  if (!state.editingClientId) {
    if (rucExists(rucTrim)) {
      showNotification("Error: El RUC/DNI ya está registrado", "error");
      return;
    }
  } else {
    const rucChanged = rucTrim !== state.originalRuc;
    if (rucChanged && rucExists(rucTrim)) {
      showNotification("Error: El RUC/DNI ya está registrado", "error");
      return;
    }
  }

  // Validar datos completos
  const validation = validateFullClient(clientData);
  if (!validation.isValid) {
    showNotification("Error: " + validation.errors.join(", "), "error");
    return;
  }

  try {
    // ✅ Guardar o actualizar según modo
    if (!state.editingClientId) {
      saveClient(clientData);
      showNotification("Cliente registrado exitosamente", "success");
    } else {
      updateClient(state.editingClientId, clientData);
      showNotification("Cliente actualizado exitosamente", "success");
      resetEditModeUI();
    }

    form.reset();
    state.currentPage = 1;
    state.filteredClients = null; // limpiamos filtro para evitar confusión
    render();
  } catch (error) {
    console.error("Error al guardar:", error);
    showNotification("Error al guardar el cliente", "error");
  }
}


function onSearchInput(e) {
  const query = e.target.value.trim();
  state.currentPage = 1;

  // Importante: usar null para "sin filtro"
  if (!query) {
    state.filteredClients = null;
    render();
    return;
  }

  // Con filtro activo, guardamos array (aunque esté vacío)
  state.filteredClients = searchClients(query);
  render();
}

function onTableClick(e) {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;

  const action = btn.dataset.action;
  const clientId = btn.dataset.id;

  if (!clientId) return;

  if (action === "delete") {
    deleteClientConfirm(clientId);
  }

  if (action === "edit") {
    startEditClient(clientId);
  }

}

function startEditClient(clientId) {
  const client = getAllClients().find((c) => c.id === clientId);

  if (!client) {
    showNotification("Cliente no encontrado", "error");
    return;
  }

  // Guardar estado de edición
  state.editingClientId = clientId;
  state.originalRuc = client.ruc;

  // Llenar formulario con los datos del cliente
  fillClientForm(client);

  // Cambiar UI a modo edición
  setEditModeUI(true);

  showNotification("Editando cliente...", "info");

  // UX simple: llevar al usuario al formulario
  const form = document.getElementById("clientForm");
  if (form) form.scrollIntoView({ behavior: "smooth" });
}

function fillClientForm(client) {
  document.getElementById("rucInput").value = client.ruc || "";
  document.getElementById("razonSocialInput").value = client.razonSocial || "";
  document.getElementById("direccionInput").value = client.direccion || "";

  document.getElementById("contacto1NombreInput").value = client.contacto1?.nombre || "";
  document.getElementById("contacto1CelularInput").value = client.contacto1?.celular || "";
  document.getElementById("contacto1EmailInput").value = client.contacto1?.email || "";

  document.getElementById("contacto2NombreInput").value = client.contacto2?.nombre || "";
  document.getElementById("contacto2CelularInput").value = client.contacto2?.celular || "";
  document.getElementById("contacto2EmailInput").value = client.contacto2?.email || "";
}

function setEditModeUI(isEditing) {
  const form = document.getElementById("clientForm");
  if (!form) return;

  // ✅ encuentra button o input submit
  const submitControl =
    document.getElementById("submitBtn") || form.querySelector('[type="submit"]');

  // ✅ el cancelar lo manejamos aunque no exista submit (para que SIEMPRE se oculte)
  let cancelBtn = document.getElementById("cancelEditBtn");

  // Crear botón cancelar si no existe (solo si tenemos submit para insertarlo cerca)
  if (!cancelBtn && submitControl) {
    cancelBtn = document.createElement("button");
    cancelBtn.id = "cancelEditBtn";
    cancelBtn.type = "button";
    cancelBtn.className =
      "mt-3 w-full h-12 rounded-lg font-bold transition-all " +
      "flex items-center justify-center gap-2 " +
      "bg-gray-100 hover:bg-gray-200 text-gray-800 " +
      "dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100";
    cancelBtn.innerHTML = `<span class="material-symbols-outlined">close</span> Cancelar edición`;

    cancelBtn.addEventListener("click", () => {
      resetEditModeUI();
      form.reset();
      showNotification("Edición cancelada", "info");
    });

    // Insertar después del submit (funciona con button o input)
    submitControl.insertAdjacentElement("afterend", cancelBtn);
  }

  // Cambiar texto del submit si existe
  if (submitControl) {
    if (isEditing) {
      // Si es <input>, no se puede innerHTML: usamos value
      if (submitControl.tagName === "INPUT") {
        submitControl.value = "Actualizar cliente";
      } else {
        submitControl.innerHTML = `<span class="material-symbols-outlined">edit</span> Actualizar cliente`;
      }
    } else {
      if (submitControl.tagName === "INPUT") {
        submitControl.value = "Guardar cliente";
      } else {
        submitControl.innerHTML = `<span class="material-symbols-outlined">save</span> Guardar cliente`;
      }
    }
  }

  // ✅ Mostrar/ocultar cancelar SIEMPRE
  if (cancelBtn) {
    cancelBtn.style.display = isEditing ? "flex" : "none";
  }
}

function resetEditModeUI() {
  state.editingClientId = null;
  state.originalRuc = null;
  setEditModeUI(false);
}


/**
 * === Lectura de formulario ===
 * (simple, explícito y fácil de entender para clase)
 */
function readClientForm() {
  return {
    ruc: document.getElementById("rucInput").value,
    razonSocial: document.getElementById("razonSocialInput").value,
    direccion: document.getElementById("direccionInput").value,
    contacto1Nombre: document.getElementById("contacto1NombreInput").value,
    contacto1Celular: document.getElementById("contacto1CelularInput").value,
    contacto1Email: document.getElementById("contacto1EmailInput").value,
    contacto2Nombre: document.getElementById("contacto2NombreInput").value,
    contacto2Celular: document.getElementById("contacto2CelularInput").value,
    contacto2Email: document.getElementById("contacto2EmailInput").value,
  };
}

/**
 * === Render principal (orquesta) ===
 * Separa:
 * - obtención de datos
 * - paginación
 * - render tabla
 * - render paginación
 */
function render() {
  const tbody = document.getElementById("clientsTableBody");
  if (!tbody) return;

  const clients = getClientsForView();

  const { totalPages, paginatedClients, totalItems } = paginate(clients);

  renderClientsTable(tbody, paginatedClients, totalItems);
  renderPagination(totalPages, totalItems, paginatedClients.length);
}

/**
 * Devuelve la lista correcta según haya filtro o no.
 */
function getClientsForView() {
  if (state.filteredClients !== null) {
    return state.filteredClients;
  }
  return getAllClients();
}

/**
 * Calcula el slice de la página actual.
 * También corrige currentPage si quedó fuera de rango.
 */
function paginate(list) {
  const totalItems = list.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / state.itemsPerPage));

  // Si borras elementos, currentPage puede quedar "pasado"
  if (state.currentPage > totalPages) {
    state.currentPage = totalPages;
  }

  const startIndex = (state.currentPage - 1) * state.itemsPerPage;
  const paginatedClients = list.slice(startIndex, startIndex + state.itemsPerPage);

  return { totalPages, paginatedClients, totalItems };
}

/**
 * Render de tabla (patrón recomendado):
 * 1. Capturar contenedor
 * 2. Recorrer data
 * 3. Inyectar HTML
 */
function renderClientsTable(tbody, paginatedClients, totalItems) {
  tbody.innerHTML = "";

  if (paginatedClients.length === 0) {
    const message =
      totalItems === 0
        ? "No hay clientes registrados"
        : "No se encontraron clientes con ese criterio";

    tbody.innerHTML = `<tr>
      <td colspan="5" class="px-6 py-8 text-center text-gray-500">${message}</td>
    </tr>`;
    return;
  }

  paginatedClients.forEach((client, index) => {
    const tr = createClientRow(client);

    // zebra rows
    if (index % 2 === 1) {
      tr.classList.add("bg-slate-50/50");
    }

    tbody.appendChild(tr);
  });

}

function createClientRow(client) {
  const tr = document.createElement("tr");

  // ✅ filas diferenciadas + hover
  tr.className =
    "border-b border-slate-100 hover:bg-slate-50 transition";

  const contactInfo = client.contacto1
    ? `
      <div class="flex flex-col">
        <span class="text-sm font-semibold text-slate-900">
          ${client.contacto1.nombre}
        </span>
        <span class="text-xs text-slate-600">
          ${client.contacto1.celular}
        </span>
      </div>`
    : `<span class="text-xs text-slate-400">Sin contacto</span>`;

  tr.innerHTML = `
    <!-- RUC -->
    <td class="py-4 font-bold text-slate-700">
      ${client.ruc}
    </td>

    <!-- Razón social -->
    <td class="py-4 text-slate-700">
      ${client.razonSocial}
    </td>

    <!-- Dirección -->
    <td class="py-4 text-slate-600">
      ${client.direccion}
    </td>

    <!-- Contacto -->
    <td class="py-4">
      ${contactInfo}
    </td>

    <!-- Acciones -->
    <td class="py-4 text-center">
      <div class="flex justify-center gap-3">
        <button
          data-action="edit"
          data-id="${client.id}"
          class="text-primary hover:opacity-80 transition"
          title="Editar"
        >
          <span class="material-symbols-outlined">edit</span>
        </button>

        <button
          data-action="delete"
          data-id="${client.id}"
          class="text-red-500 hover:opacity-80 transition"
          title="Eliminar"
        >
          <span class="material-symbols-outlined">delete</span>
        </button>
      </div>
    </td>
  `;

  return tr;
}

/**
 * Render de paginación (botones + texto)
 */
function renderPagination(totalPages, totalItems, currentItems) {
  const countSpan = document.getElementById("clientCountSpan");
  const paginationContainer = document.getElementById("paginationButtons");

  // Texto "Mostrando..."
  if (countSpan) {
    const startIndex = totalItems === 0 ? 0 : (state.currentPage - 1) * state.itemsPerPage + 1;
    const endIndex = totalItems === 0 ? 0 : startIndex + currentItems - 1;

    countSpan.textContent = `Mostrando ${startIndex} a ${endIndex} de ${totalItems} clientes`;
  }

  if (!paginationContainer) return;

  paginationContainer.innerHTML = "";

  // Botón anterior
  const prevBtn = document.createElement("button");
  prevBtn.className =
    "px-3 py-1 text-xs font-bold text-gray-500 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 transition-colors disabled:opacity-50";
  prevBtn.disabled = state.currentPage === 1;
  prevBtn.textContent = "Anterior";
  prevBtn.addEventListener("click", () => {
    if (state.currentPage > 1) {
      state.currentPage--;
      render();
    }
  });
  paginationContainer.appendChild(prevBtn);

  // Botones numéricos
  for (let i = 1; i <= totalPages; i++) {
    const pageBtn = document.createElement("button");
    pageBtn.className =
      i === state.currentPage
        ? "px-3 py-1 text-xs font-bold bg-primary text-white rounded shadow-sm"
        : "px-3 py-1 text-xs font-bold text-gray-500 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 transition-colors";
    pageBtn.textContent = i;
    pageBtn.addEventListener("click", () => {
      state.currentPage = i;
      render();
    });
    paginationContainer.appendChild(pageBtn);
  }

  // Botón siguiente
  const nextBtn = document.createElement("button");
  nextBtn.className =
    "px-3 py-1 text-xs font-bold text-gray-500 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 transition-colors disabled:opacity-50";
  nextBtn.disabled = state.currentPage === totalPages;
  nextBtn.textContent = "Siguiente";
  nextBtn.addEventListener("click", () => {
    if (state.currentPage < totalPages) {
      state.currentPage++;
      render();
    }
  });
  paginationContainer.appendChild(nextBtn);
}

/**
 * Eliminar con confirmación
 */
function deleteClientConfirm(clientId) {
  const ok = confirm("¿Estás seguro de que deseas eliminar este cliente?");
  if (!ok) return;

  try {
    deleteClient(clientId);
    showNotification("Cliente eliminado exitosamente", "success");
    state.currentPage = 1;
    render();
  } catch (error) {
    console.error("Error al eliminar:", error);
    showNotification("Error al eliminar el cliente", "error");
  }
}

/**
 * Notificaciones simples (igual idea, pero mantenible)
 */
function showNotification(message, type = "info") {
  const notification = document.createElement("div");

  const bgClass =
    type === "success" ? "bg-green-500" : type === "error" ? "bg-red-500" : "bg-blue-500";

  notification.className = `fixed top-4 right-4 px-6 py-4 rounded-lg text-white font-semibold shadow-lg z-50 ${bgClass}`;
  notification.textContent = message;

  document.body.appendChild(notification);

  setTimeout(() => notification.remove(), 3000);
}

// Inicializar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", initClientesPage);
