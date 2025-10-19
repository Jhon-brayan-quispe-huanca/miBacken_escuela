import { Context } from 'hono';
/**
 * Controller específico para las funcionalidades del profesor
 * Este controller maneja las operaciones que los profesores realizan
 * desde su área en la aplicación Flutter
 */
export declare class ProfesorController01 {
    static marcarAsistenciaJustificadaAutomaticamente(estudianteId: number, profesorId: number, permiso: any): Promise<any>;
    /**
     * Obtener información del profesor por usuario ID
     * GET /profesor/:usuarioId
     */
    static obtenerProfesorPorUsuarioId(c: Context): Promise<(Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 400, "json">) | (Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 404, "json">) | (Response & import("hono").TypedResponse<{
        success: true;
        data: {
            id: any;
            nombres: any;
            apellidos: any;
            email: any;
            tipo_profesor: any;
            asignaciones: any;
        };
    }, import("hono/utils/http-status.js").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 500, "json">)>;
    /**
     * Obtener estadísticas generales para el dashboard del profesor
     */
    static obtenerDashboard(c: Context): Promise<(Response & import("hono").TypedResponse<{
        message: string;
    }, 401, "json">) | (Response & import("hono").TypedResponse<{
        message: string;
    }, 403, "json">) | (Response & import("hono").TypedResponse<{
        message: string;
    }, 404, "json">) | (Response & import("hono").TypedResponse<{
        success: true;
        data: {
            totalAsignaciones: any;
            totalEstudiantes: any;
            asistenciasHoy: any;
            asignaciones: any;
        };
    }, import("hono/utils/http-status.js").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
        message: string;
    }, 500, "json">)>;
    /**
     * Obtener información del perfil del profesor
     */
    static obtenerPerfil(c: Context): Promise<(Response & import("hono").TypedResponse<{
        message: string;
    }, 403, "json">) | (Response & import("hono").TypedResponse<{
        message: string;
    }, 404, "json">) | (Response & import("hono").TypedResponse<{
        success: true;
        data: {
            id: any;
            nombres: any;
            apellidos: any;
            email: any;
            dni: any;
            telefono: any;
            especialidad: any;
            fechaIngreso: any;
        };
    }, import("hono/utils/http-status.js").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
        message: string;
    }, 500, "json">)>;
    /**
     * Actualizar información del perfil del profesor
     */
    static actualizarPerfil(c: Context): Promise<(Response & import("hono").TypedResponse<{
        message: string;
    }, 403, "json">) | (Response & import("hono").TypedResponse<{
        message: string;
    }, 404, "json">) | (Response & import("hono").TypedResponse<{
        success: true;
        message: string;
    }, import("hono/utils/http-status.js").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
        message: string;
    }, 500, "json">)>;
    /**
     * Obtener asignaciones del profesor (grados y secciones)
     */
    static obtenerAsignaciones(c: Context): Promise<(Response & import("hono").TypedResponse<{
        message: string;
    }, 403, "json">) | (Response & import("hono").TypedResponse<{
        message: string;
    }, 404, "json">) | (Response & import("hono").TypedResponse<{
        success: true;
        data: any;
    }, import("hono/utils/http-status.js").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
        message: string;
    }, 500, "json">)>;
    /**
     * Obtener estudiantes de una asignación específica
     */
    static obtenerEstudiantesAsignacion(c: Context): Promise<(Response & import("hono").TypedResponse<{
        message: string;
    }, 403, "json">) | (Response & import("hono").TypedResponse<{
        message: string;
    }, 404, "json">) | (Response & import("hono").TypedResponse<{
        success: true;
        data: any[];
    }, import("hono/utils/http-status.js").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
        message: string;
    }, 500, "json">)>;
    /**
     * Registrar asistencia de estudiantes
     */
    static registrarAsistencia(c: Context): Promise<(Response & import("hono").TypedResponse<{
        message: string;
    }, 403, "json">) | (Response & import("hono").TypedResponse<{
        message: string;
    }, 404, "json">) | (Response & import("hono").TypedResponse<{
        success: true;
        message: string;
    }, import("hono/utils/http-status.js").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
        message: string;
    }, 500, "json">)>;
    /**
     * Obtener asignaciones del profesor para filtrado
     */
    static obtenerAsignacionesParaFiltro(c: Context): Promise<(Response & import("hono").TypedResponse<{
        message: string;
    }, 403, "json">) | (Response & import("hono").TypedResponse<{
        message: string;
    }, 404, "json">) | (Response & import("hono").TypedResponse<{
        success: true;
        data: any;
        message: string;
    }, import("hono/utils/http-status.js").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
        message: string;
    }, 500, "json">)>;
    /**
     * Obtener reportes de asistencia
     */
    static obtenerReportes(c: Context): Promise<(Response & import("hono").TypedResponse<{
        message: string;
    }, 403, "json">) | (Response & import("hono").TypedResponse<{
        message: string;
    }, 404, "json">) | (Response & import("hono").TypedResponse<{
        success: true;
        data: any;
    }, import("hono/utils/http-status.js").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
        message: string;
    }, 500, "json">)>;
    /**
     * Obtener estadísticas de asistencia por materia
     */
    static obtenerEstadisticasAsistencia(c: Context): Promise<(Response & import("hono").TypedResponse<{
        message: string;
    }, 403, "json">) | (Response & import("hono").TypedResponse<{
        message: string;
    }, 404, "json">) | (Response & import("hono").TypedResponse<{
        success: true;
        data: any[];
    }, import("hono/utils/http-status.js").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
        message: string;
    }, 500, "json">)>;
    /**
     * Actualizar asistencia existente
     */
    static actualizarAsistencia(c: Context): Promise<(Response & import("hono").TypedResponse<{
        message: string;
    }, 403, "json">) | (Response & import("hono").TypedResponse<{
        message: string;
    }, 404, "json">) | (Response & import("hono").TypedResponse<{
        success: true;
        message: string;
        data: {
            id: any;
            fecha: any;
            estado: any;
            observaciones: any;
            estudiante: {
                nombres: any;
                apellidos: any;
                dni: any;
            };
        };
    }, import("hono/utils/http-status.js").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
        message: string;
    }, 500, "json">)>;
    /**
     * Obtener estadísticas del dashboard del profesor
     * GET /profesor/:usuarioId/estadisticas
     */
    static obtenerEstadisticasDashboard(c: Context): Promise<(Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 400, "json">) | (Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 404, "json">) | (Response & import("hono").TypedResponse<{
        success: true;
        data: {
            resumenHoy: {
                asistenciasRegistradas: any;
                estudiantesAusentes: any;
                permisosPendientes: any;
            };
            estadisticasPorAsignacion: any[];
        };
    }, import("hono/utils/http-status.js").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 500, "json">)>;
}
//# sourceMappingURL=profesorController01.d.ts.map