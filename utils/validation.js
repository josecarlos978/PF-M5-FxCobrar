// Validación de campos del formulario

/**
 * Valida que un RUC/DNI tenga el formato correcto
 * @param {string} ruc - El RUC o DNI a validar
 * @returns {boolean} true si es válido
 */
export function isValidRUC(ruc) {
    if (!ruc) return false;
    // RUC: 11 dígitos, DNI: 8 dígitos
    const rucPattern = /^(\d{8}|\d{11})$/;
    return rucPattern.test(ruc.trim());
}

/**
 * Valida que un email tenga formato correcto
 * @param {string} email - El email a validar
 * @returns {boolean} true si es válido
 */
export function isValidEmail(email) {
    if (!email) return false;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email.trim());
}

/**
 * Valida que un número de celular tenga formato correcto (9 dígitos)
 * @param {string} phone - El teléfono a validar
 * @returns {boolean} true si es válido
 */
export function isValidPhone(phone) {
    if (!phone) return false;
    const phonePattern = /^\d{9}$/;
    return phonePattern.test(phone.trim());
}

/**
 * Valida que un campo no esté vacío
 * @param {string} value - El valor a validar
 * @returns {boolean} true si no está vacío
 */
export function isNotEmpty(value) {
    return value && value.trim().length > 0;
}

/**
 * Valida los datos generales del cliente
 * @param {Object} clientData - Datos del cliente {ruc, razonSocial, direccion}
 * @returns {Object} {isValid: boolean, errors: string[]}
 */
export function validateClientData(clientData) {
    const errors = [];

    if (!isNotEmpty(clientData.ruc)) {
        errors.push('El RUC/DNI es obligatorio');
    } else if (!isValidRUC(clientData.ruc)) {
        errors.push('El RUC/DNI debe tener 8 ó 11 dígitos');
    }

    if (!isNotEmpty(clientData.razonSocial)) {
        errors.push('La razón social es obligatoria');
    }

    if (!isNotEmpty(clientData.direccion)) {
        errors.push('La dirección es obligatoria');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Valida los datos de un contacto
 * @param {Object} contactData - Datos del contacto {nombre, celular, email}
 * @param {boolean} isRequired - Si el contacto es obligatorio
 * @returns {Object} {isValid: boolean, errors: string[]}
 */
export function validateContact(contactData, isRequired = true) {
    const errors = [];
    const hasData = isNotEmpty(contactData.nombre) || isNotEmpty(contactData.celular) || isNotEmpty(contactData.email);

    // Si no es requerido y no tiene datos, es válido
    if (!isRequired && !hasData) {
        return { isValid: true, errors: [] };
    }

    // Si tiene datos parciales o es requerido
    if (isRequired || hasData) {
        if (!isNotEmpty(contactData.nombre)) {
            errors.push('El nombre del contacto es obligatorio');
        }

        if (!isNotEmpty(contactData.celular)) {
            errors.push('El celular es obligatorio');
        } else if (!isValidPhone(contactData.celular)) {
            errors.push('El celular debe tener 9 dígitos');
        }

        if (!isNotEmpty(contactData.email)) {
            errors.push('El email es obligatorio');
        } else if (!isValidEmail(contactData.email)) {
            errors.push('El email no es válido');
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Valida todos los datos de un cliente incluyendo contactos
 * @param {Object} fullClientData - Datos completos incluyendo contactos
 * @returns {Object} {isValid: boolean, errors: string[]}
 */
export function validateFullClient(fullClientData) {
    const allErrors = [];

    // Validar datos generales
    const clientValidation = validateClientData({
        ruc: fullClientData.ruc,
        razonSocial: fullClientData.razonSocial,
        direccion: fullClientData.direccion
    });

    if (!clientValidation.isValid) {
        allErrors.push(...clientValidation.errors);
    }

    // Validar contacto principal (obligatorio)
    const contact1Validation = validateContact({
        nombre: fullClientData.contacto1Nombre,
        celular: fullClientData.contacto1Celular,
        email: fullClientData.contacto1Email
    }, true);

    if (!contact1Validation.isValid) {
        allErrors.push(...contact1Validation.errors.map(e => `Contacto 1: ${e}`));
    }

    // Validar contacto secundario (opcional)
    const contact2Validation = validateContact({
        nombre: fullClientData.contacto2Nombre,
        celular: fullClientData.contacto2Celular,
        email: fullClientData.contacto2Email
    }, false);

    if (!contact2Validation.isValid) {
        allErrors.push(...contact2Validation.errors.map(e => `Contacto 2: ${e}`));
    }

    return {
        isValid: allErrors.length === 0,
        errors: allErrors
    };
}
