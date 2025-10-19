export declare const permisoService: {
    /**
     * Crear notificación para el profesor cuando se crea una solicitud
     */
    crearNotificacionProfesor(solicitud: any): Promise<void>;
    /**
     * Crear notificación para el apoderado cuando se responde una solicitud
     */
    crearNotificacionApoderado(solicitudId: number, accion: "aprobado" | "rechazado", observaciones?: string): Promise<void>;
    /**
     * Obtener estadísticas de permisos para un apoderado
     */
    obtenerEstadisticasPermisos(apoderadoId: number): Promise<{
        total: any;
        pendientes: any;
        aprobadas: any;
        rechazadas: any;
        canceladas: any;
    }>;
    /**
     * Validar si un estudiante puede solicitar permiso para una fecha específica
     */
    validarPermisoDisponible(estudianteId: number, fechaPermiso: Date): Promise<boolean>;
    /**
     * Marcar automáticamente como justificado cuando se aprueba un permiso
     */
    marcarComoJustificado(solicitudId: number): Promise<void>;
    /**
     * Obtener permisos próximos (próximos 7 días)
     */
    obtenerPermisosProximos(apoderadoId: number): Promise<any>;
};
//# sourceMappingURL=permisoService.d.ts.map