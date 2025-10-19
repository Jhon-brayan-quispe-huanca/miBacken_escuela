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
            estudiantesHoy: number;
            asistenciasHoy: number;
            tardanzasHoy: number;
            ausenciasHoy: number;
            justificadosHoy: number;
            presentesHoy: number;
            porcentajeAsistencia: number;
            tendencia: number;
            estudiantesConPermisos: number;
            horaPromedioLlegada: string;
            asistenciasAyer: number;
            presentesAyer: number;
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
            id: number;
            codigo_estudiante: string;
            nombre: string;
            apellido: string;
            grado: string;
            seccion: string;
            turno: string;
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
        estudiantes: {
            id: number;
            codigo_estudiante: string;
            nombre: string;
            apellido: string;
            nombreCompleto: string;
            grado: string;
            seccion: string;
            turno: string;
            tienePermisoActivo: boolean;
            asistenciaHoy: {
                id: number;
                created_at: string | null;
                updated_at: string | null;
                estado: string | null;
                fecha: string;
                estudiante_id: number;
                usuario_portero_id: number;
                hora_entrada: string | null;
                hora_salida: string | null;
                observaciones: string | null;
                permiso_id: number | null;
            } | null;
            permisos: {
                id: number;
                motivo: string;
                fecha_inicio: string;
                fecha_fin: string | null;
            }[];
        }[];
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
        asistencia: {
            id: number;
            created_at: string | null;
            updated_at: string | null;
            estado: string | null;
            fecha: string;
            estudiante_id: number;
            usuario_portero_id: number;
            hora_entrada: string | null;
            hora_salida: string | null;
            observaciones: string | null;
            permiso_id: number | null;
        };
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