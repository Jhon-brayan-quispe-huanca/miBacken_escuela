export interface NotificacionData {
    usuario_id: number;
    titulo: string;
    mensaje: string;
    tipo?: string;
    estudiante_id?: number;
    asistencia_id?: number;
    prioridad?: 'alta' | 'media' | 'baja';
    categoria?: 'asistencia' | 'permiso' | 'sistema' | 'general';
    datos_adicionales?: Record<string, any>;
    accion_requerida?: string;
}
export declare class NotificacionService {
    /**
     * Crear una nueva notificación
     */
    static crearNotificacion(data: NotificacionData): Promise<{
        success: boolean;
        data: any;
        message?: undefined;
    } | {
        success: boolean;
        message: string;
        data?: undefined;
    }>;
    /**
     * Obtener notificaciones de un usuario
     */
    static obtenerNotificaciones(usuarioId: number, opciones?: {
        limit?: number;
        offset?: number;
        categoria?: string;
        prioridad?: string;
        leido?: boolean;
    }): Promise<{
        success: boolean;
        data: {
            notificaciones: any;
            total: any;
            hasMore: boolean;
        };
        message?: undefined;
    } | {
        success: boolean;
        message: string;
        data?: undefined;
    }>;
    /**
     * Obtener contador de notificaciones no leídas
     */
    static obtenerContadorNoLeidas(usuarioId: number): Promise<{
        success: boolean;
        data: {
            contador: any;
        };
        message?: undefined;
    } | {
        success: boolean;
        message: string;
        data?: undefined;
    }>;
    /**
     * Marcar notificación como leída
     */
    static marcarComoLeida(notificacionId: number, usuarioId: number): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        data: any;
        message?: undefined;
    }>;
    /**
     * Marcar todas las notificaciones como leídas
     */
    static marcarTodasComoLeidas(usuarioId: number): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * Crear notificación de asistencia automática
     */
    static crearNotificacionAsistencia(estudianteId: number, apoderadoId: number, datosAsistencia: {
        hora: string;
        estado: string;
        observaciones?: string;
    }): Promise<{
        success: boolean;
        data: any;
        message?: undefined;
    } | {
        success: boolean;
        message: string;
        data?: undefined;
    }>;
    /**
     * Crear notificación de permiso automática
     */
    static crearNotificacionPermiso(solicitudId: number, tipo: 'solicitud' | 'aprobacion' | 'rechazo'): Promise<{
        success: boolean;
        data: any;
        message?: undefined;
    } | {
        success: boolean;
        message: string;
        data?: undefined;
    }>;
}
export default NotificacionService;
//# sourceMappingURL=notificacionService.d.ts.map