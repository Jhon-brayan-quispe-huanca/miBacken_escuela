export declare class DirectorReporte {
    static generarReporteMensual(gradoId: number, seccionId: number, mes: number, año: number, profesorId?: number): Promise<any[][]>;
    private static _obtenerNombreMes;
    private static _generarSemanasDelMes;
    private static _mapearEstadoAbreviatura;
    static aplicarEstilosExcel(workbook: any, worksheet: any): void;
    static incluirLogoEnExcel(workbook: any, worksheet: any): Promise<void>;
    static generarReporteConExcelJS(gradoId: number, seccionId: number, mes: number, año: number, profesorId?: number): Promise<Buffer>;
    private static _aplicarEstilosMejorados;
    private static _centrarTitulos;
    private static _corregirTotales;
}
//# sourceMappingURL=directorReporte.d.ts.map