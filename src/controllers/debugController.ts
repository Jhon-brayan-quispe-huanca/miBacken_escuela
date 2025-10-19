import { Hono } from 'hono';
import { PrismaClient } from '../../generated/prisma/index.js';

const prisma = new PrismaClient();

export const debugController = new Hono();

/**
 * Endpoint público para debug de asignaciones del profesor
 * GET /api/debug/profesor-asignaciones?profesor_id=:id
 */
debugController.get('/profesor-asignaciones', async (c) => {
  try {
    const profesorIdParam = c.req.query('profesor_id');
    console.log('🔍 DEBUG: Profesor ID recibido:', profesorIdParam);
    
    if (!profesorIdParam) {
      return c.json({ success: false, message: 'ID de profesor requerido' }, 400);
    }
    
    const profesorId = parseInt(profesorIdParam);
    console.log('🔍 DEBUG: Profesor ID parseado:', profesorId);
    
    if (isNaN(profesorId) || profesorId <= 0) {
      return c.json({ success: false, message: 'ID de profesor inválido' }, 400);
    }

    console.log('🔍 DEBUG: Buscando asignaciones para profesor ID:', profesorId);
    
    const gradosSecciones = await prisma.profesor_grado_seccion.findMany({
      where: { profesor_id: profesorId, activo: true },
      include: {
        grados: true,
        secciones: true,
      },
    });

    console.log('🔍 DEBUG: Asignaciones encontradas:', gradosSecciones.length);
    console.log('🔍 DEBUG: Datos de asignaciones:', gradosSecciones);

    return c.json({ success: true, data: gradosSecciones });
  } catch (error: any) {
    console.error('Error al obtener grados y secciones del profesor:', error);
    return c.json({ success: false, message: error.message || 'Error interno del servidor' }, 500);
  }
});

/**
 * Endpoint público para debug de usuario del profesor
 * GET /api/debug/profesor-usuario?profesor_id=:id
 */
debugController.get('/profesor-usuario', async (c) => {
  try {
    const profesorIdParam = c.req.query('profesor_id');
    console.log('🔍 DEBUG: Profesor ID recibido:', profesorIdParam);
    
    if (!profesorIdParam) {
      return c.json({ success: false, message: 'ID de profesor requerido' }, 400);
    }
    
    const profesorId = parseInt(profesorIdParam);
    console.log('🔍 DEBUG: Profesor ID parseado:', profesorId);
    
    if (isNaN(profesorId) || profesorId <= 0) {
      return c.json({ success: false, message: 'ID de profesor inválido' }, 400);
    }

    console.log('🔍 DEBUG: Buscando profesor con usuario para ID:', profesorId);
    
    const profesor = await prisma.profesores.findUnique({
      where: { id: profesorId },
      include: {
        usuarios: true,
      },
    });

    console.log('🔍 DEBUG: Profesor encontrado:', profesor ? 'SÍ' : 'NO');
    console.log('🔍 DEBUG: Datos del profesor:', profesor);

    return c.json({ success: true, data: profesor });
  } catch (error: any) {
    console.error('Error al obtener profesor con usuario:', error);
    return c.json({ success: false, message: error.message || 'Error interno del servidor' }, 500);
  }
});
