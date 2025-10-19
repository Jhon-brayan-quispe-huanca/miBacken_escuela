export interface EstudianteCarnetData {
    codigo_estudiante: string;
    nombre: string;
    apellido: string;
    grado: string;
    seccion: string;
    turno: string;
}
export declare class CarnetService {
    /**
     * Obtiene los datos del estudiante para el carnet
     */
    obtenerDatosEstudiante(estudianteId: number): Promise<EstudianteCarnetData | null>;
    /**
     * Genera el código QR con los datos del estudiante
     */
    generarQR(datosEstudiante: EstudianteCarnetData): Promise<string>;
    /**
     * Genera el HTML del carnet
     */
    generarHTMLCarnet(datosEstudiante: EstudianteCarnetData, qrCodeDataURL: string): string;
    /**
     * Genera el PDF del carnet
     */
    generarPDFCarnet(estudianteId: number): Promise<Buffer>;
    /**
     * Valida que el estudiante exista
     */
    validarEstudiante(estudianteId: number): Promise<boolean>;
    /**
     * Genera HTML para carnets masivos (múltiples carnets en una página)
     */
    generarHTMLCarnetsMasivo(estudiantes: any[]): Promise<string>;
    /**
     * Genera PDF para carnets masivos
     */
    generarPDFCarnetsMasivo(htmlContent: string): Promise<Buffer>;
    /**
     * Generar imagen PNG del carnet (para apoderado)
     */
    generarImagenCarnet(estudiante: any): Promise<Buffer>;
}
export declare const carnetService: CarnetService;
//# sourceMappingURL=carnetService.d.ts.map