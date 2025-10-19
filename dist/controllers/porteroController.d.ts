import { Context } from 'hono';
export declare class PorteroController {
    private static marcarAsistenciaJustificadaAutomaticamente;
    static obtenerPerfil(c: Context): Promise<(Response & import("hono").TypedResponse<{
        message: string;
    }, 403, "json">) | (Response & import("hono").TypedResponse<{
        message: string;
    }, 404, "json">) | (Response & import("hono").TypedResponse<{
        success: true;
        portero: any;
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
        portero: any;
    }, import("hono/utils/http-status.js").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
        message: string;
    }, 500, "json">)>;
    static obtenerDashboard(c: Context): Promise<(Response & import("hono").TypedResponse<{
        message: string;
    }, 403, "json">) | (Response & import("hono").TypedResponse<{
        success: true;
        estadisticas: {
            estudiantesHoy: any;
            asistenciasHoy: any;
            tardanzasHoy: any;
            ausenciasHoy: any;
            justificadosHoy: any;
            presentesHoy: any;
            porcentajeAsistencia: number;
            tendencia: number;
            estudiantesConPermisos: any;
            horaPromedioLlegada: string;
            asistenciasAyer: any;
            presentesAyer: any;
        };
        asistencias: {
            id: string | number;
            fecha: string;
            hora: string;
            estado: "entrada" | "salida";
            estado_asistencia: "Presente" | "Tarde" | "Ausente" | "Justificado";
            es_tardanza: boolean;
            estudiante: {
                id: number;
                codigo_estudiante: string;
                nombres: string;
                apellidos: string;
                grado: string;
                seccion: string;
                turno: string;
            };
        }[];
    }, import("hono/utils/http-status.js").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
        message: string;
    }, 500, "json">)>;
    static procesarEscaneoQR(c: Context): Promise<(Response & import("hono").TypedResponse<{
        message: string;
    }, 403, "json">) | (Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 400, "json">) | (Response & import("hono").TypedResponse<{
        success: boolean;
        message: string;
        tipo: "entrada" | "salida";
        estado: "Presente" | "Tarde" | "Ausente";
        hora: string;
        estudiante?: any;
        asistencia?: any;
    }, 400 | 200, "json">) | (Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 500, "json">)>;
    static obtenerAsistenciasHoy(c: Context): Promise<(Response & import("hono").TypedResponse<{
        message: string;
    }, 403, "json">) | (Response & import("hono").TypedResponse<{
        success: true;
        asistencias: {
            id: string | number;
            fecha: string;
            hora: string;
            estado: "entrada" | "salida";
            estado_asistencia: "Presente" | "Tarde" | "Ausente" | "Justificado";
            es_tardanza: boolean;
            estudiante: {
                id: number;
                codigo_estudiante: string;
                nombres: string;
                apellidos: string;
                grado: string;
                seccion: string;
                turno: string;
            };
        }[];
    }, import("hono/utils/http-status.js").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
        message: string;
    }, 500, "json">)>;
    static obtenerAsistenciasPorFecha(c: Context): Promise<(Response & import("hono").TypedResponse<{
        message: string;
    }, 403, "json">) | (Response & import("hono").TypedResponse<{
        message: string;
    }, 400, "json">) | (Response & import("hono").TypedResponse<{
        success: true;
        fecha: string;
        asistencias: {
            id: string | number;
            fecha: string;
            hora: string;
            estado: "entrada" | "salida";
            estado_asistencia: "Presente" | "Tarde" | "Ausente" | "Justificado";
            es_tardanza: boolean;
            estudiante: {
                id: number;
                codigo_estudiante: string;
                nombres: string;
                apellidos: string;
                grado: string;
                seccion: string;
                turno: string;
            };
        }[];
    }, import("hono/utils/http-status.js").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
        message: string;
    }, 500, "json">)>;
    static obtenerHistorialEstudiante(c: Context): Promise<(Response & import("hono").TypedResponse<{
        message: string;
    }, 403, "json">) | (Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 400, "json">) | (Response & import("hono").TypedResponse<{
        success: true;
        historial: {
            id: string | number;
            fecha: string;
            hora: string;
            estado: "entrada" | "salida";
            estado_asistencia: "Presente" | "Tarde" | "Ausente" | "Justificado";
            es_tardanza: boolean;
            estudiante: {
                id: number;
                codigo_estudiante: string;
                nombres: string;
                apellidos: string;
                grado: string;
                seccion: string;
                turno: string;
            };
        }[];
    }, import("hono/utils/http-status.js").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
        message: string;
    }, 500, "json">)>;
    static obtenerHistorialCompletoEstudiante(c: Context): Promise<(Response & import("hono").TypedResponse<{
        message: string;
    }, 403, "json">) | (Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 400, "json">) | (Response & import("hono").TypedResponse<{
        success: true;
        historial: {
            id: string | number;
            fecha: string;
            hora: string;
            estado: "entrada" | "salida";
            estado_asistencia: "Presente" | "Tarde" | "Ausente" | "Justificado";
            es_tardanza: boolean;
            estudiante: {
                id: number;
                codigo_estudiante: string;
                nombres: string;
                apellidos: string;
                grado: string;
                seccion: string;
                turno: string;
            };
        }[];
    }, import("hono/utils/http-status.js").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
        message: string;
    }, 500, "json">)>;
    static buscarEstudiantePorCodigo(c: Context): Promise<(Response & import("hono").TypedResponse<{
        message: string;
    }, 403, "json">) | (Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 400, "json">) | (Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 404, "json">) | (Response & import("hono").TypedResponse<{
        success: true;
        estudiante: {
            id: any;
            codigo_estudiante: any;
            nombre: any;
            apellido: any;
            grado: any;
            seccion: any;
            turno: any;
        };
    }, import("hono/utils/http-status.js").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
        message: string;
    }, 500, "json">)>;
    static buscarEstudiantesPorNombre(c: Context): Promise<(Response & import("hono").TypedResponse<{
        message: string;
    }, 403, "json">) | (Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 400, "json">) | (Response & import("hono").TypedResponse<{
        success: true;
        estudiantes: any[];
        total: number;
    }, import("hono/utils/http-status.js").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
        message: string;
    }, 500, "json">)>;
    static registrarAsistenciaManual(c: Context): Promise<(Response & import("hono").TypedResponse<{
        message: string;
    }, 403, "json">) | (Response & import("hono").TypedResponse<{
        message: string;
    }, 400, "json">) | (Response & import("hono").TypedResponse<{
        message: string;
    }, 404, "json">) | (Response & import("hono").TypedResponse<{
        success: true;
        message: string;
        asistencia: any;
    }, import("hono/utils/http-status.js").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
        message: string;
    }, 500, "json">)>;
    /**
     * Ejecuta manualmente el marcado de ausencias automáticas
     * Este endpoint es para pruebas y permite ejecutar la funcionalidad sin esperar a las 8 PM
     */
    static marcarAusenciasManual(c: Context): Promise<(Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 403, "json">) | (Response & import("hono").TypedResponse<{
        success: true;
        message: string;
        data: {
            ausenciasMarcadas: number;
            estudiantesProcesados: number;
            estudiantesConAsistencia: number;
            detalle: string;
        };
    }, import("hono/utils/http-status.js").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 500, "json">)>;
}
//# sourceMappingURL=porteroController.d.ts.map