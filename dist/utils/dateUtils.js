import * as moment from 'moment-timezone';
// Zona horaria de Perú
const PERU_TIMEZONE = 'America/Lima';
/**
 * Obtiene la fecha actual en zona horaria de Perú
 */
export function getFechaActualPeru() {
    return moment.default().tz(PERU_TIMEZONE).format('YYYY-MM-DD');
}
/**
 * Obtiene la hora actual en zona horaria de Perú
 */
export function getHoraActualPeru() {
    return moment.default().tz(PERU_TIMEZONE).format('HH:mm:ss');
}
/**
 * Obtiene la hora actual en zona horaria de Perú como Date para campos TIME de la BD
 */
export function getHoraActualPeruParaBD() {
    const horaString = moment.default().tz(PERU_TIMEZONE).format('HH:mm:ss');
    return new Date(`1970-01-01T${horaString}Z`);
}
/**
 * Obtiene la fecha y hora actual en zona horaria de Perú
 */
export function getFechaHoraActualPeru() {
    return moment.default().tz(PERU_TIMEZONE).toDate();
}
/**
 * Convierte una fecha a zona horaria de Perú
 */
export function convertirAZonaHorariaPeru(fecha) {
    return moment.default(fecha).tz(PERU_TIMEZONE);
}
/**
 * Formatea una fecha en zona horaria de Perú
 */
export function formatearFechaPeru(fecha, formato = 'YYYY-MM-DD') {
    return moment.default(fecha).tz(PERU_TIMEZONE).format(formato);
}
/**
 * Formatea una hora en zona horaria de Perú
 */
export function formatearHoraPeru(fecha, formato = 'HH:mm') {
    return moment.default(fecha).tz(PERU_TIMEZONE).format(formato);
}
/**
 * Verifica si una fecha es hoy en zona horaria de Perú
 */
export function esHoyEnPeru(fecha) {
    const fechaPeru = moment.default(fecha).tz(PERU_TIMEZONE).format('YYYY-MM-DD');
    const hoyPeru = getFechaActualPeru();
    return fechaPeru === hoyPeru;
}
/**
 * Obtiene el inicio del día en zona horaria de Perú
 */
export function getInicioDiaPeru(fecha) {
    const fechaBase = fecha ? moment.default(fecha) : moment.default();
    return fechaBase.tz(PERU_TIMEZONE).startOf('day').toDate();
}
/**
 * Obtiene el fin del día en zona horaria de Perú
 */
export function getFinDiaPeru(fecha) {
    const fechaBase = fecha ? moment.default(fecha) : moment.default();
    return fechaBase.tz(PERU_TIMEZONE).endOf('day').toDate();
}
//# sourceMappingURL=dateUtils.js.map