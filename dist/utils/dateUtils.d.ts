import * as moment from 'moment-timezone';
/**
 * Obtiene la fecha actual en zona horaria de Perú
 */
export declare function getFechaActualPeru(): string;
/**
 * Obtiene la hora actual en zona horaria de Perú
 */
export declare function getHoraActualPeru(): string;
/**
 * Obtiene la hora actual en zona horaria de Perú como Date para campos TIME de la BD
 */
export declare function getHoraActualPeruParaBD(): Date;
/**
 * Obtiene la fecha y hora actual en zona horaria de Perú
 */
export declare function getFechaHoraActualPeru(): Date;
/**
 * Convierte una fecha a zona horaria de Perú
 */
export declare function convertirAZonaHorariaPeru(fecha: Date | string): moment.Moment;
/**
 * Formatea una fecha en zona horaria de Perú
 */
export declare function formatearFechaPeru(fecha: Date | string, formato?: string): string;
/**
 * Formatea una hora en zona horaria de Perú
 */
export declare function formatearHoraPeru(fecha: Date | string, formato?: string): string;
/**
 * Verifica si una fecha es hoy en zona horaria de Perú
 */
export declare function esHoyEnPeru(fecha: Date | string): boolean;
/**
 * Obtiene el inicio del día en zona horaria de Perú
 */
export declare function getInicioDiaPeru(fecha?: Date | string): Date;
/**
 * Obtiene el fin del día en zona horaria de Perú
 */
export declare function getFinDiaPeru(fecha?: Date | string): Date;
//# sourceMappingURL=dateUtils.d.ts.map