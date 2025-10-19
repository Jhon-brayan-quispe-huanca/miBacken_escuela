import { Context } from 'hono';
export declare class CarnetMasivoController {
    /**
     * Obtiene estudiantes filtrados por grado y sección
     */
    static obtenerEstudiantesFiltrados(c: Context): Promise<(Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 400, "json">) | (Response & import("hono").TypedResponse<{
        success: true;
        estudiantes: {
            id: number;
            codigo_estudiante: string;
            nombre: string;
            apellido: string;
            grado: string;
            seccion: string;
            turno: string;
        }[];
    }, import("hono/utils/http-status.js").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 500, "json">)>;
    /**
     * Genera carnets masivamente para impresión (múltiples carnets en una página)
     */
    static generarCarnetsMasivo(c: Context): Promise<Response>;
    /**
     * Obtiene estadísticas de estudiantes por grado y sección
     */
    static obtenerEstadisticasFiltro(c: Context): Promise<(Response & import("hono").TypedResponse<{
        success: true;
        totalEstudiantes: number;
    }, import("hono/utils/http-status.js").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 500, "json">)>;
}
//# sourceMappingURL=carnetMasivoController.d.ts.map