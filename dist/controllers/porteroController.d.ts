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
        [x: string]: any;
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
    }, import("hono/utils/http-status.js").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
        message: string;
    }, 500, "json">)>;
    static procesarEscaneoQR(c: Context): Promise<(Response & import("hono").TypedResponse<{
        message: string;
    }, 403, "json">) | (Response & import("hono").TypedResponse<any, 200 | 400, "json">) | (Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 500, "json">)>;
    static obtenerAsistenciasHoy(c: Context): Promise<(Response & import("hono").TypedResponse<{
        message: string;
    }, 403, "json">) | (Response & import("hono").TypedResponse<{
        [x: string]: any;
        success: true;
    }, import("hono/utils/http-status.js").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
        message: string;
    }, 500, "json">)>;
    static obtenerAsistenciasPorFecha(c: Context): Promise<(Response & import("hono").TypedResponse<{
        message: string;
    }, 403, "json">) | (Response & import("hono").TypedResponse<{
        message: string;
    }, 400, "json">) | (Response & import("hono").TypedResponse<{
        [x: string]: any;
        success: true;
        fecha: string;
    }, import("hono/utils/http-status.js").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
        message: string;
    }, 500, "json">)>;
    static obtenerHistorialEstudiante(c: Context): Promise<(Response & import("hono").TypedResponse<{
        message: string;
    }, 403, "json">) | (Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 400, "json">) | (Response & import("hono").TypedResponse<{
        [x: string]: any;
        success: true;
    }, import("hono/utils/http-status.js").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
        message: string;
    }, 500, "json">)>;
    static obtenerHistorialCompletoEstudiante(c: Context): Promise<(Response & import("hono").TypedResponse<{
        message: string;
    }, 403, "json">) | (Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 400, "json">) | (Response & import("hono").TypedResponse<{
        [x: string]: any;
        success: true;
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
                estado: string | null;
                created_at: string | null;
                updated_at: string | null;
                estudiante_id: number;
                observaciones: string | null;
                usuario_portero_id: number;
                fecha: string;
                hora_entrada: string | null;
                hora_salida: string | null;
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
            estado: string | null;
            created_at: string | null;
            updated_at: string | null;
            estudiante_id: number;
            observaciones: string | null;
            usuario_portero_id: number;
            fecha: string;
            hora_entrada: string | null;
            hora_salida: string | null;
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
            [x: string]: any;
        };
    }, import("hono/utils/http-status.js").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 500, "json">)>;
}
//# sourceMappingURL=porteroController.d.ts.map