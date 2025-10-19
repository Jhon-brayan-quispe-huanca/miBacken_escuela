export interface DatosQREstudiante {
    codigo_estudiante: string;
    nombre: string;
    apellido: string;
    grado: string;
    seccion: string;
    turno: string;
}
export interface ResultadoAsistencia {
    success: boolean;
    message: string;
    tipo: 'entrada' | 'salida';
    estado: 'Presente' | 'Tarde' | 'Ausente';
    hora: string;
    estudiante?: any;
    asistencia?: any;
}
export interface AsistenciaFormateada {
    id: string | number;
    fecha: string;
    hora: string;
    estado: 'entrada' | 'salida';
    estado_asistencia: 'Presente' | 'Tarde' | 'Ausente' | 'Justificado';
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
}
export declare class AsistenciaService {
    /**
     * Procesa el escaneo de QR y registra la asistencia
     */
    static procesarEscaneoQR(datosQR: DatosQREstudiante, porteroId: number): Promise<ResultadoAsistencia>;
    /**
     * Determina el estado de asistencia según la hora y turno
     */
    private static determinarEstadoAsistencia;
    /**
     * Envía notificación al apoderado
     */
    private static notificarApoderado;
    /**
     * Obtiene las asistencias del día actual
     */
    static obtenerAsistenciasHoy(): Promise<AsistenciaFormateada[]>;
    /**
     * Obtiene el historial de asistencia de un estudiante
     */
    static obtenerHistorialAsistencia(estudianteId: number, fechaInicio?: Date, fechaFin?: Date): Promise<AsistenciaFormateada[]>;
    /**
     * Obtiene el historial completo de asistencia de un estudiante incluyendo días sin registro como "Ausente"
     */
    static obtenerHistorialCompletoAsistencia(estudianteId: number, fechaInicio?: Date, fechaFin?: Date): Promise<AsistenciaFormateada[]>;
    /**
     * Obtiene las asistencias de una fecha específica
     */
    static obtenerAsistenciasPorFecha(fecha: string): Promise<AsistenciaFormateada[]>;
    /**
     * Marca automáticamente como "falta" a los estudiantes que no registraron asistencia durante el día
     * Se ejecuta a las 8 PM para marcar ausencias del día actual
     */
    static marcarAusenciasAutomaticas(): Promise<{
        estudiantesProcesados: number;
        ausenciasMarcadas: number;
        estudiantesConAsistencia: number;
        mensaje: string;
    }>;
}
//# sourceMappingURL=asistenciaService.d.ts.map