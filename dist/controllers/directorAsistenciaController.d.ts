import { Context } from 'hono';
export declare class DirectorAsistenciaController {
    static obtenerAsistenciasGenerales(c: Context): Promise<(Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 400, "json">) | (Response & import("hono").TypedResponse<{
        success: true;
        data: {
            fecha: string;
            asistencias: {
                id: number;
                estudiante: {
                    id: number;
                    codigo: string;
                    nombres: string;
                    apellidos: string;
                    dni: string | null;
                    grado: string;
                    seccion: string;
                    turno: string;
                    gradoId: number;
                };
                portero: {
                    nombres: string;
                    apellidos: string;
                };
                estado: string | null;
                fecha: string;
                hora_entrada: string | null;
                hora_salida: string | null;
                hora: string | undefined;
                observaciones: string | null;
            }[];
        };
    }, import("hono/utils/http-status.js").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 500, "json">)>;
    static obtenerAsistenciasPorFecha(c: Context): Promise<(Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 400, "json">) | (Response & import("hono").TypedResponse<{
        success: true;
        data: {
            fecha: string;
            total: number;
            asistencias: {
                id: number;
                estudiante: {
                    id: number;
                    nombre: string;
                    grado: string;
                    seccion: string;
                    dni: string | null;
                    codigo: string;
                };
                estado: string | null;
                observaciones: string | null;
                fecha: string;
                profesor: {
                    id: number;
                    nombre: string;
                    tipo_profesor: string;
                } | null;
                created_at: string | null;
                updated_at: string | null;
            }[];
        };
    }, import("hono/utils/http-status.js").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 500, "json">)>;
    static justificarAsistencia(c: Context): Promise<(Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 400, "json">) | (Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 404, "json">) | (Response & import("hono").TypedResponse<{
        success: true;
        message: string;
        data: {
            id: number;
            estudiante: string;
            estado: string | null;
            observaciones: string | null;
            updated_at: string | null;
        };
    }, import("hono/utils/http-status.js").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 500, "json">)>;
    static obtenerEstadisticasAsistencias(c: Context): Promise<(Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 400, "json">) | (Response & import("hono").TypedResponse<{
        success: true;
        data: {
            fecha: string;
            estadisticas: {
                total: number;
                presentes: number;
                tardes: number;
                ausentes: number;
                justificados: number;
                salidas: number;
            };
        };
    }, import("hono/utils/http-status.js").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 500, "json">)>;
    static obtenerProfesoresConAsistencia(c: Context): Promise<(Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 400, "json">) | (Response & import("hono").TypedResponse<{
        success: true;
        data: {
            id: number;
            nombre: string;
            tipo_profesor: string;
        }[];
    }, import("hono/utils/http-status.js").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 500, "json">)>;
    static obtenerAsistenciasPorSalon(c: Context): Promise<(Response & import("hono").TypedResponse<{
        success: false;
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
                estado_asistencia: string | null;
                profesor_registro: string | null;
                fecha_registro: string | null;
                observaciones: string | null;
            }[];
            estadisticas: {
                total: number;
                presentes: number;
                ausentes: number;
                tardanzas: number;
                justificados: number;
                sinRegistrar: number;
            };
        };
    }, import("hono/utils/http-status.js").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 500, "json">)>;
    static exportarAsistenciaExcel(c: Context): Promise<Response>;
    private static _generarSemanasDelMes;
}
//# sourceMappingURL=directorAsistenciaController.d.ts.map