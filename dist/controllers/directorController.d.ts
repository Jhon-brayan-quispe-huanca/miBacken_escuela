import { Context } from 'hono';
export declare class DirectorController {
    static obtenerPerfil(c: Context): Promise<(Response & import("hono").TypedResponse<{
        message: string;
    }, 403, "json">) | (Response & import("hono").TypedResponse<{
        message: string;
    }, 404, "json">) | (Response & import("hono").TypedResponse<{
        success: true;
        director: any;
    }, import("hono/utils/http-status.js").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
        message: string;
    }, 500, "json">)>;
    static actualizarPerfil(c: Context): Promise<(Response & import("hono").TypedResponse<{
        message: string;
    }, 403, "json">) | (Response & import("hono").TypedResponse<{
        message: string;
    }, 400, "json">) | (Response & import("hono").TypedResponse<{
        success: true;
        message: string;
        director: any;
    }, import("hono/utils/http-status.js").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
        message: string;
    }, 500, "json">)>;
    static obtenerEstadisticasDashboard(c: Context): Promise<(Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 403, "json">) | (Response & import("hono").TypedResponse<{
        success: true;
        data: {
            estudiantes: number;
            profesores: number;
            grados: number;
            secciones: number;
            usuariosActivos: number;
            permisosPendientes: number;
            asistenciaPromedio: number;
            apoderados: number;
            estudiantesActivos: number;
            profesoresActivos: number;
            asistenciaHoy: number;
            estudiantesPorGrado: {
                grado: string;
                nivel: string;
                cantidad: number;
            }[];
            asistenciaSemana: {
                fecha: string;
                cantidad: number;
            }[];
        };
    }, import("hono/utils/http-status.js").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 408, "json">) | (Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 500, "json">)>;
    static cambiarContrasena(c: Context): Promise<(Response & import("hono").TypedResponse<{
        message: string;
    }, 403, "json">) | (Response & import("hono").TypedResponse<{
        message: string;
    }, 400, "json">) | (Response & import("hono").TypedResponse<{
        message: string;
    }, 404, "json">) | (Response & import("hono").TypedResponse<{
        success: true;
        message: string;
    }, import("hono/utils/http-status.js").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
        message: string;
    }, 500, "json">)>;
    static obtenerAsignaciones(c: Context): Promise<(Response & import("hono").TypedResponse<{
        message: string;
    }, 403, "json">) | (Response & import("hono").TypedResponse<{
        success: true;
        asignaciones: {
            profesores: {
                usuarios: {
                    email: string | null;
                    nombres: string;
                    apellidos: string;
                };
                id: number;
                created_at: string | null;
                updated_at: string | null;
                especialidad: string | null;
                usuario_id: number;
                fecha_ingreso: string | null;
                codigo_profesor: string | null;
                tipo_profesor: string;
            };
            grados: {
                id: number;
                nombre: string;
                nivel: string;
            };
            secciones: {
                id: number;
                nombre: string;
            };
            id: number;
            activo: boolean | null;
            created_at: string | null;
            updated_at: string | null;
            profesor_id: number;
            grado_id: number;
            seccion_id: number;
            es_tutor: boolean | null;
            anio_escolar: number;
        }[];
    }, import("hono/utils/http-status.js").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
        message: string;
    }, 500, "json">)>;
    static crearAsignacion(c: Context): Promise<(Response & import("hono").TypedResponse<{
        message: string;
    }, 403, "json">) | (Response & import("hono").TypedResponse<{
        message: string;
    }, 400, "json">) | (Response & import("hono").TypedResponse<{
        message: string;
    }, 404, "json">) | (Response & import("hono").TypedResponse<{
        success: true;
        message: string;
        asignacion: {
            profesores: {
                usuarios: {
                    email: string | null;
                    nombres: string;
                    apellidos: string;
                };
                id: number;
                created_at: string | null;
                updated_at: string | null;
                especialidad: string | null;
                usuario_id: number;
                fecha_ingreso: string | null;
                codigo_profesor: string | null;
                tipo_profesor: string;
            };
            grados: {
                id: number;
                nombre: string;
                nivel: string;
            };
            secciones: {
                id: number;
                nombre: string;
            };
            id: number;
            activo: boolean | null;
            created_at: string | null;
            updated_at: string | null;
            profesor_id: number;
            grado_id: number;
            seccion_id: number;
            es_tutor: boolean | null;
            anio_escolar: number;
        };
    }, 201, "json">) | (Response & import("hono").TypedResponse<{
        message: string;
        error: string;
        details: string | undefined;
    }, 500, "json">)>;
    static actualizarAsignacion(c: Context): Promise<(Response & import("hono").TypedResponse<{
        message: string;
    }, 403, "json">) | (Response & import("hono").TypedResponse<{
        message: string;
    }, 404, "json">) | (Response & import("hono").TypedResponse<{
        success: true;
        message: string;
        asignacion: {
            profesores: {
                usuarios: {
                    email: string | null;
                    nombres: string;
                    apellidos: string;
                };
                id: number;
                created_at: string | null;
                updated_at: string | null;
                especialidad: string | null;
                usuario_id: number;
                fecha_ingreso: string | null;
                codigo_profesor: string | null;
                tipo_profesor: string;
            };
            grados: {
                id: number;
                nombre: string;
                nivel: string;
            };
            secciones: {
                id: number;
                nombre: string;
            };
            id: number;
            activo: boolean | null;
            created_at: string | null;
            updated_at: string | null;
            profesor_id: number;
            grado_id: number;
            seccion_id: number;
            es_tutor: boolean | null;
            anio_escolar: number;
        };
    }, import("hono/utils/http-status.js").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
        message: string;
    }, 500, "json">)>;
    static eliminarAsignacion(c: Context): Promise<(Response & import("hono").TypedResponse<{
        message: string;
    }, 403, "json">) | (Response & import("hono").TypedResponse<{
        message: string;
    }, 404, "json">) | (Response & import("hono").TypedResponse<{
        success: true;
        message: string;
    }, import("hono/utils/http-status.js").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
        message: string;
    }, 500, "json">)>;
    static obtenerGrados(c: Context): Promise<(Response & import("hono").TypedResponse<{
        message: string;
    }, 403, "json">) | (Response & import("hono").TypedResponse<{
        success: true;
        grados: {
            id: number;
            nombre: string;
            nivel: string;
        }[];
    }, import("hono/utils/http-status.js").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
        message: string;
    }, 500, "json">)>;
    static obtenerSecciones(c: Context): Promise<(Response & import("hono").TypedResponse<{
        message: string;
    }, 403, "json">) | (Response & import("hono").TypedResponse<{
        success: true;
        secciones: {
            id: number;
            nombre: string;
        }[];
    }, import("hono/utils/http-status.js").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
        message: string;
    }, 500, "json">)>;
    static obtenerMaterias(c: Context): Promise<(Response & import("hono").TypedResponse<{
        message: string;
    }, 403, "json">) | (Response & import("hono").TypedResponse<{
        success: true;
        materias: never[];
    }, import("hono/utils/http-status.js").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
        message: string;
    }, 500, "json">)>;
    static obtenerProfesores(c: Context): Promise<(Response & import("hono").TypedResponse<{
        message: string;
    }, 403, "json">) | (Response & import("hono").TypedResponse<{
        success: true;
        profesores: {
            usuarios: {
                email: string | null;
                id: number;
                nombres: string;
                apellidos: string;
                activo: boolean | null;
            };
            id: number;
            created_at: string | null;
            updated_at: string | null;
            especialidad: string | null;
            usuario_id: number;
            fecha_ingreso: string | null;
            codigo_profesor: string | null;
            tipo_profesor: string;
        }[];
    }, import("hono/utils/http-status.js").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
        message: string;
    }, 500, "json">)>;
    static obtenerAsistenciaPorSalon(c: Context): Promise<(Response & import("hono").TypedResponse<{
        message: string;
    }, 403, "json">) | (Response & import("hono").TypedResponse<{
        message: string;
    }, 400, "json">) | (Response & import("hono").TypedResponse<{
        success: true;
        data: {
            fecha: string;
            grado_id: number;
            seccion_id: number;
            estudiantes: {
                estudiante_id: number;
                codigo_estudiante: string;
                nombre_completo: string;
                nombres: string;
                apellidos: string;
                dni: string | null;
                grado: string;
                nivel: string;
                seccion: string;
                estado_asistencia: any;
                profesor_registro: string | null;
                fecha_registro: any;
                observaciones: any;
            }[];
            estadisticas: {
                total_estudiantes: number;
                presentes: number;
                ausentes: number;
                tardanzas: number;
                justificados: number;
                sin_registrar: number;
            };
        };
    }, import("hono/utils/http-status.js").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
        message: string;
    }, 500, "json">)>;
    static obtenerEstadisticas(c: Context): Promise<(Response & import("hono").TypedResponse<{
        message: string;
    }, 403, "json">) | (Response & import("hono").TypedResponse<{
        success: true;
        data: {
            estudiantes: number;
            profesores: number;
            grados: number;
            secciones: number;
            usuariosActivos: number;
            permisosPendientes: number;
            asistenciaPromedio: number;
        };
    }, import("hono/utils/http-status.js").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 500, "json">)>;
}
//# sourceMappingURL=directorController.d.ts.map