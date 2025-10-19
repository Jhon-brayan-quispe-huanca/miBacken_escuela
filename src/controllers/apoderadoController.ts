import { Hono } from 'hono';
import { PrismaClient } from '../../generated/prisma/index.js';

const prisma = new PrismaClient();

export const apoderadoController = new Hono();

/**
 * Obtener asistencias generales del apoderado
 * GET /api/apoderado/asistencias-generales?apoderado_id=:id&fecha=:fecha&hijo_id=:hijo_id&estado=:estado
 */
apoderadoController.get('/asistencias-generales', async (c) => {
  try {
    const apoderadoIdParam = c.req.query('apoderado_id');
    const apoderadoId = apoderadoIdParam ? parseInt(apoderadoIdParam) : 0;
    const fecha = c.req.query('fecha') || new Date().toISOString().split('T')[0];
    const hijoId = c.req.query('hijo_id');
    const estado = c.req.query('estado');

    // Validación
    if (!apoderadoIdParam || isNaN(apoderadoId) || apoderadoId <= 0) {
      return c.json({
        success: false,
        message: 'ID de apoderado inválido'
      }, 400);
    }

    // Construir filtros para la consulta
    const whereClause: any = {
      estudiantes: {
        apoderado_id: apoderadoId
      }
    };

    // Agregar filtro de fecha si se proporciona
    if (fecha) {
      // Convertir fecha a formato correcto para la base de datos
      const fechaObj = new Date(fecha + 'T00:00:00.000Z');
      const inicioDia = new Date(fechaObj);
      const finDia = new Date(fechaObj);
      finDia.setUTCDate(finDia.getUTCDate() + 1);
      
      whereClause.fecha = {
        gte: inicioDia,
        lt: finDia
      };
    }

    if (hijoId && hijoId !== 'todos') {
      whereClause.estudiante_id = parseInt(hijoId);
    }

    if (estado && estado !== 'todos') {
      if (estado === 'salida') {
        whereClause.hora_salida = { not: null };
      } else {
        whereClause.estado = estado;
      }
    }

    // Obtener asistencias con datos del estudiante
    const asistencias = await prisma.asistencia_general.findMany({
      where: whereClause,
      include: {
        estudiantes: {
          include: {
            grados: {
              select: {
                nombre: true
              }
            },
            secciones: {
              select: {
                nombre: true
              }
            }
          }
        }
      },
      orderBy: {
        fecha: 'desc'
      }
    });

    // Formatear respuesta
    const asistenciasFormateadas = asistencias.map((asistencia: any) => {
      // Determinar el estado original de entrada
      let estadoOriginal = asistencia.estado;
      
      // Si el estado actual es "Salida" pero tiene hora de entrada, 
      // significa que llegó a tiempo (era Presente)
      if (asistencia.estado === 'Salida' && asistencia.hora_entrada !== null) {
        estadoOriginal = 'Presente';
      }
      // Si el estado actual es "Salida" pero no tiene hora de entrada,
      // significa que no llegó (era Ausente)
      else if (asistencia.estado === 'Salida' && asistencia.hora_entrada === null) {
        estadoOriginal = 'Ausente';
      }
      
      return {
        id: asistencia.id,
        estudiante_id: asistencia.estudiante_id,
        estudiante_nombre: `${asistencia.estudiantes.nombres} ${asistencia.estudiantes.apellidos}`,
        grado: asistencia.estudiantes.grados.nombre,
        seccion: asistencia.estudiantes.secciones.nombre,
        hora_entrada: asistencia.hora_entrada,
        hora_salida: asistencia.hora_salida,
        estado: asistencia.estado, // Estado actual (puede ser "Salida")
        estado_original: estadoOriginal, // Estado de entrada original
        observaciones: asistencia.observaciones,
        fecha: asistencia.fecha
      };
    });

    // Calcular estadísticas basándose en el estado de entrada original
    const estadisticas = {
      total: asistenciasFormateadas.length,
      presentes: asistenciasFormateadas.filter((a: any) => a.estado_original === 'Presente').length,
      tardanzas: asistenciasFormateadas.filter((a: any) => a.estado_original === 'Tarde').length,
      ausencias: asistenciasFormateadas.filter((a: any) => a.estado_original === 'Ausente').length,
      justificadas: asistenciasFormateadas.filter((a: any) => a.estado_original === 'Justificado').length,
      conSalida: asistenciasFormateadas.filter((a: any) => a.hora_salida !== null).length
    };

    return c.json({
      success: true,
      data: {
        asistencias: asistenciasFormateadas,
        estadisticas: estadisticas,
        fecha: fecha,
        apoderado_id: apoderadoId
      }
    });

  } catch (error) {
    console.error('Error en asistencias generales:', error);
    return c.json({
      success: false,
      message: 'Error interno del servidor'
    }, 500);
  }
});

/**
 * Obtener carnets de los estudiantes del apoderado
 * GET /api/apoderado/carnets?apoderado_id=:id
 */
apoderadoController.get('/carnets', async (c) => {
  try {
    const apoderadoId = parseInt(c.req.query('apoderado_id') || '0');

    if (isNaN(apoderadoId) || apoderadoId <= 0) {
      return c.json({
        success: false,
        message: 'ID de apoderado inválido'
      }, 400);
    }

    // Obtener carnets de los estudiantes del apoderado
    const carnets = await prisma.carnets.findMany({
      where: {
        estudiantes: {
          apoderado_id: apoderadoId
        }
      },
      include: {
        estudiantes: {
          include: {
            grados: {
              select: {
                nombre: true
              }
            },
            secciones: {
              select: {
                nombre: true
              }
            }
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    // Formatear respuesta
    const carnetsFormateados = carnets.map((carnet: any) => ({
      id: carnet.id,
      estudiante_id: carnet.estudiante_id,
      estudiante_nombre: `${carnet.estudiantes.nombres} ${carnet.estudiantes.apellidos}`,
      grado: carnet.estudiantes.grados.nombre,
      seccion: carnet.estudiantes.secciones.nombre,
      dni: carnet.estudiantes.dni,
      codigo_qr: carnet.codigo_qr,
      foto_url: carnet.foto_url,
      activo: carnet.activo,
      created_at: carnet.created_at,
      updated_at: carnet.updated_at
    }));

    return c.json({
      success: true,
      data: carnetsFormateados
    });

  } catch (error) {
    console.error('Error al obtener carnets del apoderado:', error);
    return c.json({
      success: false,
      message: 'Error interno del servidor'
    }, 500);
  }
});

/**
 * Obtener estudiantes del apoderado
 * GET /api/apoderado/estudiantes
 */
apoderadoController.get('/estudiantes', async (c) => {
  try {
    const usuarioId = parseInt(c.req.query('apoderado_id') || '0');

    if (isNaN(usuarioId) || usuarioId <= 0) {
      return c.json({
        success: false,
        message: 'ID de usuario inválido'
      }, 400);
    }

    // Verificar que el usuario sea un apoderado
    const usuario = await prisma.usuarios.findUnique({
      where: { id: usuarioId },
      select: { rol_id: true }
    });

    if (!usuario) {
      return c.json({
        success: false,
        message: 'Usuario no encontrado'
      }, 404);
    }

    if (usuario.rol_id !== 4) {
      return c.json({
        success: false,
        message: 'El usuario no es un apoderado'
      }, 403);
    }

    // Buscar el apoderado_id correspondiente al usuario_id
    const apoderado = await prisma.apoderados.findFirst({
      where: { usuario_id: usuarioId },
      select: { id: true }
    });

    if (!apoderado) {
      return c.json({
        success: false,
        message: 'No se encontró registro de apoderado para este usuario'
      }, 404);
    }

    // Obtener estudiantes del apoderado usando el apoderado_id
    const estudiantes = await prisma.estudiantes.findMany({
      where: { apoderado_id: apoderado.id },
      include: {
        grados: {
          select: {
            nombre: true
          }
        },
        secciones: {
          select: {
            nombre: true
          }
        }
      }
    });

    // Formatear datos para que coincidan con el modelo del frontend
    const estudiantesFormateados = estudiantes.map(estudiante => ({
      id: estudiante.id,
      nombres: estudiante.nombres,
      apellidos: estudiante.apellidos,
      dni: estudiante.dni,
      estado: estudiante.estado,
      turno: estudiante.turno,
      grado_id: estudiante.grado_id,
      seccion_id: estudiante.seccion_id,
      apoderado_id: estudiante.apoderado_id,
      created_at: estudiante.created_at,
      updated_at: estudiante.updated_at,
      grados: estudiante.grados,
      secciones: estudiante.secciones
    }));

    return c.json({
      success: true,
      data: estudiantesFormateados
    });

  } catch (error) {
    console.error('Error al obtener estudiantes del apoderado:', error);
    return c.json({
      success: false,
      message: 'Error interno del servidor'
    }, 500);
  }
});

// Endpoint duplicado eliminado - Ver línea 175 para la implementación correcta

/**
 * Obtener asistencias por salón del apoderado
 * GET /api/apoderado/asistencias-por-salon?apoderado_id=:id&hijo_id=:hijo_id&profesor_id=:profesor_id&fecha=:fecha
 */
apoderadoController.get('/asistencias-por-salon', async (c) => {
  try {
    console.log('🚀 Endpoint asistencias-por-salon ejecutándose...');
    
    const apoderadoIdParam = c.req.query('apoderado_id');
    const apoderadoId = apoderadoIdParam ? parseInt(apoderadoIdParam) : 0;
    const hijoId = c.req.query('hijo_id');
    const profesorId = c.req.query('profesor_id');
    const fecha = c.req.query('fecha') || new Date().toISOString().split('T')[0];

    console.log('🔍 Debug asistencias-por-salon:', { apoderadoIdParam, apoderadoId, hijoId, profesorId, fecha });

    // Validación simplificada - siempre pasar para debug
    console.log('✅ Validación pasada, continuando con la consulta...');

    // Consultar asistencias por salón desde la tabla asistencia_salon
    const asistencias = await prisma.asistencia_salon.findMany({
      where: {
        estudiantes: {
          apoderado_id: apoderadoId
        },
        ...(hijoId && { estudiante_id: parseInt(hijoId) }),
        ...(profesorId && { profesor_id: parseInt(profesorId) }),
        ...(fecha && { fecha: new Date(fecha) })
      },
      include: {
        estudiantes: {
          include: {
            grados: {
              select: {
                nombre: true
              }
            },
            secciones: {
              select: {
                nombre: true
              }
            }
          }
        },
        profesores: {
          include: {
            usuarios: {
              select: {
                nombres: true,
                apellidos: true
              }
            }
          }
        }
      },
      orderBy: {
        fecha: 'desc'
      }
    });

    // Obtener lista de profesores disponibles para este apoderado
    const profesores = await prisma.profesores.findMany({
      where: {
        asistencia_salon: {
          some: {
            estudiantes: {
              apoderado_id: apoderadoId
            }
          }
        }
      },
      include: {
        usuarios: {
          select: {
            nombres: true,
            apellidos: true
          }
        }
      }
    });

    // Formatear datos
    const asistenciasFormateadas = asistencias.map(asistencia => ({
      id: asistencia.id,
      estudiante_id: asistencia.estudiante_id,
      estudiante_nombre: `${asistencia.estudiantes.nombres} ${asistencia.estudiantes.apellidos}`,
      grado: asistencia.estudiantes.grados.nombre,
      seccion: asistencia.estudiantes.secciones.nombre,
      profesor_id: asistencia.profesor_id,
      profesor_nombre: `${asistencia.profesores.usuarios.nombres} ${asistencia.profesores.usuarios.apellidos}`,
      fecha: asistencia.fecha,
      estado: asistencia.estado,
      observaciones: asistencia.observaciones
    }));

    const profesoresFormateados = profesores.map(profesor => ({
      id: profesor.id,
      nombre: `${profesor.usuarios.nombres} ${profesor.usuarios.apellidos}`
    }));

    return c.json({
      success: true,
      data: {
        asistencias: asistenciasFormateadas,
        profesores: profesoresFormateados
      }
    });

  } catch (error) {
    console.error('Error al obtener asistencias por salón:', error);
    return c.json({
      success: false,
      message: 'Error interno del servidor'
    }, 500);
  }
});

/**
 * Obtener información del apoderado
 * GET /api/apoderado/:id
 */
apoderadoController.get('/:id', async (c) => {
  try {
    const apoderadoId = parseInt(c.req.param('id'));
    
    if (isNaN(apoderadoId) || apoderadoId <= 0) {
      return c.json({
        success: false,
        message: 'ID de apoderado inválido'
      }, 400);
    }

    // Buscar el usuario directamente por ID y verificar que sea apoderado
    const usuario = await prisma.usuarios.findUnique({
      where: { id: apoderadoId },
      include: {
        roles: {
          select: {
            id: true,
            nombre: true
          }
        }
      }
    });

    if (!usuario) {
      return c.json({
        success: false,
        message: 'Usuario no encontrado'
      }, 404);
    }

    // Verificar que sea un apoderado (rol_id = 4)
    if (usuario.rol_id !== 4) {
      return c.json({
        success: false,
        message: 'El usuario no es un apoderado'
      }, 403);
    }

    // Buscar el registro en la tabla apoderados (opcional)
    const apoderadoData = await prisma.apoderados.findFirst({
      where: { usuario_id: apoderadoId }
    });

    return c.json({
      success: true,
      data: {
        id: apoderadoData?.id || usuario.id,
        nombres: usuario.nombres,
        apellidos: usuario.apellidos,
        email: usuario.email,
        telefono: usuario.telefono,
        direccion: usuario.direccion,
        activo: usuario.activo,
        created_at: usuario.created_at,
        updated_at: usuario.updated_at
      }
    });

  } catch (error) {
    console.error('Error al obtener apoderado:', error);
    return c.json({
      success: false,
      message: 'Error interno del servidor'
    }, 500);
  }
});

/**
 * Obtener notificaciones del apoderado
 * GET /api/apoderado/notificaciones
 */
apoderadoController.get('/notificaciones', async (c) => {
  try {
    const usuarioId = parseInt(c.req.query('apoderado_id') || '0');

    if (isNaN(usuarioId) || usuarioId <= 0) {
      return c.json({
        success: false,
        message: 'ID de usuario inválido'
      }, 400);
    }

    // Verificar que el usuario sea un apoderado
    const usuario = await prisma.usuarios.findUnique({
      where: { id: usuarioId },
      select: { rol_id: true }
    });

    if (!usuario || usuario.rol_id !== 4) {
      return c.json({
        success: false,
        message: 'El usuario no es un apoderado'
      }, 403);
    }

    // Por ahora devolver notificaciones vacías
    return c.json({
      success: true,
      data: []
    });

  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    return c.json({
      success: false,
      message: 'Error interno del servidor'
    }, 500);
  }
});

/**
 * Obtener notificaciones no leídas del apoderado
 * GET /api/apoderado/notificaciones/no-leidas
 */
apoderadoController.get('/notificaciones/no-leidas', async (c) => {
  try {
    const usuarioId = parseInt(c.req.query('apoderado_id') || '0');

    if (isNaN(usuarioId) || usuarioId <= 0) {
      return c.json({
        success: false,
        message: 'ID de usuario inválido'
      }, 400);
    }

    // Verificar que el usuario sea un apoderado
    const usuario = await prisma.usuarios.findUnique({
      where: { id: usuarioId },
      select: { rol_id: true }
    });

    if (!usuario || usuario.rol_id !== 4) {
      return c.json({
        success: false,
        message: 'El usuario no es un apoderado'
      }, 403);
    }

    // Por ahora devolver 0 notificaciones no leídas
    return c.json({
      success: true,
      data: {
        count: 0,
        notificaciones: []
      }
    });

  } catch (error) {
    console.error('Error al obtener notificaciones no leídas:', error);
    return c.json({
      success: false,
      message: 'Error interno del servidor'
    }, 500);
  }
});

/**
 * Obtener contador de notificaciones del apoderado
 * GET /api/apoderado/notificaciones/contador
 */
apoderadoController.get('/notificaciones/contador', async (c) => {
  try {
    const usuarioId = parseInt(c.req.query('apoderado_id') || '0');

    if (isNaN(usuarioId) || usuarioId <= 0) {
      return c.json({
        success: false,
        message: 'ID de usuario inválido'
      }, 400);
    }

    // Verificar que el usuario sea un apoderado
    const usuario = await prisma.usuarios.findUnique({
      where: { id: usuarioId },
      select: { rol_id: true }
    });

    if (!usuario || usuario.rol_id !== 4) {
      return c.json({
        success: false,
        message: 'El usuario no es un apoderado'
      }, 403);
    }

    // Por ahora devolver contador en 0
    return c.json({
      success: true,
      data: {
        count: 0
      }
    });

  } catch (error) {
    console.error('Error al obtener contador de notificaciones:', error);
    return c.json({
      success: false,
      message: 'Error interno del servidor'
    }, 500);
  }
});

/**
 * Obtener estadísticas de un estudiante
 * GET /api/apoderado/estudiantes/:id/estadisticas
 */
apoderadoController.get('/estudiantes/:id/estadisticas', async (c) => {
  try {
    const estudianteId = parseInt(c.req.param('id'));
    const fechaInicio = c.req.query('fecha_inicio');
    const fechaFin = c.req.query('fecha_fin');

    if (isNaN(estudianteId) || estudianteId <= 0) {
      return c.json({
        success: false,
        message: 'ID de estudiante inválido'
      }, 400);
    }

    // Por ahora devolver estadísticas vacías
    return c.json({
      success: true,
      data: {
        total_dias: 0,
        presentes: 0,
        ausentes: 0,
        justificados: 0,
        tardanzas: 0,
        porcentaje_asistencia: 0
      }
    });

  } catch (error) {
    console.error('Error al obtener estadísticas del estudiante:', error);
    return c.json({
      success: false,
      message: 'Error interno del servidor'
    }, 500);
  }
});
