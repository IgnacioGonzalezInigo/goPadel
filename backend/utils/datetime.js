/**
 * Utils de fechas para reservas (goPadel)
 * - toDateTime: arma un Date a partir de una fecha y una hora "HH:mm"
 * - addMinutes: suma minutos a un Date (para calcular fin)
 */

const isValidHHMM = (hhmm) => {
    if (typeof hhmm !== 'string') return false;
    return /^([01]\d|2[0-3]):([0-5]\d)$/.test(hhmm);
};

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
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
        throw new Error(`Fecha inválida: "${dateInput}". Formato esperado: "YYYY-MM-DD"`);
    }
    const [y, m, d] = dateInput.split('-').map(Number);
    baseDate = new Date(y, m - 1, d);
    } else {
    throw new Error('dateInput debe ser Date o string "YYYY-MM-DD"');
    }

    baseDate.setHours(hh, mm, 0, 0);
    return baseDate;
};

const addMinutes = (date, minutes) => {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
    throw new Error('date debe ser un Date válido');
    }
    const mins = Number(minutes);
    if (!Number.isFinite(mins)) throw new Error('minutes debe ser un número válido');

    return new Date(date.getTime() + mins * 60 * 1000);
};

module.exports = { toDateTime, addMinutes };
