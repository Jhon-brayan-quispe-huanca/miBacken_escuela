/**
 * Servicio de programación de tareas para el sistema de asistencia
 */
export declare class SchedulerService {
    private static instance;
    private tasks;
    private constructor();
    static getInstance(): SchedulerService;
    /**
     * Inicia todas las tareas programadas
     */
    startAllTasks(): void;
    /**
     * Programa el reinicio diario a las 11:59 PM
     * Esta tarea prepara el sistema para el nuevo día
     */
    private startDailyReset;
    /**
     * Programa el marcado automático de ausencias a las 8:00 PM
     * Esta tarea marca como "falta" a los estudiantes que no registraron asistencia durante el día
     */
    private startAutoAbsenceMarking;
    /**
     * Realiza las operaciones de reinicio diario
     */
    private performDailyReset;
    /**
     * Registra estadísticas del día que termina
     */
    private logDailyStatistics;
    /**
     * Detiene todas las tareas programadas
     */
    stopAllTasks(): void;
    /**
     * Obtiene el estado de todas las tareas
     */
    getTasksStatus(): {
        [key: string]: boolean;
    };
}
export default SchedulerService;
//# sourceMappingURL=scheduler.d.ts.map