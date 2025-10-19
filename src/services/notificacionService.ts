import { PrismaClient } from '../../generated/prisma';

const prisma = new PrismaClient();

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

export class NotificacionService {
  /**
   * Crear una nueva notificación
   */
  static async crearNotificacion(data: NotificacionData) {
    try {
      const notificacion = await prisma.notificaciones.create({
        data: {
          usuario_id: data.usuario_id,
          titulo: data.titulo,
          mensaje: data.mensaje,
          tipo: data.tipo || 'General',
          estudiante_id: data.estudiante_id || null,
          asistencia_id: data.asistencia_id || null,
          prioridad: data.prioridad || 'media',
          categoria: data.categoria || 'general',
          datos_adicionales: data.datos_adicionales || undefined,
          accion_requerida: data.accion_requerida || null,
        },
        include: {
          usuarios: {
            select: {
              id: true,
              nombres: true,
              apellidos: true,
              email: true,
            },
          },
          estudiantes: {
            select: {
              id: true,
              nombres: true,
              apellidos: true,
              codigo_estudiante: true,
            },
          },
        },
      });

      return {
        success: true,
        data: notificacion,
      };
    } catch (error) {
      console.error('Error al crear notificación:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
      };
    }
  }

  /**
   * Obtener notificaciones de un usuario
   */
  static async obtenerNotificaciones(
    usuarioId: number,
    opciones: {
      limit?: number;
      offset?: number;
      categoria?: string;
      prioridad?: string;
      leido?: boolean;
    } = {}
  ) {
    try {
      const {
        limit = 20,
        offset = 0,
        categoria,
        prioridad,
        leido,
      } = opciones;

      const where: any = {
        usuario_id: usuarioId,
      };

      if (categoria) where.categoria = categoria;
      if (prioridad) where.prioridad = prioridad;
      if (leido !== undefined) where.leido = leido;

      const notificaciones = await prisma.notificaciones.findMany({
        where,
        include: {
          usuarios: {
            select: {
              id: true,
              nombres: true,
              apellidos: true,
            },
          },
          estudiantes: {
            select: {
              id: true,
              nombres: true,
              apellidos: true,
              codigo_estudiante: true,
            },
          },
        },
        orderBy: {
          fecha_envio: 'desc',
        },
        take: limit,
        skip: offset,
      });

      const total = await prisma.notificaciones.count({ where });

      return {
        success: true,
        data: {
          notificaciones,
          total,
          hasMore: offset + limit < total,
        },
      };
    } catch (error) {
      console.error('Error al obtener notificaciones:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
      };
    }
  }

  /**
   * Obtener contador de notificaciones no leídas
   */
  static async obtenerContadorNoLeidas(usuarioId: number) {
    try {
      const contador = await prisma.notificaciones.count({
        where: {
          usuario_id: usuarioId,
          leido: false,
        },
      });

      return {
        success: true,
        data: {
          contador,
        },
      };
    } catch (error) {
      console.error('Error al obtener contador:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
      };
    }
  }

  /**
   * Marcar notificación como leída
   */
  static async marcarComoLeida(notificacionId: number, usuarioId: number) {
    try {
      const notificacion = await prisma.notificaciones.findFirst({
        where: {
          id: notificacionId,
          usuario_id: usuarioId,
        },
      });

      if (!notificacion) {
        return {
          success: false,
          message: 'Notificación no encontrada',
        };
      }

      const actualizada = await prisma.notificaciones.update({
        where: { id: notificacionId },
        data: {
          leido: true,
          fecha_leido: new Date(),
        },
      });

      return {
        success: true,
        data: actualizada,
      };
    } catch (error) {
      console.error('Error al marcar como leída:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
      };
    }
  }

  /**
   * Marcar todas las notificaciones como leídas
   */
  static async marcarTodasComoLeidas(usuarioId: number) {
    try {
      await prisma.notificaciones.updateMany({
        where: {
          usuario_id: usuarioId,
          leido: false,
        },
        data: {
          leido: true,
          fecha_leido: new Date(),
        },
      });

      return {
        success: true,
        message: 'Todas las notificaciones fueron marcadas como leídas',
      };
    } catch (error) {
      console.error('Error al marcar todas como leídas:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
      };
    }
  }

  /**
   * Crear notificación de asistencia automática
   */
  static async crearNotificacionAsistencia(
    estudianteId: number,
    apoderadoId: number,
    datosAsistencia: {
      hora: string;
      estado: string;
      observaciones?: string;
    }
  ) {
    try {
      const estudiante = await prisma.estudiantes.findUnique({
        where: { id: estudianteId },
        select: {
          nombres: true,
          apellidos: true,
          codigo_estudiante: true,
        },
      });

      if (!estudiante) {
        return {
          success: false,
          message: 'Estudiante no encontrado',
        };
      }

      const titulo = 'Asistencia registrada';
      const mensaje = `${estudiante.nombres} ${estudiante.apellidos} llegó a las ${datosAsistencia.hora}`;

      return await this.crearNotificacion({
        usuario_id: apoderadoId,
        titulo,
        mensaje,
        tipo: 'Asistencia',
        estudiante_id: estudianteId,
        prioridad: 'media',
        categoria: 'asistencia',
        datos_adicionales: {
          estudiante: `${estudiante.nombres} ${estudiante.apellidos}`,
          codigo_estudiante: estudiante.codigo_estudiante,
          hora: datosAsistencia.hora,
          estado: datosAsistencia.estado,
          observaciones: datosAsistencia.observaciones,
        },
      });
    } catch (error) {
      console.error('Error al crear notificación de asistencia:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
      };
    }
  }

  /**
   * Crear notificación de permiso automática
   */
  static async crearNotificacionPermiso(
    solicitudId: number,
    tipo: 'solicitud' | 'aprobacion' | 'rechazo'
  ) {
    try {
      const solicitud = await prisma.solicitudes_permisos.findUnique({
        where: { id: solicitudId },
        include: {
          estudiantes: {
            select: {
              nombres: true,
              apellidos: true,
              codigo_estudiante: true,
            },
          },
          apoderados: {
            select: {
              usuario_id: true,
            },
          },
          usuarios: {
            select: {
              nombres: true,
              apellidos: true,
            },
          },
        },
      });

      if (!solicitud) {
        return {
          success: false,
          message: 'Solicitud no encontrada',
        };
      }

      let titulo: string;
      let mensaje: string;
      let usuarioDestino: number;
      let prioridad: 'alta' | 'media' | 'baja';

      switch (tipo) {
        case 'solicitud':
          titulo = 'Nueva solicitud de permiso';
          mensaje = `${solicitud.estudiantes.nombres} ${solicitud.estudiantes.apellidos} solicita permiso`;
          usuarioDestino = solicitud.aprobado_por || 0; // Profesor
          prioridad = 'alta';
          break;
        case 'aprobacion':
          titulo = 'Permiso aprobado';
          mensaje = `El permiso de ${solicitud.estudiantes.nombres} ${solicitud.estudiantes.apellidos} fue aprobado`;
          usuarioDestino = solicitud.apoderados.usuario_id; // Apoderado
          prioridad = 'media';
          break;
        case 'rechazo':
          titulo = 'Permiso rechazado';
          mensaje = `El permiso de ${solicitud.estudiantes.nombres} ${solicitud.estudiantes.apellidos} fue rechazado`;
          usuarioDestino = solicitud.apoderados.usuario_id; // Apoderado
          prioridad = 'alta';
          break;
        default:
          return {
            success: false,
            message: 'Tipo de notificación no válido',
          };
      }

      if (usuarioDestino === 0) {
        return {
          success: false,
          message: 'Usuario destino no encontrado',
        };
      }

      return await this.crearNotificacion({
        usuario_id: usuarioDestino,
        titulo,
        mensaje,
        tipo: 'Permiso',
        estudiante_id: solicitud.estudiante_id,
        prioridad,
        categoria: 'permiso',
        accion_requerida: tipo === 'solicitud' ? 'aprobar' : 'revisar',
        datos_adicionales: {
          estudiante: `${solicitud.estudiantes.nombres} ${solicitud.estudiantes.apellidos}`,
          codigo_estudiante: solicitud.estudiantes.codigo_estudiante,
          motivo: solicitud.motivo,
          fecha_permiso_inicio: solicitud.fecha_permiso_inicio,
          fecha_permiso_fin: solicitud.fecha_permiso_fin,
          aprobado_por: solicitud.usuarios ? `${solicitud.usuarios.nombres} ${solicitud.usuarios.apellidos}` : null,
        },
      });
    } catch (error) {
      console.error('Error al crear notificación de permiso:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
      };
    }
  }
}

export default NotificacionService;
