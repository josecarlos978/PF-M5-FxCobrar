// Sistema de almacenamiento en localStorage

const CLIENTS_KEY = 'awfacturas_clientes';

/**
 * Obtiene todos los clientes del localStorage
 * @returns {Array} Array de clientes
 */
export function getAllClients() {
    try {
        const data = localStorage.getItem(CLIENTS_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error al obtener clientes:', error);
        return [];
    }
}

/**
 * Obtiene un cliente por su RUC
 * @param {string} ruc - El RUC del cliente
 * @returns {Object|null} El cliente si existe, null en caso contrario
 */
export function getClientByRUC(ruc) {
    const clients = getAllClients();
    return clients.find(client => client.ruc === ruc) || null;
}

/**
 * Verifica si un RUC ya existe en la base de datos
 * @param {string} ruc - El RUC a verificar
 * @returns {boolean} true si existe, false en caso contrario
 */
export function rucExists(ruc) {
    return getClientByRUC(ruc) !== null;
}

/**
 * Guarda un nuevo cliente en localStorage
 * @param {Object} clientData - Los datos del cliente
 * @returns {Object} El cliente guardado con ID
 */
export function saveClient(clientData) {
    try {
        const clients = getAllClients();

        // Crear objeto del cliente con ID único (timestamp + random)
        const newClient = {
            id: `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            ruc: clientData.ruc.trim(),
            razonSocial: clientData.razonSocial.trim(),
            direccion: clientData.direccion.trim(),
            contacto1: {
                nombre: clientData.contacto1Nombre.trim(),
                celular: clientData.contacto1Celular.trim(),
                email: clientData.contacto1Email.trim()
            },
            contacto2: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // Agregar contacto secundario si existe
        if (clientData.contacto2Nombre || clientData.contacto2Celular || clientData.contacto2Email) {
            newClient.contacto2 = {
                nombre: clientData.contacto2Nombre.trim(),
                celular: clientData.contacto2Celular.trim(),
                email: clientData.contacto2Email.trim()
            };
        }

        // Agregar a la lista y guardar
        clients.push(newClient);
        localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));

        return newClient;
    } catch (error) {
        console.error('Error al guardar cliente:', error);
        throw error;
    }
}

/**
 * Actualiza un cliente existente
 * @param {string} clientId - El ID del cliente
 * @param {Object} updatedData - Los datos actualizados
 * @returns {Object} El cliente actualizado
 */
export function updateClient(clientId, updatedData) {
    try {
        const clients = getAllClients();
        const index = clients.findIndex(c => c.id === clientId);

        if (index === -1) {
            throw new Error('Cliente no encontrado');
        }

        // Actualizar datos
        clients[index] = {
            ...clients[index],
            ruc: updatedData.ruc.trim(),
            razonSocial: updatedData.razonSocial.trim(),
            direccion: updatedData.direccion.trim(),
            contacto1: {
                nombre: updatedData.contacto1Nombre.trim(),
                celular: updatedData.contacto1Celular.trim(),
                email: updatedData.contacto1Email.trim()
            },
            contacto2: null,
            updatedAt: new Date().toISOString()
        };

        // Agregar contacto secundario si existe
        if (updatedData.contacto2Nombre || updatedData.contacto2Celular || updatedData.contacto2Email) {
            clients[index].contacto2 = {
                nombre: updatedData.contacto2Nombre.trim(),
                celular: updatedData.contacto2Celular.trim(),
                email: updatedData.contacto2Email.trim()
            };
        }

        localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
        return clients[index];
    } catch (error) {
        console.error('Error al actualizar cliente:', error);
        throw error;
    }
}

/**
 * Elimina un cliente
 * @param {string} clientId - El ID del cliente a eliminar
 * @returns {boolean} true si se eliminó, false en caso contrario
 */
export function deleteClient(clientId) {
    try {
        const clients = getAllClients();
        const index = clients.findIndex(c => c.id === clientId);

        if (index === -1) {
            return false;
        }

        clients.splice(index, 1);
        localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
        return true;
    } catch (error) {
        console.error('Error al eliminar cliente:', error);
        throw error;
    }
}

/**
 * Busca clientes por RUC o razón social
 * @param {string} query - Término de búsqueda
 * @returns {Array} Clientes que coinciden con la búsqueda
 */
export function searchClients(query) {
    if (!query) return getAllClients();

    const lowerQuery = query.toLowerCase();
    const clients = getAllClients();

    return clients.filter(client =>
        client.ruc.toLowerCase().includes(lowerQuery) ||
        client.razonSocial.toLowerCase().includes(lowerQuery)
    );
}

/**
 * Obtiene estadísticas de clientes
 * @returns {Object} Estadísticas
 */
export function getClientStats() {
    const clients = getAllClients();
    return {
        totalClientes: clients.length,
        clientesActivos: clients.length
    };
}
