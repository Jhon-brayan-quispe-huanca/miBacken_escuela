import { Context } from 'hono';
/**
 * Controller específico para las funcionalidades del profesor
 * Este controller maneja las operaciones que los profesores realizan
 * desde su área en la aplicación Flutter
 */
export declare class ProfesorController01 {
    static marcarAsistenciaJustificadaAutomaticamente(estudianteId: number, profesorId: number, permiso: any): Promise<{
        id: number;
        created_at: Date | null;
        updated_at: Date | null;
        estado: string | null;
        fecha: Date;
        estudiante_id: number;
        observaciones: string | null;
        permiso_id: number | null;
        profesor_id: number;
    }>;
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
            id: number;
            nombres: string;
            apellidos: string;
            email: string | null;
            tipo_profesor: string;
            asignaciones: {
                id: number;
                grado: string;
                seccion: string;
                es_tutor: boolean | null;
                anio_escolar: number;
            }[];
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
            totalAsignaciones: number;
            totalEstudiantes: number;
            asistenciasHoy: number;
            asignaciones: {
                id: number;
                grado: string;
                seccion: string;
                esTutor: boolean | null;
                anioEscolar: number;
            }[];
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
            id: number;
            nombres: string;
            apellidos: string;
            email: string | null;
            dni: string | null;
            telefono: string | null;
            especialidad: string | null;
            fechaIngreso: string | null;
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
        data: {
            id: number;
            grado: string;
            seccion: string;
            gradoId: number;
            seccionId: number;
            esTutor: boolean | null;
            anioEscolar: number;
            activo: boolean | null;
        }[];
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
        data: {
            id: number;
            nombres: string;
            apellidos: string;
            dni: string | null;
            tiene_permiso_activo: boolean;
            asistenciaHoy: {
                id: number;
                created_at: string | null;
                updated_at: string | null;
                estado: string | null;
                fecha: string;
                estudiante_id: number;
                observaciones: string | null;
                permiso_id: number | null;
                profesor_id: number;
            } | null;
            permisos: {
                id: number;
                motivo: string;
                fecha_inicio: string;
                fecha_fin: string | null;
            }[];
        }[];
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
        data: {
            id: number;
            grado_id: number;
            seccion_id: number;
            grado_nombre: string;
            grado_nivel: string;
            seccion_nombre: string;
            display_name: string;
            anio_escolar: number;
        }[];
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
        data: {
            id: any;
            estudiante_id: number;
            profesor_id: number;
            materia_id: number;
            fecha: string;
            estado: any;
            observaciones: any;
            estudiante: {
                id: number;
                nombres: string;
                apellidos: string;
                dni: string | null;
                nombreCompleto: string;
            };
            materia: null;
            grado: string;
            seccion: string;
        }[];
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
        data: {
            asignacionId: number;
            grado: string;
            seccion: string;
            esTutor: boolean | null;
            anioEscolar: number;
            totalEstudiantes: number;
            totalAsistencias: number;
            asistenciasPresentes: number;
            porcentajeAsistencia: number;
        }[];
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
            id: number;
            fecha: string;
            estado: string | null;
            observaciones: string | null;
            estudiante: {
                nombres: string;
                apellidos: string;
                dni: string | null;
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
                asistenciasRegistradas: number;
                estudiantesAusentes: number;
                permisosPendientes: number;
            };
            estadisticasPorAsignacion: {
                grado: string;
                seccion: string;
                estudiantes: number;
                asistenciaPromedio: number;
            }[];
        };
    }, import("hono/utils/http-status.js").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 500, "json">)>;
}
//# sourceMappingURL=profesorController01.d.ts.map