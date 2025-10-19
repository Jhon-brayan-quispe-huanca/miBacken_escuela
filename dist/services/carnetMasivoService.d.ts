export declare class CarnetMasivoService {
    /**
     * Genera HTML para carnets masivos optimizado para impresión
     */
    generarHTMLCarnetsMasivo(estudiantes: any[]): Promise<string>;
    /**
     * Genera HTML para un carnet individual
     */
    generarHTMLCarnetIndividual(datosEstudiante: any, qrCodeDataURL: string): string;
    /**
     * Genera QR para estudiante
     */
    generarQR(datosEstudiante: any): Promise<string>;
    /**
     * Genera PDF para carnets masivos
     */
    generarPDFCarnetsMasivo(htmlContent: string): Promise<Buffer>;
}
export declare const carnetMasivoService: CarnetMasivoService;
//# sourceMappingURL=carnetMasivoService.d.ts.map