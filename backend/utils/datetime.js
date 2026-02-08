/**
 * Utils de fechas para reservas (goPadel)
 * - toDateTime: arma un Date a partir de una fecha y una hora "HH:mm"
 * - addMinutes: suma minutos a un Date (para calcular fin)
 */

const isValidHHMM = (hhmm) => {
    if (typeof hhmm !== 'string') return false;
    // 00:00 a 23:59
    return /^([01]\d|2[0-3]):([0-5]\d)$/.test(hhmm);
};

/**
 * Convierte una fecha (Date o "YYYY-MM-DD") y una hora "HH:mm" a un objeto Date.
 * Se construye usando la hora local del servidor.
 *
 * @param {Date|string} dateInput - Date o string "YYYY-MM-DD"
 * @param {string} hhmm - Hora "HH:mm"
 * @returns {Date}
 */

const toDateTime = (dateInput, hhmm) => {
    if (!isValidHHMM(hhmm)) {
        throw new Error(`Hora inválida: "${hhmm}". Formato esperado: "HH:mm" (00:00–23:59)`);
    }

    const [hh, mm] = hhmm.split(':').map(Number);

    let baseDate;

    if (dateInput instanceof Date) {
    if (isNaN(dateInput.getTime())) throw new Error('Fecha inválida (Date)');
    baseDate = new Date(dateInput);
    } else if (typeof dateInput === 'string') {
    // Esperamos "YYYY-MM-DD"
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
        throw new Error(`Fecha inválida: "${dateInput}". Formato esperado: "YYYY-MM-DD"`);
    }
    const [y, m, d] = dateInput.split('-').map(Number);
    // En JS: meses 0-11
    baseDate = new Date(y, m - 1, d);
    } else {
    throw new Error('dateInput debe ser Date o string "YYYY-MM-DD"');
    }

    baseDate.setHours(hh, mm, 0, 0);
    return baseDate;
};

/**
 * Suma minutos a un Date y devuelve un nuevo Date.
 * @param {Date} date
 * @param {number} minutes
 * @returns {Date}
 */
const addMinutes = (date, minutes) => {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
    throw new Error('date debe ser un Date válido');
    }
    const mins = Number(minutes);
    if (!Number.isFinite(mins)) throw new Error('minutes debe ser un número válido');

    return new Date(date.getTime() + mins * 60 * 1000);
};

module.exports = {
    toDateTime,
    addMinutes,
};
