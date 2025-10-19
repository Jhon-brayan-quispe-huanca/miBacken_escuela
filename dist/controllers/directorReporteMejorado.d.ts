export declare class DirectorReporteMejorado {
    static generarReporteMensual(gradoId: number, seccionId: number, mes: number, año: number, profesorId?: number): Promise<any[][]>;
    private static _obtenerNombreMes;
    private static _generarSemanasDelMes;
    private static _mapearEstadoAbreviatura;
    private static _simularAsistencia;
    static aplicarEstilosExcel(workbook: any, worksheet: any): void;
    static incluirLogoEnExcel(workbook: any): void;
}
//# sourceMappingURL=directorReporteMejorado.d.ts.map