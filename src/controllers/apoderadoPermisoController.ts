import { Hono } from 'hono';
import { PrismaClient } from '../../generated/prisma/index.js';
import { permisoService } from '../services/permisoService.js';
import NotificacionService from '../services/notificacionService.js';

const prisma = new PrismaClient();

export const apoderadoPermisoController = new Hono();

/**
 * Obtener solicitudes de permisos del apoderado
 * GET /api/apoderado/permisos?apoderado_id=:id
 */
apoderadoPermisoController.get('/permisos', async (c) => {
  try {
    console.log('🔍 DEBUG: Endpoint /permisos llamado');
    
    const apoderadoIdParam = c.req.query('apoderado_id');
    console.log('🔍 DEBUG: Apoderado ID recibido:', apoderadoIdParam);
    
    if (!apoderadoIdParam) {
      console.log(' ERROR: No se recibió apoderado_id');
      return c.json({ 
        success: false, 
        message: 'ID de apoderado requerido' 
      }, 400);
    }

    const apoderadoId = parseInt(apoderadoIdParam);
    console.log('🔍 DEBUG: Apoderado ID parseado:', apoderadoId);
    
    if (isNaN(apoderadoId) || apoderadoId <= 0) {
      console.log(' ERROR: ID de apoderado inválido:', apoderadoId);
      return c.json({ 
        success: false, 
        message: 'ID de apoderado inválido' 
      }, 400);
    }

    console.log('🔍 DEBUG: Buscando apoderado con ID:', apoderadoId);
    const apoderado = await prisma.apoderados.findUnique({
      where: { id: apoderadoId },
      include: {
        usuarios: {
          select: {
            nombres: true,
            apellidos: true,
            email: true,
          },
        },
      },
    });

    console.log('🔍 DEBUG: Apoderado encontrado:', apoderado ? 'SÍ' : 'NO');
    
    if (!apoderado) {
      console.log(' ERROR: Apoderado no encontrado con ID:', apoderadoId);
      return c.json({ 
        success: false, 
        message: 'Apoderado no encontrado' 
      }, 404);
    }

    // Obtener solicitudes de permisos con relaciones optimizadas
    const solicitudes = await prisma.solicitudes_permisos.findMany({
      where: { 
        apoderado_id: apoderadoId,
        // Filtrar solo solicitudes del último año para mejor rendimiento
        fecha_solicitud: {
          gte: new Date(new Date().getFullYear() - 1, 0, 1)
        }
      },
      select: {
        id: true,
        fecha_solicitud: true,
        fecha_permiso_inicio: true,
        fecha_permiso_fin: true,
        motivo: true,
        estado: true,
        fecha_respuesta: true,
        observaciones_respuesta: true,
        documento_path: true,
        documento_nombre: true,
        documento_tipo: true,
        aprobado_por: true,
        created_at: true,
        updated_at: true,
        estudiantes: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            codigo_estudiante: true,
            grados: {
              select: {
                nombre: true,
              },
            },
            secciones: {
              select: {
                nombre: true,
              },
            },
          },
        },
        usuarios: {
          select: {
            nombres: true,
            apellidos: true,
          },
        },
      },
      orderBy: {
        fecha_solicitud: 'desc',
      },
      // Limitar resultados para mejor rendimiento
      take: 100,
    });

    return c.json({
      success: true,
      data: {
        apoderado: {
          id: apoderado.id,
          nombres: apoderado.usuarios.nombres,
          apellidos: apoderado.usuarios.apellidos,
          email: apoderado.usuarios.email,
        },
        solicitudes: solicitudes.map(solicitud => ({
          id: solicitud.id,
          estudiante: {
            id: solicitud.estudiantes.id,
            nombres: solicitud.estudiantes.nombres,
            apellidos: solicitud.estudiantes.apellidos,
            grado: solicitud.estudiantes.grados.nombre,
            seccion: solicitud.estudiantes.secciones.nombre,
          },
          fecha_solicitud: solicitud.fecha_solicitud,
          fecha_permiso_inicio: solicitud.fecha_permiso_inicio,
          fecha_permiso_fin: solicitud.fecha_permiso_fin,
          motivo: solicitud.motivo,
          estado: solicitud.estado,
          aprobado_por: solicitud.aprobado_por,
          fecha_respuesta: solicitud.fecha_respuesta,
          observaciones_respuesta: solicitud.observaciones_respuesta,
          profesor_respuesta: solicitud.usuarios ? {
            nombres: solicitud.usuarios.nombres,
            apellidos: solicitud.usuarios.apellidos,
          } : null,
          created_at: solicitud.created_at,
          updated_at: solicitud.updated_at,
        })),
      },
    });

  } catch (error) {
    console.error('Error al obtener solicitudes de permisos:', error);
    return c.json({ 
      success: false, 
      message: 'Error interno del servidor' 
    }, 500);
  }
});

/**
 * Crear nueva solicitud de permiso
 * POST /api/apoderado/permisos
 */
apoderadoPermisoController.post('/permisos', async (c) => {
  try {
    const body = await c.req.json();
    const { apoderado_id, estudiante_id, fecha_permiso_inicio, fecha_permiso_fin, motivo, documento_path, documento_nombre, documento_tipo } = body;

    // Validaciones
    if (!apoderado_id || !estudiante_id || !fecha_permiso_inicio || !motivo) {
      return c.json({
        success: false,
        message: 'Datos requeridos: apoderado_id, estudiante_id, fecha_permiso_inicio, motivo',
      }, 400);
    }

    // Verificar que el apoderado existe
    const apoderado = await prisma.apoderados.findUnique({
      where: { id: parseInt(apoderado_id) },
    });

    if (!apoderado) {
      return c.json({
        success: false,
        message: 'Apoderado no encontrado',
      }, 404);
    }

    // Verificar que el estudiante existe y pertenece al apoderado
    const estudiante = await prisma.estudiantes.findFirst({
      where: {
        id: parseInt(estudiante_id),
        apoderado_id: parseInt(apoderado_id),
      },
    });

    if (!estudiante) {
      return c.json({
        success: false,
        message: 'Estudiante no encontrado o no pertenece al apoderado',
      }, 404);
    }

    // Validar fechas
    const fechaInicio = new Date(fecha_permiso_inicio);
    const fechaFin = fecha_permiso_fin ? new Date(fecha_permiso_fin) : null;
    const fechaSolicitud = new Date();

    if (fechaInicio < fechaSolicitud) {
      return c.json({
        success: false,
        message: 'La fecha de permiso no puede ser anterior a hoy',
      }, 400);
    }

    if (fechaFin && fechaFin < fechaInicio) {
      return c.json({
        success: false,
        message: 'La fecha de fin no puede ser anterior a la fecha de inicio',
      }, 400);
    }

    // Crear solicitud
    const nuevaSolicitud = await prisma.solicitudes_permisos.create({
      data: {
        apoderado_id: parseInt(apoderado_id),
        estudiante_id: parseInt(estudiante_id),
        fecha_solicitud: fechaSolicitud,
        fecha_permiso_inicio: fechaInicio,
        fecha_permiso_fin: fechaFin,
        motivo: motivo.trim(),
        estado: 'Pendiente',
        // Campos opcionales para documentos
        documento_path: documento_path?.trim() || null,
        documento_nombre: documento_nombre?.trim() || null,
        documento_tipo: documento_tipo?.trim() || null,
      },
      include: {
        estudiantes: {
          include: {
            grados: {
              select: {
                nombre: true,
              },
            },
            secciones: {
              select: {
                nombre: true,
              },
            },
          },
        },
      },
    });

    // 🔔 CREAR NOTIFICACIÓN AUTOMÁTICA AL PROFESOR
    try {
      await NotificacionService.crearNotificacionPermiso(nuevaSolicitud.id, 'solicitud');
      console.log(`🔔 Notificación de nueva solicitud enviada al profesor`);
    } catch (notificacionError) {
      // No fallar la creación de solicitud si falla la notificación
      console.error('Error al enviar notificación:', notificacionError);
    }

    return c.json({
      success: true,
      message: 'Solicitud de permiso creada exitosamente',
      data: {
        id: nuevaSolicitud.id,
        estudiante: {
          nombres: nuevaSolicitud.estudiantes.nombres,
          apellidos: nuevaSolicitud.estudiantes.apellidos,
          grado: nuevaSolicitud.estudiantes.grados.nombre,
          seccion: nuevaSolicitud.estudiantes.secciones.nombre,
        },
        fecha_solicitud: nuevaSolicitud.fecha_solicitud,
        fecha_permiso_inicio: nuevaSolicitud.fecha_permiso_inicio,
        fecha_permiso_fin: nuevaSolicitud.fecha_permiso_fin,
        motivo: nuevaSolicitud.motivo,
        estado: nuevaSolicitud.estado,
      },
    });

  } catch (error) {
    console.error('Error al crear solicitud de permiso:', error);
    return c.json({
      success: false,
      message: 'Error interno del servidor',
    }, 500);
  }
});

/**
 * Obtener hijos del apoderado para el formulario
 * GET /api/apoderado/permisos/hijos?apoderado_id=:id
 */
apoderadoPermisoController.get('/permisos/hijos', async (c) => {
  try {
    const apoderadoIdParam = c.req.query('apoderado_id');
    
    if (!apoderadoIdParam) {
      return c.json({
        success: false,
        message: 'ID de apoderado requerido',
      }, 400);
    }

    const apoderadoId = parseInt(apoderadoIdParam);
    
    if (isNaN(apoderadoId) || apoderadoId <= 0) {
      return c.json({
        success: false,
        message: 'ID de apoderado inválido',
      }, 400);
    }

    // Obtener hijos del apoderado con consulta optimizada
    const hijos = await prisma.estudiantes.findMany({
      where: { 
        apoderado_id: apoderadoId,
        estado: 'Activo' // Solo estudiantes activos
      },
      select: {
        id: true,
        nombres: true,
        apellidos: true,
        codigo_estudiante: true,
        estado: true,
        grados: {
          select: {
            nombre: true,
          },
        },
        secciones: {
          select: {
            nombre: true,
          },
        },
      },
      orderBy: {
        nombres: 'asc',
      },
    });

    return c.json({
      success: true,
      data: hijos.map(hijo => ({
        id: hijo.id,
        nombres: hijo.nombres,
        apellidos: hijo.apellidos,
        grado: hijo.grados.nombre,
        seccion: hijo.secciones.nombre,
        codigo_estudiante: `EST${hijo.id.toString().padStart(4, '0')}`,
      })),
    });

  } catch (error) {
    console.error('Error al obtener hijos del apoderado:', error);
    return c.json({
      success: false,
      message: 'Error interno del servidor',
    }, 500);
  }
});

/**
 * Cancelar solicitud de permiso (solo si está pendiente)
 * PUT /api/apoderado/permisos/:id/cancelar
 */
apoderadoPermisoController.put('/permisos/:id/cancelar', async (c) => {
  try {
    const solicitudId = parseInt(c.req.param('id'));
    const { apoderado_id } = await c.req.json();

    if (isNaN(solicitudId) || solicitudId <= 0) {
      return c.json({
        success: false,
        message: 'ID de solicitud inválido',
      }, 400);
    }

    // Verificar que la solicitud existe y pertenece al apoderado
    const solicitud = await prisma.solicitudes_permisos.findFirst({
      where: {
        id: solicitudId,
        apoderado_id: parseInt(apoderado_id),
      },
    });

    if (!solicitud) {
      return c.json({
        success: false,
        message: 'Solicitud no encontrada',
      }, 404);
    }

    // Solo se puede cancelar si está pendiente
    if (solicitud.estado !== 'Pendiente') {
      return c.json({
        success: false,
        message: 'Solo se pueden cancelar solicitudes pendientes',
      }, 400);
    }

    // Actualizar estado a cancelado
    const solicitudActualizada = await prisma.solicitudes_permisos.update({
      where: { id: solicitudId },
      data: {
        estado: 'Cancelado',
        updated_at: new Date(),
      },
    });

    return c.json({
      success: true,
      message: 'Solicitud cancelada exitosamente',
      data: {
        id: solicitudActualizada.id,
        estado: solicitudActualizada.estado,
      },
    });

  } catch (error) {
    console.error('Error al cancelar solicitud:', error);
    return c.json({
      success: false,
      message: 'Error interno del servidor',
    }, 500);
  }
});
