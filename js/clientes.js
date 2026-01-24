// Gestión de clientes - Funcionalidad de registro y control

import { validateFullClient } from '../utils/validation.js';
import { saveClient, getAllClients, rucExists, deleteClient, searchClients } from '../utils/storage.js';

// Variables globales
let currentPage = 1;
const itemsPerPage = 5;
let filteredClients = [];

/**
 * Inicializa la página de clientes
 */
export function initClientesPage() {
    const form = document.getElementById('clientForm');
    const searchInput = document.getElementById('searchInput');
    const submitBtn = document.getElementById('submitBtn');

    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }

    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }

    // Cargar clientes iniciales
    loadClients();
}

/**
 * Maneja el envío del formulario de registro
 */
function handleFormSubmit(e) {
    e.preventDefault();

    // Obtener datos del formulario
    const clientData = {
        ruc: document.getElementById('rucInput').value,
        razonSocial: document.getElementById('razonSocialInput').value,
        direccion: document.getElementById('direccionInput').value,
        contacto1Nombre: document.getElementById('contacto1NombreInput').value,
        contacto1Celular: document.getElementById('contacto1CelularInput').value,
        contacto1Email: document.getElementById('contacto1EmailInput').value,
        contacto2Nombre: document.getElementById('contacto2NombreInput').value,
        contacto2Celular: document.getElementById('contacto2CelularInput').value,
        contacto2Email: document.getElementById('contacto2EmailInput').value
    };

    // Validar que el RUC no exista
    if (rucExists(clientData.ruc.trim())) {
        showNotification('Error: El RUC/DNI ya está registrado', 'error');
        return;
    }

    // Validar datos completos
    const validation = validateFullClient(clientData);

    if (!validation.isValid) {
        showNotification('Error: ' + validation.errors.join(', '), 'error');
        return;
    }

    // Guardar cliente
    try {
        saveClient(clientData);
        showNotification('Cliente registrado exitosamente', 'success');
        document.getElementById('clientForm').reset();
        currentPage = 1;
        loadClients();
    } catch (error) {
        console.error('Error al guardar:', error);
        showNotification('Error al guardar el cliente', 'error');
    }
}

/**
 * Carga la lista de clientes en la tabla
 */
function loadClients() {
    const tbody = document.getElementById('clientsTableBody');
    const clients = filteredClients.length > 0 ? filteredClients : getAllClients();

    // Calcular paginación
    const totalPages = Math.ceil(clients.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedClients = clients.slice(startIndex, startIndex + itemsPerPage);

    // Limpiar tabla
    tbody.innerHTML = '';

    if (paginatedClients.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="px-6 py-8 text-center text-gray-500">No hay clientes registrados</td></tr>';
        updatePagination(totalPages, clients.length, 0);
        return;
    }

    // Agregar filas
    paginatedClients.forEach(client => {
        const tr = createClientRow(client);
        tbody.appendChild(tr);
    });

    updatePagination(totalPages, clients.length, paginatedClients.length);
}

/**
 * Crea una fila de tabla para un cliente
 */
function createClientRow(client) {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-colors';

    const contactInfo = client.contacto1
        ? `<div class="flex flex-col"><span class="text-xs font-bold text-gray-800 dark:text-gray-200">${client.contacto1.nombre}</span><span class="text-[11px] text-gray-500">${client.contacto1.celular}</span></div>`
        : '<span class="text-xs text-gray-400">Sin contacto</span>';

    tr.innerHTML = `
        <td class="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">${client.ruc}</td>
        <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">${client.razonSocial}</td>
        <td class="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">${client.direccion}</td>
        <td class="px-6 py-4">${contactInfo}</td>
        <td class="px-6 py-4">
            <div class="flex justify-center gap-2">
                <button class="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Editar" onclick="window.editClient('${client.id}')">
                    <span class="material-symbols-outlined text-[20px]">edit</span>
                </button>
                <button class="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar" onclick="window.deleteClientHandler('${client.id}')">
                    <span class="material-symbols-outlined text-[20px]">delete</span>
                </button>
            </div>
        </td>
    `;

    return tr;
}

/**
 * Actualiza la información de paginación
 */
function updatePagination(totalPages, totalItems, currentItems) {
    const startIndex = (currentPage - 1) * itemsPerPage + 1;
    const endIndex = startIndex + currentItems - 1;
    const countSpan = document.getElementById('clientCountSpan');

    if (countSpan) {
        countSpan.textContent = `Mostrando ${currentItems > 0 ? startIndex : 0} a ${currentItems > 0 ? endIndex : 0} de ${totalItems} clientes`;
    }

    // Actualizar botones de paginación
    updatePaginationButtons(totalPages);
}

/**
 * Actualiza los botones de paginación
 */
function updatePaginationButtons(totalPages) {
    const paginationContainer = document.getElementById('paginationButtons');
    if (!paginationContainer) return;

    paginationContainer.innerHTML = '';

    // Botón anterior
    const prevBtn = document.createElement('button');
    prevBtn.className = 'px-3 py-1 text-xs font-bold text-gray-500 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 transition-colors disabled:opacity-50';
    prevBtn.disabled = currentPage === 1;
    prevBtn.textContent = 'Anterior';
    prevBtn.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            loadClients();
        }
    };
    paginationContainer.appendChild(prevBtn);

    // Botones de página
    for (let i = 1; i <= totalPages; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = i === currentPage
            ? 'px-3 py-1 text-xs font-bold bg-primary text-white rounded shadow-sm'
            : 'px-3 py-1 text-xs font-bold text-gray-500 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 transition-colors';
        pageBtn.textContent = i;
        pageBtn.onclick = () => {
            currentPage = i;
            loadClients();
        };
        paginationContainer.appendChild(pageBtn);
    }

    // Botón siguiente
    const nextBtn = document.createElement('button');
    nextBtn.className = 'px-3 py-1 text-xs font-bold text-gray-500 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 transition-colors disabled:opacity-50';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.textContent = 'Siguiente';
    nextBtn.onclick = () => {
        if (currentPage < totalPages) {
            currentPage++;
            loadClients();
        }
    };
    paginationContainer.appendChild(nextBtn);
}

/**
 * Maneja la búsqueda de clientes
 */
function handleSearch(e) {
    const query = e.target.value;
    currentPage = 1;

    if (!query) {
        filteredClients = [];
        loadClients();
        return;
    }

    filteredClients = searchClients(query);
    loadClients();
}

/**
 * Elimina un cliente con confirmación
 */
function deleteClientConfirm(clientId) {
    if (confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
        try {
            deleteClient(clientId);
            showNotification('Cliente eliminado exitosamente', 'success');
            currentPage = 1;
            loadClients();
        } catch (error) {
            console.error('Error al eliminar:', error);
            showNotification('Error al eliminar el cliente', 'error');
        }
    }
}

/**
 * Muestra una notificación al usuario
 */
function showNotification(message, type = 'info') {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-6 py-4 rounded-lg text-white font-semibold shadow-lg z-50 ${
        type === 'success' ? 'bg-green-500' :
            type === 'error' ? 'bg-red-500' :
                'bg-blue-500'
    }`;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Remover después de 3 segundos
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Exponer funciones globales para los botones inline
window.editClient = (clientId) => {
    console.log('Editar cliente:', clientId);
    showNotification('Función de edición próximamente', 'info');
};

window.deleteClientHandler = deleteClientConfirm;

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initClientesPage);
} else {
    initClientesPage();
}
