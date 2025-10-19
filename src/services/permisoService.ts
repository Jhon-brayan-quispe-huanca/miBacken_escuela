import { PrismaClient } from '../../generated/prisma/index.js';

const prisma = new PrismaClient();

export const permisoService = {
  /**
   * Crear notificación para el profesor cuando se crea una solicitud
   */
  async crearNotificacionProfesor(solicitud: any) {
    try {
      // Obtener el profesor del grado/sección del estudiante
      const profesorGradoSeccion = await prisma.profesor_grado_seccion.findFirst({
        where: {
          grado_id: solicitud.estudiantes.grado_id,
          seccion_id: solicitud.estudiantes.seccion_id,
          es_tutor: true,
          activo: true,
        },
        include: {
          profesores: {
            include: {
              usuarios: {
                select: {
                  id: true,
                  nombres: true,
                  apellidos: true,
                },
              },
            },
          },
        },
      });

      if (profesorGradoSeccion) {
        // Crear notificación para el profesor tutor
        await prisma.notificaciones.create({
          data: {
            usuario_id: profesorGradoSeccion.profesores.usuario_id,
            titulo: 'Nueva solicitud de permiso',
            mensaje: `${solicitud.estudiantes.nombres} ${solicitud.estudiantes.apellidos} solicita permiso para ${solicitud.fecha_permiso_inicio.toLocaleDateString()}`,
            tipo: 'permiso',
            leido: false,
          },
        });

        console.log(`Notificación creada para profesor: ${profesorGradoSeccion.profesores.usuarios.nombres}`);
      } else {
        console.log('No se encontró profesor tutor para el grado/sección');
      }

    } catch (error) {
      console.error('Error al crear notificación para profesor:', error);
    }
  },

  /**
   * Crear notificación para el apoderado cuando se responde una solicitud
   */
  async crearNotificacionApoderado(solicitudId: number, accion: 'aprobado' | 'rechazado', observaciones?: string) {
    try {
      const solicitud = await prisma.solicitudes_permisos.findUnique({
        where: { id: solicitudId },
        include: {
          apoderados: {
            include: {
              usuarios: {
                select: {
                  id: true,
                  nombres: true,
                  apellidos: true,
                },
              },
            },
          },
          estudiantes: {
            include: {
            },
          },
        },
      });

      if (solicitud) {
        const titulo = accion === 'aprobado' ? 'Solicitud de permiso aprobada' : 'Solicitud de permiso rechazada';
        const mensaje = `Su solicitud de permiso para ${solicitud.estudiantes.nombres} ${solicitud.estudiantes.apellidos} ha sido ${accion === 'aprobado' ? 'aprobada' : 'rechazada'}${observaciones ? `. Observaciones: ${observaciones}` : ''}`;

        await prisma.notificaciones.create({
          data: {
            usuario_id: solicitud.apoderados.usuario_id,
            titulo,
            mensaje,
            tipo: 'permiso',
            leido: false,
          },
        });

        console.log(`Notificación creada para apoderado: ${solicitud.apoderados.usuarios.nombres}`);
      }

    } catch (error) {
      console.error('Error al crear notificación para apoderado:', error);
    }
  },

  /**
   * Obtener estadísticas de permisos para un apoderado
   */
  async obtenerEstadisticasPermisos(apoderadoId: number) {
    try {
      const totalSolicitudes = await prisma.solicitudes_permisos.count({
        where: { apoderado_id: apoderadoId },
      });

      const pendientes = await prisma.solicitudes_permisos.count({
        where: {
          apoderado_id: apoderadoId,
          estado: 'Pendiente',
        },
      });

      const aprobadas = await prisma.solicitudes_permisos.count({
        where: {
          apoderado_id: apoderadoId,
          estado: 'Aprobado',
        },
      });

      const rechazadas = await prisma.solicitudes_permisos.count({
        where: {
          apoderado_id: apoderadoId,
          estado: 'Rechazado',
        },
      });

      const canceladas = await prisma.solicitudes_permisos.count({
        where: {
          apoderado_id: apoderadoId,
          estado: 'Cancelado',
        },
      });

      return {
        total: totalSolicitudes,
        pendientes,
        aprobadas,
        rechazadas,
        canceladas,
      };

    } catch (error) {
      console.error('Error al obtener estadísticas de permisos:', error);
      return {
        total: 0,
        pendientes: 0,
        aprobadas: 0,
        rechazadas: 0,
        canceladas: 0,
      };
    }
  },

  /**
   * Validar si un estudiante puede solicitar permiso para una fecha específica
   */
  async validarPermisoDisponible(estudianteId: number, fechaPermiso: Date) {
    try {
      // Verificar si ya existe una solicitud para esa fecha
      const solicitudExistente = await prisma.solicitudes_permisos.findFirst({
        where: {
          estudiante_id: estudianteId,
          fecha_permiso_inicio: {
            lte: fechaPermiso,
          },
          fecha_permiso_fin: {
            gte: fechaPermiso,
          },
          estado: {
            in: ['Pendiente', 'Aprobado'],
          },
        },
      });

      return !solicitudExistente;

    } catch (error) {
      console.error('Error al validar permiso disponible:', error);
      return false;
    }
  },

  /**
   * Marcar automáticamente como justificado cuando se aprueba un permiso
   */
  async marcarComoJustificado(solicitudId: number) {
    try {
      // Obtener datos de la solicitud
      const solicitud = await prisma.solicitudes_permisos.findUnique({
        where: { id: solicitudId },
        include: {
          estudiantes: {
            include: {
              grados: {
                select: {
                  id: true,
                },
              },
              secciones: {
                select: {
                  id: true,
                },
              },
            },
          },
        },
      });

      if (!solicitud) {
        console.error('Solicitud no encontrada:', solicitudId);
        return;
      }

      // Crear registro en asistencia_general
      await prisma.asistencia_general.create({
        data: {
          estudiante_id: solicitud.estudiante_id,
          usuario_portero_id: 1, // Sistema automático
          fecha: solicitud.fecha_permiso_inicio,
          estado: 'Justificado',
          observaciones: `Permiso aprobado - ${solicitud.motivo}`,
          permiso_id: solicitudId,
        },
      });

      // Obtener todos los profesores del grado/sección
      const profesores = await prisma.profesor_grado_seccion.findMany({
        where: {
          grado_id: solicitud.estudiantes.grados.id,
          seccion_id: solicitud.estudiantes.secciones.id,
          activo: true,
        },
        include: {
          profesores: true,
        },
      });

      // Crear registros en asistencia_salon para cada profesor
      for (const profesorGradoSeccion of profesores) {
        await prisma.asistencia_salon.create({
          data: {
            estudiante_id: solicitud.estudiante_id,
            profesor_id: profesorGradoSeccion.profesor_id,
            fecha: solicitud.fecha_permiso_inicio,
            estado: 'Justificado',
            observaciones: `Permiso aprobado - ${solicitud.motivo}`,
            permiso_id: solicitudId,
          },
        });
      }

      console.log(`Permiso ${solicitudId} marcado como justificado automáticamente`);

    } catch (error) {
      console.error('Error al marcar como justificado:', error);
    }
  },

  /**
   * Obtener permisos próximos (próximos 7 días)
   */
  async obtenerPermisosProximos(apoderadoId: number) {
    try {
      const fechaHoy = new Date();
      const fechaLimite = new Date();
      fechaLimite.setDate(fechaLimite.getDate() + 7);

      const permisosProximos = await prisma.solicitudes_permisos.findMany({
        where: {
          apoderado_id: apoderadoId,
          fecha_permiso_inicio: {
            gte: fechaHoy,
            lte: fechaLimite,
          },
          estado: {
            in: ['Pendiente', 'Aprobado'],
          },
        },
        include: {
          estudiantes: {
            include: {
            },
          },
        },
        orderBy: {
          fecha_permiso_inicio: 'asc',
        },
      });

      return permisosProximos.map(permiso => ({
        id: permiso.id,
        estudiante: {
          nombres: permiso.estudiantes.nombres,
          apellidos: permiso.estudiantes.apellidos,
        },
        fecha_permiso_inicio: permiso.fecha_permiso_inicio,
        fecha_permiso_fin: permiso.fecha_permiso_fin,
        motivo: permiso.motivo,
        estado: permiso.estado,
      }));

    } catch (error) {
      console.error('Error al obtener permisos próximos:', error);
      return [];
    }
  },
};
