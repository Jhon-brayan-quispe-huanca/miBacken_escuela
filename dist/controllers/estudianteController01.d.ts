import { Context } from 'hono';
export declare class EstudianteController01 {
    static obtenerPerfil(c: Context): Promise<(Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 403, "json">) | (Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 404, "json">) | (Response & import("hono").TypedResponse<{
        success: true;
        data: {
            id: number;
            nombres: string;
            apellidos: string;
            dni: string | null;
            email: string | null;
            telefono: string | null;
            direccion: string | null;
            grado: string;
            seccion: string;
            codigoEstudiante: string;
            fechaIngreso: string | null;
            estado: string | null;
            turno: string;
        };
        message: string;
    }, import("hono/utils/http-status.js").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 500, "json">)>;
    static actualizarPerfil(c: Context): Promise<(Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 403, "json">) | (Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 400, "json">) | (Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 404, "json">) | (Response & import("hono").TypedResponse<{
        success: true;
        data: {
            turno: string;
            id: number;
            email: string | null;
            nombres: string;
            apellidos: string;
            telefono: string | null;
            direccion: string | null;
            updated_at: string | null;
        };
        message: string;
    }, import("hono/utils/http-status.js").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 500, "json">)>;
    static obtenerDashboard(c: Context): Promise<(Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 403, "json">) | (Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 404, "json">) | (Response & import("hono").TypedResponse<{
        success: true;
        data: {
            estudiante: {
                id: number;
                nombres: string;
                apellidos: string;
                grado: string;
                seccion: string;
            };
            asistenciaHoy: {
                presente: number;
                total: number;
                porcentaje: number;
            };
            asistenciasHoy: {
                fecha: string;
                horaEntrada: string | null;
                horaSalida: string | null;
                estado: string | null;
                observaciones: string | null;
            }[];
            estadisticas: {
                porcentajeAsistenciaGeneral: number;
                diasPresente: number;
                diasTotal: number;
            };
        };
        message: string;
    }, import("hono/utils/http-status.js").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 500, "json">)>;
    static obtenerHistorialAsistencias(c: Context): Promise<(Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 403, "json">) | (Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 404, "json">) | (Response & import("hono").TypedResponse<{
        success: true;
        data: ({
            fecha: string;
            materia: string;
            presente: boolean;
            horaEntrada: string;
            observaciones: null;
        } | {
            fecha: string;
            materia: string;
            presente: boolean;
            horaEntrada: null;
            observaciones: string;
        })[];
        message: string;
    }, import("hono/utils/http-status.js").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 500, "json">)>;
    static registrarAsistencia(c: Context): Promise<(Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 403, "json">) | (Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 400, "json">) | (Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 404, "json">) | (Response & import("hono").TypedResponse<{
        success: true;
        data: {
            estudianteId: number;
            materia: any;
            presente: any;
            fecha: string;
            horaRegistro: string;
            observaciones: any;
        };
        message: string;
    }, 201, "json">) | (Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 500, "json">)>;
    static obtenerHorario(c: Context): Promise<(Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 403, "json">) | (Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 404, "json">) | (Response & import("hono").TypedResponse<{
        success: true;
        data: {
            lunes: {
                hora: string;
                materia: string;
                profesor: string;
            }[];
            martes: {
                hora: string;
                materia: string;
                profesor: string;
            }[];
            miercoles: {
                hora: string;
                materia: string;
                profesor: string;
            }[];
            jueves: {
                hora: string;
                materia: string;
                profesor: string;
            }[];
            viernes: {
                hora: string;
                materia: string;
                profesor: string;
            }[];
        };
        message: string;
    }, import("hono/utils/http-status.js").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 500, "json">)>;
    static actualizarTurno(c: Context): Promise<(Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 403, "json">) | (Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 400, "json">) | (Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 404, "json">) | (Response & import("hono").TypedResponse<{
        success: true;
        data: {
            id: number;
            turno: string;
            nombres: string;
            apellidos: string;
        };
        message: string;
    }, import("hono/utils/http-status.js").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 500, "json">)>;
}
//# sourceMappingURL=estudianteController01.d.ts.map