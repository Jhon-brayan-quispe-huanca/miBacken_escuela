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
        data: {
            estudiantes: {
                id: number;
                codigo_estudiante: string;
                nombres: string;
                apellidos: string;
            } | null;
            usuarios: {
                id: number;
                nombres: string;
                apellidos: string;
                email: string | null;
            };
        } & {
            id: number;
            created_at: Date | null;
            updated_at: Date | null;
            categoria: string | null;
            prioridad: string | null;
            leido: boolean | null;
            usuario_id: number;
            titulo: string;
            mensaje: string;
            tipo: string | null;
            estudiante_id: number | null;
            asistencia_id: number | null;
            datos_adicionales: import("../../generated/prisma/runtime/library.js").JsonValue | null;
            accion_requerida: string | null;
            fecha_envio: Date | null;
            fecha_leido: Date | null;
        };
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
            notificaciones: ({
                estudiantes: {
                    id: number;
                    codigo_estudiante: string;
                    nombres: string;
                    apellidos: string;
                } | null;
                usuarios: {
                    id: number;
                    nombres: string;
                    apellidos: string;
                };
            } & {
                id: number;
                created_at: Date | null;
                updated_at: Date | null;
                categoria: string | null;
                prioridad: string | null;
                leido: boolean | null;
                usuario_id: number;
                titulo: string;
                mensaje: string;
                tipo: string | null;
                estudiante_id: number | null;
                asistencia_id: number | null;
                datos_adicionales: import("../../generated/prisma/runtime/library.js").JsonValue | null;
                accion_requerida: string | null;
                fecha_envio: Date | null;
                fecha_leido: Date | null;
            })[];
            total: number;
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
            contador: number;
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
        data: {
            id: number;
            created_at: Date | null;
            updated_at: Date | null;
            categoria: string | null;
            prioridad: string | null;
            leido: boolean | null;
            usuario_id: number;
            titulo: string;
            mensaje: string;
            tipo: string | null;
            estudiante_id: number | null;
            asistencia_id: number | null;
            datos_adicionales: import("../../generated/prisma/runtime/library.js").JsonValue | null;
            accion_requerida: string | null;
            fecha_envio: Date | null;
            fecha_leido: Date | null;
        };
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
        data: {
            estudiantes: {
                id: number;
                codigo_estudiante: string;
                nombres: string;
                apellidos: string;
            } | null;
            usuarios: {
                id: number;
                nombres: string;
                apellidos: string;
                email: string | null;
            };
        } & {
            id: number;
            created_at: Date | null;
            updated_at: Date | null;
            categoria: string | null;
            prioridad: string | null;
            leido: boolean | null;
            usuario_id: number;
            titulo: string;
            mensaje: string;
            tipo: string | null;
            estudiante_id: number | null;
            asistencia_id: number | null;
            datos_adicionales: import("../../generated/prisma/runtime/library.js").JsonValue | null;
            accion_requerida: string | null;
            fecha_envio: Date | null;
            fecha_leido: Date | null;
        };
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
        data: {
            estudiantes: {
                id: number;
                codigo_estudiante: string;
                nombres: string;
                apellidos: string;
            } | null;
            usuarios: {
                id: number;
                nombres: string;
                apellidos: string;
                email: string | null;
            };
        } & {
            id: number;
            created_at: Date | null;
            updated_at: Date | null;
            categoria: string | null;
            prioridad: string | null;
            leido: boolean | null;
            usuario_id: number;
            titulo: string;
            mensaje: string;
            tipo: string | null;
            estudiante_id: number | null;
            asistencia_id: number | null;
            datos_adicionales: import("../../generated/prisma/runtime/library.js").JsonValue | null;
            accion_requerida: string | null;
            fecha_envio: Date | null;
            fecha_leido: Date | null;
        };
        message?: undefined;
    } | {
        success: boolean;
        message: string;
        data?: undefined;
    }>;
}
export default NotificacionService;
//# sourceMappingURL=notificacionService.d.ts.map