import { Hono } from 'hono';
import NotificacionService from '../services/notificacionService.js';

const notificacionController = new Hono();

/**
 * GET /api/notificaciones/:usuario_id
 * Obtener notificaciones de un usuario
 */
notificacionController.get('/:usuario_id', async (c) => {
  try {
    const usuarioId = parseInt(c.req.param('usuario_id'));
    
    if (isNaN(usuarioId) || usuarioId <= 0) {
      return c.json({ 
        success: false, 
        message: 'ID de usuario inválido' 
      }, 400);
    }

    // Obtener parámetros de consulta
    const limit = parseInt(c.req.query('limit') || '20');
    const offset = parseInt(c.req.query('offset') || '0');
    const categoria = c.req.query('categoria') || undefined;
    const prioridad = c.req.query('prioridad') || undefined;
    const leido = c.req.query('leido') === 'true' ? true : 
                  c.req.query('leido') === 'false' ? false : undefined;

    const resultado = await NotificacionService.obtenerNotificaciones(usuarioId, {
      limit,
      offset,
      categoria,
      prioridad,
      leido,
    });

    if (!resultado.success) {
      return c.json(resultado, 500);
    }

    return c.json(resultado);
  } catch (error) {
    console.error('Error en obtener notificaciones:', error);
    return c.json({ 
      success: false, 
      message: 'Error interno del servidor' 
    }, 500);
  }
});

/**
 * GET /api/notificaciones/:usuario_id/contador
 * Obtener contador de notificaciones no leídas
 */
notificacionController.get('/:usuario_id/contador', async (c) => {
  try {
    const usuarioId = parseInt(c.req.param('usuario_id'));
    
    if (isNaN(usuarioId) || usuarioId <= 0) {
      return c.json({ 
        success: false, 
        message: 'ID de usuario inválido' 
      }, 400);
    }

    const resultado = await NotificacionService.obtenerContadorNoLeidas(usuarioId);

    if (!resultado.success) {
      return c.json(resultado, 500);
    }

    return c.json(resultado);
  } catch (error) {
    console.error('Error en obtener contador:', error);
    return c.json({ 
      success: false, 
      message: 'Error interno del servidor' 
    }, 500);
  }
});

/**
 * PUT /api/notificaciones/:id/leer
 * Marcar notificación como leída
 */
notificacionController.put('/:id/leer', async (c) => {
  try {
    const notificacionId = parseInt(c.req.param('id'));
    const body = await c.req.json();
    const { usuario_id } = body;
    
    if (isNaN(notificacionId) || notificacionId <= 0) {
      return c.json({ 
        success: false, 
        message: 'ID de notificación inválido' 
      }, 400);
    }

    if (!usuario_id || isNaN(usuario_id) || usuario_id <= 0) {
      return c.json({ 
        success: false, 
        message: 'ID de usuario inválido' 
      }, 400);
    }

    const resultado = await NotificacionService.marcarComoLeida(notificacionId, usuario_id);

    if (!resultado.success) {
      return c.json(resultado, resultado.message === 'Notificación no encontrada' ? 404 : 500);
    }

    return c.json(resultado);
  } catch (error) {
    console.error('Error en marcar como leída:', error);
    return c.json({ 
      success: false, 
      message: 'Error interno del servidor' 
    }, 500);
  }
});

/**
 * PUT /api/notificaciones/:usuario_id/leer-todas
 * Marcar todas las notificaciones como leídas
 */
notificacionController.put('/:usuario_id/leer-todas', async (c) => {
  try {
    const usuarioId = parseInt(c.req.param('usuario_id'));
    
    if (isNaN(usuarioId) || usuarioId <= 0) {
      return c.json({ 
        success: false, 
        message: 'ID de usuario inválido' 
      }, 400);
    }

    const resultado = await NotificacionService.marcarTodasComoLeidas(usuarioId);

    if (!resultado.success) {
      return c.json(resultado, 500);
    }

    return c.json(resultado);
  } catch (error) {
    console.error('Error en marcar todas como leídas:', error);
    return c.json({ 
      success: false, 
      message: 'Error interno del servidor' 
    }, 500);
  }
});

/**
 * POST /api/notificaciones/crear
 * Crear una nueva notificación
 */
notificacionController.post('/crear', async (c) => {
  try {
    const body = await c.req.json();
    const {
      usuario_id,
      titulo,
      mensaje,
      tipo,
      estudiante_id,
      asistencia_id,
      prioridad,
      categoria,
      datos_adicionales,
      accion_requerida,
    } = body;

    // Validaciones básicas
    if (!usuario_id || !titulo || !mensaje) {
      return c.json({ 
        success: false, 
        message: 'Faltan campos obligatorios' 
      }, 400);
    }

    if (isNaN(usuario_id) || usuario_id <= 0) {
      return c.json({ 
        success: false, 
        message: 'ID de usuario inválido' 
      }, 400);
    }

    const resultado = await NotificacionService.crearNotificacion({
      usuario_id,
      titulo,
      mensaje,
      tipo,
      estudiante_id,
      asistencia_id,
      prioridad,
      categoria,
      datos_adicionales,
      accion_requerida,
    });

    if (!resultado.success) {
      return c.json(resultado, 500);
    }

    return c.json(resultado, 201);
  } catch (error) {
    console.error('Error en crear notificación:', error);
    return c.json({ 
      success: false, 
      message: 'Error interno del servidor' 
    }, 500);
  }
});

/**
 * POST /api/notificaciones/asistencia
 * Crear notificación de asistencia automática
 */
notificacionController.post('/asistencia', async (c) => {
  try {
    const body = await c.req.json();
    const {
      estudiante_id,
      apoderado_id,
      hora,
      estado,
      observaciones,
    } = body;

    // Validaciones básicas
    if (!estudiante_id || !apoderado_id || !hora || !estado) {
      return c.json({ 
        success: false, 
        message: 'Faltan campos obligatorios' 
      }, 400);
    }

    if (isNaN(estudiante_id) || estudiante_id <= 0) {
      return c.json({ 
        success: false, 
        message: 'ID de estudiante inválido' 
      }, 400);
    }

    if (isNaN(apoderado_id) || apoderado_id <= 0) {
      return c.json({ 
        success: false, 
        message: 'ID de apoderado inválido' 
      }, 400);
    }

    const resultado = await NotificacionService.crearNotificacionAsistencia(
      estudiante_id,
      apoderado_id,
      {
        hora,
        estado,
        observaciones,
      }
    );

    if (!resultado.success) {
      return c.json(resultado, 500);
    }

    return c.json(resultado, 201);
  } catch (error) {
    console.error('Error en crear notificación de asistencia:', error);
    return c.json({ 
      success: false, 
      message: 'Error interno del servidor' 
    }, 500);
  }
});

/**
 * POST /api/notificaciones/permiso
 * Crear notificación de permiso automática
 */
notificacionController.post('/permiso', async (c) => {
  try {
    const body = await c.req.json();
    const { solicitud_id, tipo } = body;

    // Validaciones básicas
    if (!solicitud_id || !tipo) {
      return c.json({ 
        success: false, 
        message: 'Faltan campos obligatorios' 
      }, 400);
    }

    if (isNaN(solicitud_id) || solicitud_id <= 0) {
      return c.json({ 
        success: false, 
        message: 'ID de solicitud inválido' 
      }, 400);
    }

    if (!['solicitud', 'aprobacion', 'rechazo'].includes(tipo)) {
      return c.json({ 
        success: false, 
        message: 'Tipo de notificación no válido' 
      }, 400);
    }

    const resultado = await NotificacionService.crearNotificacionPermiso(
      solicitud_id,
      tipo as 'solicitud' | 'aprobacion' | 'rechazo'
    );

    if (!resultado.success) {
      return c.json(resultado, 500);
    }

    return c.json(resultado, 201);
  } catch (error) {
    console.error('Error en crear notificación de permiso:', error);
    return c.json({ 
      success: false, 
      message: 'Error interno del servidor' 
    }, 500);
  }
});

export default notificacionController;
