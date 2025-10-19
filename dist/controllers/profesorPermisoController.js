import { Hono } from 'hono';
import { PrismaClient } from '../../generated/prisma/index.js';
import { permisoService } from '../services/permisoService.js';
import NotificacionService from '../services/notificacionService.js';
const prisma = new PrismaClient();
export const profesorPermisoController = new Hono();
/**
 * Obtener solicitudes de permisos pendientes para el profesor
 * GET /api/profesor/permisos/pendientes?profesor_id=:id
 */
profesorPermisoController.get('/permisos/pendientes', async (c) => {
    try {
        const profesorIdParam = c.req.query('profesor_id');
        if (!profesorIdParam) {
            return c.json({
                success: false,
                message: 'ID de profesor requerido'
            }, 400);
        }
        const profesorId = parseInt(profesorIdParam);
        if (isNaN(profesorId) || profesorId <= 0) {
            return c.json({
                success: false,
                message: 'ID de profesor inválido'
            }, 400);
        }
        // Verificar que el profesor existe
        const profesor = await prisma.profesores.findUnique({
            where: { id: profesorId },
            include: {
                usuarios: {
                    select: {
                        nombres: true,
                        apellidos: true,
                        email: true,
                    },
                },
                profesor_grado_seccion: {
                    where: { activo: true },
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
        if (!profesor) {
            return c.json({
                success: false,
                message: 'Profesor no encontrado'
            }, 404);
        }
        // Obtener grados y secciones del profesor
        const gradosSecciones = profesor.profesor_grado_seccion.map(pgs => ({
            grado_id: pgs.grado_id,
            seccion_id: pgs.seccion_id,
            grado_nombre: pgs.grados.nombre,
            seccion_nombre: pgs.secciones.nombre,
        }));
        if (gradosSecciones.length === 0) {
            return c.json({
                success: true,
                data: {
                    profesor: {
                        id: profesor.id,
                        nombres: profesor.usuarios.nombres,
                        apellidos: profesor.usuarios.apellidos,
                        email: profesor.usuarios.email,
                    },
                    grados_secciones: gradosSecciones,
                    solicitudes: [],
                },
            });
        }
        // Obtener estudiantes de los grados/secciones del profesor
        const estudiantesIds = await prisma.estudiantes.findMany({
            where: {
                OR: gradosSecciones.map(gs => ({
                    grado_id: gs.grado_id,
                    seccion_id: gs.seccion_id,
                })),
            },
            select: { id: true },
        });
        const estudiantesIdsArray = estudiantesIds.map(e => e.id);
        if (estudiantesIdsArray.length === 0) {
            return c.json({
                success: true,
                data: {
                    profesor: {
                        id: profesor.id,
                        nombres: profesor.usuarios.nombres,
                        apellidos: profesor.usuarios.apellidos,
                        email: profesor.usuarios.email,
                    },
                    grados_secciones: gradosSecciones,
                    solicitudes: [],
                },
            });
        }
        // Obtener solicitudes pendientes de los estudiantes del profesor
        const solicitudes = await prisma.solicitudes_permisos.findMany({
            where: {
                estudiante_id: { in: estudiantesIdsArray },
                estado: 'Pendiente',
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
                apoderados: {
                    include: {
                        usuarios: {
                            select: {
                                nombres: true,
                                apellidos: true,
                                email: true,
                                telefono: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                fecha_solicitud: 'desc',
            },
        });
        return c.json({
            success: true,
            data: {
                profesor: {
                    id: profesor.id,
                    nombres: profesor.usuarios.nombres,
                    apellidos: profesor.usuarios.apellidos,
                    email: profesor.usuarios.email,
                },
                grados_secciones: gradosSecciones,
                solicitudes: solicitudes.map(solicitud => ({
                    id: solicitud.id,
                    estudiante: {
                        id: solicitud.estudiantes.id,
                        nombres: solicitud.estudiantes.nombres,
                        apellidos: solicitud.estudiantes.apellidos,
                        grado: solicitud.estudiantes.grados.nombre,
                        seccion: solicitud.estudiantes.secciones.nombre,
                    },
                    apoderado: {
                        id: solicitud.apoderados.id,
                        nombres: solicitud.apoderados.usuarios.nombres,
                        apellidos: solicitud.apoderados.usuarios.apellidos,
                        email: solicitud.apoderados.usuarios.email,
                        telefono: solicitud.apoderados.usuarios.telefono,
                    },
                    fecha_solicitud: solicitud.fecha_solicitud,
                    fecha_permiso_inicio: solicitud.fecha_permiso_inicio,
                    fecha_permiso_fin: solicitud.fecha_permiso_fin,
                    motivo: solicitud.motivo,
                    estado: solicitud.estado,
                    // Campos de documento (opcionales)
                    documento_path: solicitud.documento_path,
                    documento_nombre: solicitud.documento_nombre,
                    documento_tipo: solicitud.documento_tipo,
                    created_at: solicitud.created_at,
                })),
            },
        });
    }
    catch (error) {
        console.error('Error al obtener solicitudes pendientes:', error);
        return c.json({
            success: false,
            message: 'Error interno del servidor'
        }, 500);
    }
});
/**
 * Responder a una solicitud de permiso (aprobar/rechazar)
 * PUT /api/profesor/permisos/:id/responder
 */
profesorPermisoController.put('/permisos/:id/responder', async (c) => {
    try {
        const solicitudId = parseInt(c.req.param('id'));
        const body = await c.req.json();
        const { profesor_id, accion, observaciones } = body;
        if (isNaN(solicitudId) || solicitudId <= 0) {
            return c.json({
                success: false,
                message: 'ID de solicitud inválido',
            }, 400);
        }
        if (!profesor_id || !accion) {
            return c.json({
                success: false,
                message: 'Datos requeridos: profesor_id, accion',
            }, 400);
        }
        if (!['aprobar', 'rechazar'].includes(accion)) {
            return c.json({
                success: false,
                message: 'Acción debe ser "aprobar" o "rechazar"',
            }, 400);
        }
        // Verificar que la solicitud existe y está pendiente
        const solicitud = await prisma.solicitudes_permisos.findFirst({
            where: {
                id: solicitudId,
                estado: 'Pendiente',
            },
            include: {
                estudiantes: {
                    include: {
                        grados: true,
                        secciones: true,
                    },
                },
                apoderados: {
                    include: {
                        usuarios: true,
                    },
                },
            },
        });
        if (!solicitud) {
            return c.json({
                success: false,
                message: 'Solicitud no encontrada o ya procesada',
            }, 404);
        }
        // Verificar que el profesor puede responder esta solicitud
        const profesorPuedeResponder = await prisma.profesor_grado_seccion.findFirst({
            where: {
                profesor_id: parseInt(profesor_id),
                grado_id: solicitud.estudiantes.grado_id,
                seccion_id: solicitud.estudiantes.seccion_id,
                activo: true,
            },
        });
        if (!profesorPuedeResponder) {
            return c.json({
                success: false,
                message: 'No tienes permisos para responder esta solicitud',
            }, 403);
        }
        // Obtener el usuario_id del profesor
        const profesor = await prisma.profesores.findUnique({
            where: { id: parseInt(profesor_id) },
            select: { usuario_id: true },
        });
        if (!profesor) {
            return c.json({
                success: false,
                message: 'Profesor no encontrado',
            }, 404);
        }
        // Actualizar la solicitud
        const estado = accion === 'aprobar' ? 'Aprobado' : 'Rechazado';
        const solicitudActualizada = await prisma.solicitudes_permisos.update({
            where: { id: solicitudId },
            data: {
                estado,
                aprobado_por: profesor.usuario_id,
                fecha_respuesta: new Date(),
                observaciones_respuesta: observaciones?.trim() || null,
                updated_at: new Date(),
            },
        });
        // Si se aprueba, marcar automáticamente como justificado
        if (accion === 'aprobar') {
            await permisoService.marcarComoJustificado(solicitudId);
        }
        // 🔔 CREAR NOTIFICACIÓN AUTOMÁTICA AL APODERADO
        try {
            const tipoNotificacion = accion === 'aprobar' ? 'aprobacion' : 'rechazo';
            await NotificacionService.crearNotificacionPermiso(solicitudId, tipoNotificacion);
            console.log(`🔔 Notificación de ${tipoNotificacion} enviada al apoderado`);
        }
        catch (notificacionError) {
            // No fallar la aprobación si falla la notificación
            console.error('Error al enviar notificación:', notificacionError);
        }
        return c.json({
            success: true,
            message: `Solicitud ${accion === 'aprobar' ? 'aprobada' : 'rechazada'} exitosamente`,
            data: {
                id: solicitudActualizada.id,
                estado: solicitudActualizada.estado,
                fecha_respuesta: solicitudActualizada.fecha_respuesta,
                observaciones_respuesta: solicitudActualizada.observaciones_respuesta,
            },
        });
    }
    catch (error) {
        console.error('Error al responder solicitud:', error);
        return c.json({
            success: false,
            message: 'Error interno del servidor',
        }, 500);
    }
});
/**
 * Obtener historial de solicitudes respondidas por el profesor
 * GET /api/profesor/permisos/historial?profesor_id=:id
 */
profesorPermisoController.get('/permisos/historial', async (c) => {
    try {
        const profesorIdParam = c.req.query('profesor_id');
        if (!profesorIdParam) {
            return c.json({
                success: false,
                message: 'ID de profesor requerido'
            }, 400);
        }
        const profesorId = parseInt(profesorIdParam);
        if (isNaN(profesorId) || profesorId <= 0) {
            return c.json({
                success: false,
                message: 'ID de profesor inválido'
            }, 400);
        }
        // Obtener el usuario_id del profesor
        const profesor = await prisma.profesores.findUnique({
            where: { id: profesorId },
            select: { usuario_id: true },
        });
        if (!profesor) {
            return c.json({
                success: false,
                message: 'Profesor no encontrado',
            }, 404);
        }
        // Obtener solicitudes respondidas por el profesor
        const solicitudes = await prisma.solicitudes_permisos.findMany({
            where: {
                aprobado_por: profesor.usuario_id,
                estado: { in: ['Aprobado', 'Rechazado'] },
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
                apoderados: {
                    include: {
                        usuarios: {
                            select: {
                                nombres: true,
                                apellidos: true,
                                email: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                fecha_respuesta: 'desc',
            },
        });
        return c.json({
            success: true,
            data: solicitudes.map(solicitud => ({
                id: solicitud.id,
                estudiante: {
                    nombres: solicitud.estudiantes.nombres,
                    apellidos: solicitud.estudiantes.apellidos,
                    grado: solicitud.estudiantes.grados.nombre,
                    seccion: solicitud.estudiantes.secciones.nombre,
                },
                apoderado: {
                    nombres: solicitud.apoderados.usuarios.nombres,
                    apellidos: solicitud.apoderados.usuarios.apellidos,
                    email: solicitud.apoderados.usuarios.email,
                },
                fecha_solicitud: solicitud.fecha_solicitud,
                fecha_permiso_inicio: solicitud.fecha_permiso_inicio,
                fecha_permiso_fin: solicitud.fecha_permiso_fin,
                motivo: solicitud.motivo,
                estado: solicitud.estado,
                fecha_respuesta: solicitud.fecha_respuesta,
                observaciones_respuesta: solicitud.observaciones_respuesta,
            })),
        });
    }
    catch (error) {
        console.error('Error al obtener historial:', error);
        return c.json({
            success: false,
            message: 'Error interno del servidor'
        }, 500);
    }
});
/**
 * Obtener grados y secciones asignados al profesor
 * GET /api/profesor/permisos/grados-secciones?profesor_id=:id
 */
profesorPermisoController.get('/permisos/grados-secciones', async (c) => {
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
    }
    catch (error) {
        console.error('Error al obtener grados y secciones del profesor:', error);
        return c.json({ success: false, message: error.message || 'Error interno del servidor' }, 500);
    }
});
/**
 * Endpoint simple para verificar asignaciones del profesor (sin autenticación)
 * GET /api/profesor/debug/asignaciones?profesor_id=:id
 */
profesorPermisoController.get('/debug/asignaciones', async (c) => {
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
    }
    catch (error) {
        console.error('Error al obtener grados y secciones del profesor:', error);
        return c.json({ success: false, message: error.message || 'Error interno del servidor' }, 500);
    }
});
//# sourceMappingURL=profesorPermisoController.js.map