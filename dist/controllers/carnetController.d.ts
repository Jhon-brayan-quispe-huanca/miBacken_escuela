import { Context } from 'hono';
export declare class CarnetController {
    /**
     * Generar carnet de estudiante en PDF
     */
    static generarCarnetEstudiante(c: Context): Promise<Response>;
    /**
     * Obtener datos del estudiante para vista previa
     */
    static obtenerDatosEstudiante(c: Context): Promise<(Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 400, "json">) | (Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 404, "json">) | (Response & import("hono").TypedResponse<{
        success: true;
        data: {
            codigo_estudiante: string;
            nombre: string;
            apellido: string;
            grado: string;
            seccion: string;
            turno: string;
        };
    }, import("hono/utils/http-status.js").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 500, "json">)>;
    /**
     * Generar solo el código QR del estudiante
     */
    static generarQREstudiante(c: Context): Promise<(Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 400, "json">) | (Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 404, "json">) | (Response & import("hono").TypedResponse<{
        success: true;
        data: {
            estudiante: {
                codigo_estudiante: string;
                nombre: string;
                apellido: string;
                grado: string;
                seccion: string;
                turno: string;
            };
            qrCode: string;
        };
    }, import("hono/utils/http-status.js").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 500, "json">)>;
}
//# sourceMappingURL=carnetController.d.ts.map