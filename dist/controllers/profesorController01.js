import { PrismaClient } from '../../generated/prisma/index.js';
const prisma = new PrismaClient();
/**
 * Controller específico para las funcionalidades del profesor
 * Este controller maneja las operaciones que los profesores realizan
 * desde su área en la aplicación Flutter
 */
export class ProfesorController01 {
    // Marcar asistencia como justificada automáticamente por permiso activo en asistencia_salon
    static async marcarAsistenciaJustificadaAutomaticamente(estudianteId, profesorId, permiso) {
        const { getFechaActualPeru, getInicioDiaPeru, getFinDiaPeru } = await import('../utils/dateUtils.js');
        const fechaHoyPeru = new Date(getFechaActualPeru()); // Convertir a Date object
        const inicioDiaPeru = new Date(getInicioDiaPeru()); // Convertir a Date object
        const finDiaPeru = new Date(getFinDiaPeru()); // Convertir a Date object
        // Verificar si ya existe asistencia para hoy
        const asistenciaExistente = await prisma.asistencia_salon.findFirst({
            where: {
                estudiante_id: estudianteId,
                profesor_id: profesorId,
                fecha: {
                    gte: inicioDiaPeru,
                    lte: finDiaPeru
                }
            }
        });
        if (asistenciaExistente) {
            // Si ya existe, actualizar como justificado
            return await prisma.asistencia_salon.update({
                where: { id: asistenciaExistente.id },
                data: {
                    estado: 'Justificado',
                    observaciones: `Justificado automáticamente por permiso activo: ${permiso.motivo}`
                }
            });
        }
        else {
            // Si no existe, crear nueva asistencia como justificado
            return await prisma.asistencia_salon.create({
                data: {
                    estudiante_id: estudianteId,
                    profesor_id: profesorId,
                    fecha: fechaHoyPeru,
                    estado: 'Justificado',
                    observaciones: `Justificado automáticamente por permiso activo: ${permiso.motivo}`
                }
            });
        }
    }
    // ========================================
    // OBTENER PROFESOR POR USUARIO ID
    // ========================================
    /**
     * Obtener información del profesor por usuario ID
     * GET /profesor/:usuarioId
     */
    static async obtenerProfesorPorUsuarioId(c) {
        try {
            const usuarioId = parseInt(c.req.param('usuarioId'));
            if (isNaN(usuarioId) || usuarioId <= 0) {
                return c.json({
                    success: false,
                    message: 'ID de usuario inválido'
                }, 400);
            }
            console.log('🔍 ProfesorController01.obtenerProfesorPorUsuarioId - Usuario ID:', usuarioId);
            const profesor = await prisma.profesores.findFirst({
                where: { usuario_id: usuarioId },
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
            console.log('✅ ProfesorController01.obtenerProfesorPorUsuarioId - Profesor encontrado:', profesor.id);
            return c.json({
                success: true,
                data: {
                    id: profesor.id,
                    nombres: profesor.usuarios.nombres,
                    apellidos: profesor.usuarios.apellidos,
                    email: profesor.usuarios.email,
                    tipo_profesor: profesor.tipo_profesor,
                    asignaciones: profesor.profesor_grado_seccion.map(pgs => ({
                        id: pgs.id,
                        grado: pgs.grados.nombre,
                        seccion: pgs.secciones.nombre,
                        es_tutor: pgs.es_tutor,
                        anio_escolar: pgs.anio_escolar,
                    })),
                },
            });
        }
        catch (error) {
            console.error('Error al obtener profesor por usuario ID:', error);
            return c.json({
                success: false,
                message: 'Error interno del servidor'
            }, 500);
        }
    }
    // ========================================
    // DASHBOARD DEL PROFESOR
    // ========================================
    /**
     * Obtener estadísticas generales para el dashboard del profesor
     */
    static async obtenerDashboard(c) {
        try {
            const user = c.get('user');
            console.log('🔍 ProfesorController01.obtenerDashboard - Usuario recibido:', user);
            console.log('🔍 Verificación: user existe?', !!user);
            console.log('🔍 Verificación: user.rol_id =', user?.rol_id);
            console.log('🔍 Verificación: user.rol_id !== 2 =', user?.rol_id !== 3);
            if (!user) {
                console.log('❌ Acceso denegado - Usuario no encontrado');
                return c.json({ message: 'Usuario no autenticado' }, 401);
            }
            if (user.rol_id !== 2) {
                console.log('❌ Acceso denegado - Rol incorrecto. Rol actual:', user.rol_id, 'Rol esperado: 2');
                return c.json({ message: 'Acceso denegado. Solo profesores pueden acceder.' }, 403);
            }
            const profesor = await prisma.profesores.findFirst({
                where: { usuario_id: user.id }
            });
            if (!profesor) {
                return c.json({ message: 'Profesor no encontrado' }, 404);
            }
            // Obtener asignaciones del profesor
            const asignaciones = await prisma.profesor_grado_seccion.findMany({
                where: { profesor_id: profesor.id },
                include: {
                    grados: true,
                    secciones: true
                }
            });
            // Contar estudiantes totales
            const totalEstudiantes = await prisma.estudiantes.count({
                where: {
                    grado_id: { in: asignaciones.map(a => a.grado_id) },
                    seccion_id: { in: asignaciones.map(a => a.seccion_id) },
                    estado: 'Activo'
                }
            });
            // Obtener asistencias de hoy
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            const mañana = new Date(hoy);
            mañana.setDate(mañana.getDate() + 1);
            const asistenciasHoy = await prisma.asistencia_salon.count({
                where: {
                    fecha: {
                        gte: hoy,
                        lt: mañana
                    },
                    profesor_id: profesor.id
                }
            });
            return c.json({
                success: true,
                data: {
                    totalAsignaciones: asignaciones.length,
                    totalEstudiantes,
                    asistenciasHoy,
                    asignaciones: asignaciones.map(a => ({
                        id: a.id,
                        grado: a.grados.nombre,
                        seccion: a.secciones.nombre,
                        esTutor: a.es_tutor,
                        anioEscolar: a.anio_escolar
                    }))
                }
            });
        }
        catch (error) {
            console.error('Error al obtener dashboard del profesor:', error);
            return c.json({ message: 'Error interno del servidor' }, 500);
        }
    }
    // ========================================
    // PERFIL DEL PROFESOR
    // ========================================
    /**
     * Obtener información del perfil del profesor
     */
    static async obtenerPerfil(c) {
        try {
            const user = c.get('user');
            if (!user || user.rol_id !== 2) {
                return c.json({ message: 'Acceso denegado. Solo profesores pueden acceder.' }, 403);
            }
            const profesor = await prisma.profesores.findFirst({
                where: { usuario_id: user.id },
                include: {
                    usuarios: {
                        select: {
                            nombres: true,
                            apellidos: true,
                            email: true,
                            dni: true,
                            telefono: true
                        }
                    }
                }
            });
            if (!profesor) {
                return c.json({ message: 'Profesor no encontrado' }, 404);
            }
            return c.json({
                success: true,
                data: {
                    id: profesor.id,
                    nombres: profesor.usuarios.nombres,
                    apellidos: profesor.usuarios.apellidos,
                    email: profesor.usuarios.email,
                    dni: profesor.usuarios.dni,
                    telefono: profesor.usuarios.telefono,
                    especialidad: profesor.especialidad,
                    fechaIngreso: profesor.fecha_ingreso
                }
            });
        }
        catch (error) {
            console.error('Error al obtener perfil del profesor:', error);
            return c.json({ message: 'Error interno del servidor' }, 500);
        }
    }
    /**
     * Actualizar información del perfil del profesor
     */
    static async actualizarPerfil(c) {
        try {
            const user = c.get('user');
            if (!user || user.rol_id !== 2) {
                return c.json({ message: 'Acceso denegado. Solo profesores pueden acceder.' }, 403);
            }
            const { telefono, especialidad } = await c.req.json();
            const profesor = await prisma.profesores.findFirst({
                where: { usuario_id: user.id }
            });
            if (!profesor) {
                return c.json({ message: 'Profesor no encontrado' }, 404);
            }
            // Actualizar datos del usuario
            if (telefono) {
                await prisma.usuarios.update({
                    where: { id: user.id },
                    data: { telefono }
                });
            }
            // Actualizar datos del profesor
            if (especialidad) {
                await prisma.profesores.update({
                    where: { id: profesor.id },
                    data: { especialidad }
                });
            }
            return c.json({
                success: true,
                message: 'Perfil actualizado exitosamente'
            });
        }
        catch (error) {
            console.error('Error al actualizar perfil del profesor:', error);
            return c.json({ message: 'Error interno del servidor' }, 500);
        }
    }
    // ========================================
    // MATERIAS Y ASIGNACIONES
    // ========================================
    /**
     * Obtener asignaciones del profesor (grados y secciones)
     */
    static async obtenerAsignaciones(c) {
        try {
            const user = c.get('user');
            console.log('🔍 ProfesorController01.obtenerAsignaciones - Usuario recibido:', user);
            if (!user || user.rol_id !== 2) {
                console.log('❌ ProfesorController01.obtenerAsignaciones - Acceso denegado');
                return c.json({ message: 'Acceso denegado. Solo profesores pueden acceder.' }, 403);
            }
            console.log('🔍 ProfesorController01.obtenerAsignaciones - Buscando profesor con usuario_id:', user.id);
            const profesor = await prisma.profesores.findFirst({
                where: { usuario_id: user.id }
            });
            console.log('🔍 ProfesorController01.obtenerAsignaciones - Profesor encontrado:', profesor ? 'SÍ' : 'NO');
            if (profesor) {
                console.log('🔍 ProfesorController01.obtenerAsignaciones - Profesor ID:', profesor.id);
            }
            if (!profesor) {
                console.log('❌ ProfesorController01.obtenerAsignaciones - Profesor no encontrado');
                return c.json({ message: 'Profesor no encontrado' }, 404);
            }
            console.log('🔍 ProfesorController01.obtenerAsignaciones - Buscando asignaciones para profesor_id:', profesor.id);
            const asignaciones = await prisma.profesor_grado_seccion.findMany({
                where: { profesor_id: profesor.id },
                include: {
                    grados: true,
                    secciones: true
                }
            });
            console.log('🔍 ProfesorController01.obtenerAsignaciones - Asignaciones encontradas:', asignaciones.length);
            console.log('🔍 ProfesorController01.obtenerAsignaciones - Datos de asignaciones:', asignaciones);
            return c.json({
                success: true,
                data: asignaciones.map(a => ({
                    id: a.id,
                    grado: a.grados.nombre,
                    seccion: a.secciones.nombre,
                    gradoId: a.grado_id,
                    seccionId: a.seccion_id,
                    esTutor: a.es_tutor,
                    anioEscolar: a.anio_escolar,
                    activo: a.activo
                }))
            });
        }
        catch (error) {
            console.error('Error al obtener asignaciones del profesor:', error);
            return c.json({ message: 'Error interno del servidor' }, 500);
        }
    }
    /**
     * Obtener estudiantes de una asignación específica
     */
    static async obtenerEstudiantesAsignacion(c) {
        try {
            const user = c.get('user');
            if (!user || user.rol_id !== 2) {
                return c.json({ message: 'Acceso denegado. Solo profesores pueden acceder.' }, 403);
            }
            const asignacionId = parseInt(c.req.param('asignacionId'));
            console.log('🔍 ProfesorController01.obtenerEstudiantesAsignacion - Asignación ID:', asignacionId);
            console.log('🔍 ProfesorController01.obtenerEstudiantesAsignacion - Usuario ID:', user.id);
            const profesor = await prisma.profesores.findFirst({
                where: { usuario_id: user.id }
            });
            console.log('🔍 ProfesorController01.obtenerEstudiantesAsignacion - Profesor encontrado:', profesor ? 'SÍ' : 'NO');
            if (profesor) {
                console.log('🔍 ProfesorController01.obtenerEstudiantesAsignacion - Profesor ID:', profesor.id);
            }
            if (!profesor) {
                return c.json({ message: 'Profesor no encontrado' }, 404);
            }
            // Verificar que la asignación pertenece al profesor
            const asignacion = await prisma.profesor_grado_seccion.findFirst({
                where: {
                    id: asignacionId,
                    profesor_id: profesor.id
                }
            });
            console.log('🔍 ProfesorController01.obtenerEstudiantesAsignacion - Asignación encontrada:', asignacion ? 'SÍ' : 'NO');
            if (asignacion) {
                console.log('🔍 ProfesorController01.obtenerEstudiantesAsignacion - Asignación datos:', asignacion);
            }
            if (!asignacion) {
                return c.json({ message: 'Asignación no encontrada o no autorizada' }, 404);
            }
            const estudiantes = await prisma.estudiantes.findMany({
                where: {
                    grado_id: asignacion.grado_id,
                    seccion_id: asignacion.seccion_id,
                    estado: 'Activo'
                },
                include: {
                    solicitudes_permisos: {
                        where: {
                            estado: 'Aprobado',
                            fecha_permiso_inicio: {
                                lte: new Date() // Permiso iniciado antes o hoy
                            },
                            AND: [
                                {
                                    OR: [
                                        {
                                            fecha_permiso_fin: {
                                                gte: new Date() // Permiso termina hoy o después
                                            }
                                        },
                                        {
                                            fecha_permiso_fin: null // Permiso sin fecha de fin
                                        }
                                    ]
                                }
                            ]
                        },
                        select: {
                            id: true,
                            motivo: true,
                            fecha_permiso_inicio: true,
                            fecha_permiso_fin: true
                        }
                    }
                },
                orderBy: [
                    { apellidos: 'asc' },
                    { nombres: 'asc' }
                ]
            });
            const estudiantesResponse = await Promise.all(estudiantes.map(async (e) => {
                // Debug: Mostrar información del estudiante y sus permisos
                console.log(`🔍 DEBUG - Estudiante: ${e.nombres} ${e.apellidos}`);
                console.log(`🔍 DEBUG - Permisos encontrados: ${e.solicitudes_permisos.length}`);
                e.solicitudes_permisos.forEach((permiso, index) => {
                    console.log(`🔍 DEBUG - Permiso ${index + 1}:`, {
                        inicio: permiso.fecha_permiso_inicio,
                        fin: permiso.fecha_permiso_fin,
                        motivo: permiso.motivo
                    });
                });
                // SIMPLIFICAR: Solo considerar permisos que realmente incluyan la fecha actual
                const hoy = new Date();
                const hoyInicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 0, 0, 0, 0);
                const hoyFin = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 23, 59, 59, 999);
                const permisosValidos = e.solicitudes_permisos.filter(permiso => {
                    const inicioPermiso = new Date(permiso.fecha_permiso_inicio);
                    const finPermiso = permiso.fecha_permiso_fin ? new Date(permiso.fecha_permiso_fin) : null;
                    // Si no hay fecha de fin, asumir que el permiso es solo para el día de inicio
                    if (!finPermiso) {
                        const finPermisoCalculado = new Date(inicioPermiso);
                        finPermisoCalculado.setHours(23, 59, 59, 999);
                        const incluyeHoy = inicioPermiso <= hoyFin && finPermisoCalculado >= hoyInicio;
                        console.log(`🔍 DEBUG - Estudiante: ${e.nombres} ${e.apellidos}`);
                        console.log(`🔍 DEBUG - Permiso inicio: ${inicioPermiso.toISOString()}`);
                        console.log(`🔍 DEBUG - Permiso fin (calculado): ${finPermisoCalculado.toISOString()}`);
                        console.log(`🔍 DEBUG - Hoy inicio: ${hoyInicio.toISOString()}`);
                        console.log(`🔍 DEBUG - Hoy fin: ${hoyFin.toISOString()}`);
                        console.log(`🔍 DEBUG - Incluye hoy: ${incluyeHoy}`);
                        return incluyeHoy;
                    }
                    else {
                        // Si hay fecha de fin, usar la lógica normal
                        const incluyeHoy = inicioPermiso <= hoyFin && finPermiso >= hoyInicio;
                        console.log(`🔍 DEBUG - Estudiante: ${e.nombres} ${e.apellidos}`);
                        console.log(`🔍 DEBUG - Permiso inicio: ${inicioPermiso.toISOString()}`);
                        console.log(`🔍 DEBUG - Permiso fin: ${finPermiso.toISOString()}`);
                        console.log(`🔍 DEBUG - Hoy inicio: ${hoyInicio.toISOString()}`);
                        console.log(`🔍 DEBUG - Hoy fin: ${hoyFin.toISOString()}`);
                        console.log(`🔍 DEBUG - Incluye hoy: ${incluyeHoy}`);
                        return incluyeHoy;
                    }
                });
                const tienePermisoActivo = permisosValidos.length > 0;
                console.log(`🔍 DEBUG - Tiene permiso activo: ${tienePermisoActivo}`);
                let asistenciaHoy = null;
                // Si tiene permiso activo, verificar si ya está marcado como justificado
                if (tienePermisoActivo) {
                    const { getInicioDiaPeru, getFinDiaPeru } = await import('../utils/dateUtils.js');
                    const inicioDiaPeru = getInicioDiaPeru();
                    const finDiaPeru = getFinDiaPeru();
                    asistenciaHoy = await prisma.asistencia_salon.findFirst({
                        where: {
                            estudiante_id: e.id,
                            profesor_id: profesor.id,
                            fecha: {
                                gte: inicioDiaPeru,
                                lte: finDiaPeru
                            }
                        }
                    });
                    // Si no tiene asistencia registrada, verificar si tiene permiso activo
                    if (!asistenciaHoy) {
                        // Solo marcar como justificado si tiene permiso activo
                        if (e.solicitudes_permisos && e.solicitudes_permisos.length > 0) {
                            asistenciaHoy = await ProfesorController01.marcarAsistenciaJustificadaAutomaticamente(e.id, profesor.id, e.solicitudes_permisos[0]);
                        }
                        // Si no tiene permiso, se marcará como ausente cuando el profesor tome asistencia
                    }
                }
                return {
                    id: e.id,
                    nombres: e.nombres,
                    apellidos: e.apellidos,
                    dni: e.dni,
                    tiene_permiso_activo: tienePermisoActivo,
                    asistenciaHoy: asistenciaHoy,
                    permisos: e.solicitudes_permisos.map(p => ({
                        id: p.id,
                        motivo: p.motivo,
                        fecha_inicio: p.fecha_permiso_inicio,
                        fecha_fin: p.fecha_permiso_fin
                    }))
                };
            }));
            console.log('🎓 Estudiantes encontrados:', estudiantesResponse);
            console.log('🔢 Tipo de datos:', typeof estudiantesResponse);
            console.log('📊 Es array:', Array.isArray(estudiantesResponse));
            return c.json({
                success: true,
                data: estudiantesResponse
            });
        }
        catch (error) {
            console.error('Error al obtener estudiantes:', error);
            return c.json({ message: 'Error interno del servidor' }, 500);
        }
    }
    // ========================================
    // REGISTRO DE ASISTENCIAS
    // ========================================
    /**
     * Registrar asistencia de estudiantes
     */
    static async registrarAsistencia(c) {
        try {
            const user = c.get('user');
            if (!user || user.rol_id !== 2) {
                return c.json({ message: 'Acceso denegado. Solo profesores pueden acceder.' }, 403);
            }
            const requestBody = await c.req.json();
            console.log('📦 Datos recibidos en el backend:', JSON.stringify(requestBody, null, 2));
            const { asignacion_id: asignacionId, asistencias: estudiantes, fecha } = requestBody;
            console.log('🔍 Valores extraídos:', { asignacionId, estudiantes, fecha });
            const profesor = await prisma.profesores.findFirst({
                where: { usuario_id: user.id }
            });
            if (!profesor) {
                return c.json({ message: 'Profesor no encontrado' }, 404);
            }
            // Verificar que la asignación pertenece al profesor
            const asignacion = await prisma.profesor_grado_seccion.findFirst({
                where: {
                    id: asignacionId,
                    profesor_id: profesor.id
                }
            });
            if (!asignacion) {
                return c.json({ message: 'Asignación no encontrada o no autorizada' }, 404);
            }
            // Registrar asistencias usando findFirst y create/update
            // Convertir a hora de Perú (UTC-5)
            const fechaAsistencia = new Date(fecha);
            const fechaInicio = new Date(fechaAsistencia);
            fechaInicio.setUTCHours(5, 0, 0, 0); // 00:00:00 hora de Perú = 05:00:00 UTC
            const fechaFin = new Date(fechaAsistencia);
            fechaFin.setUTCHours(4, 59, 59, 999); // 23:59:59 hora de Perú = 04:59:59 UTC del día siguiente
            console.log('🔍 DEBUG - Fecha de asistencia (Perú):', fechaAsistencia);
            console.log('🔍 DEBUG - Rango de búsqueda (UTC):', { fechaInicio, fechaFin });
            console.log('🔍 DEBUG - Hora actual UTC:', new Date().toISOString());
            console.log('🔍 DEBUG - Hora actual Perú:', new Date().toLocaleString('es-PE', { timeZone: 'America/Lima' }));
            console.log('🔍 DEBUG - Fecha recibida del frontend:', fecha);
            console.log('🔍 DEBUG - Fecha convertida a Perú:', fechaAsistencia.toLocaleString('es-PE', { timeZone: 'America/Lima' }));
            for (const est of estudiantes) {
                console.log('🔍 DEBUG - Procesando estudiante:', est.estudianteId, 'Estado:', est.estado);
                // Verificar si el estudiante tiene permiso activo
                const estudianteConPermiso = await prisma.estudiantes.findUnique({
                    where: { id: est.estudianteId },
                    include: {
                        solicitudes_permisos: {
                            where: {
                                estado: 'Aprobado',
                                fecha_permiso_inicio: {
                                    lte: new Date()
                                },
                                OR: [
                                    {
                                        fecha_permiso_fin: {
                                            gte: new Date()
                                        }
                                    },
                                    {
                                        fecha_permiso_fin: null
                                    }
                                ]
                            }
                        }
                    }
                });
                const tienePermisoActivo = (estudianteConPermiso?.solicitudes_permisos?.length ?? 0) > 0;
                if (tienePermisoActivo && estudianteConPermiso) {
                    // Si tiene permiso activo, marcar automáticamente como justificado
                    console.log('🔍 DEBUG - Estudiante con permiso activo, marcando como justificado automáticamente');
                    await ProfesorController01.marcarAsistenciaJustificadaAutomaticamente(est.estudianteId, profesor.id, estudianteConPermiso.solicitudes_permisos[0]);
                    continue; // Saltar al siguiente estudiante
                }
                const existingAsistencia = await prisma.asistencia_salon.findFirst({
                    where: {
                        estudiante_id: est.estudianteId,
                        profesor_id: profesor.id,
                        fecha: {
                            gte: fechaInicio,
                            lte: fechaFin
                        }
                    }
                });
                console.log('🔍 DEBUG - Asistencia existente encontrada:', existingAsistencia ? 'Sí' : 'No');
                const estadoFinal = est.estado || (est.presente ? 'Presente' : 'Ausente');
                if (existingAsistencia) {
                    // Actualizar registro existente
                    console.log('🔍 DEBUG - Actualizando asistencia existente ID:', existingAsistencia.id, 'Estado anterior:', existingAsistencia.estado, 'Estado nuevo:', estadoFinal);
                    await prisma.asistencia_salon.update({
                        where: { id: existingAsistencia.id },
                        data: {
                            estado: estadoFinal,
                            profesor_id: profesor.id,
                            updated_at: new Date()
                        }
                    });
                    console.log('🔍 DEBUG - ✅ Asistencia actualizada exitosamente');
                }
                else {
                    // Crear nuevo registro
                    console.log('🔍 DEBUG - Creando nueva asistencia para estudiante:', est.estudianteId, 'Estado:', estadoFinal);
                    await prisma.asistencia_salon.create({
                        data: {
                            estudiante_id: est.estudianteId,
                            fecha: fechaAsistencia,
                            estado: estadoFinal,
                            profesor_id: profesor.id
                        }
                    });
                    console.log('🔍 DEBUG - ✅ Nueva asistencia creada exitosamente');
                }
            }
            return c.json({
                success: true,
                message: 'Asistencia registrada exitosamente'
            });
        }
        catch (error) {
            console.error('Error al registrar asistencia:', error);
            return c.json({ message: 'Error interno del servidor' }, 500);
        }
    }
    // ========================================
    // REPORTES Y ESTADÍSTICAS
    // ========================================
    /**
     * Obtener asignaciones del profesor para filtrado
     */
    static async obtenerAsignacionesParaFiltro(c) {
        try {
            const user = c.get('user');
            console.log('🔍 ProfesorController01.obtenerAsignacionesParaFiltro - Usuario recibido:', user);
            if (!user || user.rol_id !== 2) {
                console.log('❌ ProfesorController01.obtenerAsignacionesParaFiltro - Acceso denegado');
                return c.json({ message: 'Acceso denegado. Solo profesores pueden acceder.' }, 403);
            }
            console.log('🔍 ProfesorController01.obtenerAsignacionesParaFiltro - Buscando profesor con usuario_id:', user.id);
            const profesor = await prisma.profesores.findFirst({
                where: { usuario_id: user.id }
            });
            console.log('🔍 ProfesorController01.obtenerAsignacionesParaFiltro - Profesor encontrado:', profesor ? 'SÍ' : 'NO');
            if (profesor) {
                console.log('🔍 ProfesorController01.obtenerAsignacionesParaFiltro - Profesor ID:', profesor.id);
            }
            if (!profesor) {
                console.log('❌ ProfesorController01.obtenerAsignacionesParaFiltro - Profesor no encontrado');
                return c.json({ message: 'Profesor no encontrado' }, 404);
            }
            // Obtener asignaciones del profesor con información de grado y sección
            console.log('🔍 ProfesorController01.obtenerAsignacionesParaFiltro - Buscando asignaciones para profesor_id:', profesor.id);
            const asignaciones = await prisma.profesor_grado_seccion.findMany({
                where: {
                    profesor_id: profesor.id,
                    activo: true
                },
                include: {
                    grados: {
                        select: {
                            id: true,
                            nombre: true,
                            nivel: true
                        }
                    },
                    secciones: {
                        select: {
                            id: true,
                            nombre: true
                        }
                    }
                },
                orderBy: [
                    { grados: { nombre: 'asc' } },
                    { secciones: { nombre: 'asc' } }
                ]
            });
            console.log('🔍 ProfesorController01.obtenerAsignacionesParaFiltro - Asignaciones encontradas:', asignaciones.length);
            console.log('🔍 ProfesorController01.obtenerAsignacionesParaFiltro - Datos de asignaciones:', asignaciones);
            // Formatear para el frontend
            const asignacionesFormateadas = asignaciones.map(asignacion => ({
                id: asignacion.id,
                grado_id: asignacion.grado_id,
                seccion_id: asignacion.seccion_id,
                grado_nombre: asignacion.grados.nombre,
                grado_nivel: asignacion.grados.nivel,
                seccion_nombre: asignacion.secciones.nombre,
                display_name: `${asignacion.grados.nombre} - ${asignacion.secciones.nombre}`,
                anio_escolar: asignacion.anio_escolar
            }));
            return c.json({
                success: true,
                data: asignacionesFormateadas,
                message: 'Asignaciones obtenidas correctamente'
            });
        }
        catch (error) {
            console.error('Error al obtener asignaciones para filtro:', error);
            return c.json({ message: 'Error interno del servidor' }, 500);
        }
    }
    /**
     * Obtener reportes de asistencia
     */
    static async obtenerReportes(c) {
        try {
            console.log('🔍 ProfesorController01.obtenerReportes - INICIANDO método');
            const user = c.get('user');
            console.log('🔍 ProfesorController01.obtenerReportes - Usuario recibido:', user);
            if (!user || user.rol_id !== 2) {
                console.log('❌ ProfesorController01.obtenerReportes - Acceso denegado');
                return c.json({ message: 'Acceso denegado. Solo profesores pueden acceder.' }, 403);
            }
            const fechaInicio = c.req.query('fecha_inicio');
            const fechaFin = c.req.query('fecha_fin');
            const asignacionId = c.req.query('asignacion_id');
            console.log('🔍 ProfesorController01.obtenerReportes - Parámetros recibidos:', {
                fechaInicio,
                fechaFin,
                asignacionId
            });
            console.log('🔍 ProfesorController01.obtenerReportes - Buscando profesor con usuario_id:', user.id);
            const profesor = await prisma.profesores.findFirst({
                where: { usuario_id: user.id }
            });
            console.log('🔍 ProfesorController01.obtenerReportes - Profesor encontrado:', profesor ? 'SÍ' : 'NO');
            if (profesor) {
                console.log('🔍 ProfesorController01.obtenerReportes - Profesor ID:', profesor.id);
            }
            if (!profesor) {
                console.log('❌ ProfesorController01.obtenerReportes - Profesor no encontrado');
                return c.json({ message: 'Profesor no encontrado' }, 404);
            }
            console.log('🔍 DEBUG - Parámetros de consulta:', { fechaInicio, fechaFin, asignacionId });
            console.log('🔍 DEBUG - Profesor ID:', profesor.id);
            // Si se especifica una asignación, obtener todos los estudiantes de esa asignación
            if (asignacionId) {
                console.log('🔍 DEBUG - Buscando asignación con ID:', asignacionId);
                const asignacion = await prisma.profesor_grado_seccion.findFirst({
                    where: {
                        id: parseInt(asignacionId),
                        profesor_id: profesor.id
                    }
                });
                if (!asignacion) {
                    return c.json({ message: 'Asignación no encontrada' }, 404);
                }
                // Obtener todos los estudiantes de la asignación
                const todosLosEstudiantes = await prisma.estudiantes.findMany({
                    where: {
                        grado_id: asignacion.grado_id,
                        seccion_id: asignacion.seccion_id,
                        estado: 'Activo'
                    },
                    include: {
                        grados: true,
                        secciones: true
                    }
                });
                console.log('🔍 DEBUG - Todos los estudiantes de la asignación:', todosLosEstudiantes.length);
                // Usar la fecha especificada en los parámetros o la fecha actual
                // Convertir a hora de Perú (UTC-5)
                const fechaConsulta = fechaInicio ? new Date(fechaInicio) : new Date();
                const fechaActual = new Date(fechaConsulta);
                fechaActual.setUTCHours(5, 0, 0, 0); // 00:00:00 hora de Perú = 05:00:00 UTC
                const fechaFinDia = new Date(fechaActual);
                fechaFinDia.setUTCHours(4, 59, 59, 999); // 23:59:59 hora de Perú = 04:59:59 UTC del día siguiente
                console.log('🔍 DEBUG - Fecha de consulta:', fechaConsulta);
                console.log('🔍 DEBUG - Fecha actual (inicio UTC):', fechaActual);
                console.log('🔍 DEBUG - Fecha actual (fin UTC):', fechaFinDia);
                console.log('🔍 DEBUG - Hora actual UTC:', new Date().toISOString());
                console.log('🔍 DEBUG - Hora actual Perú:', new Date().toLocaleString('es-PE', { timeZone: 'America/Lima' }));
                console.log('🔍 DEBUG - Fecha consulta en Perú:', fechaConsulta.toLocaleString('es-PE', { timeZone: 'America/Lima' }));
                // Obtener asistencias solo del día actual
                const whereClauseAsistencias = {
                    profesor_id: profesor.id,
                    estudiante_id: {
                        in: todosLosEstudiantes.map(e => e.id)
                    },
                    fecha: {
                        gte: fechaActual,
                        lte: fechaFinDia
                    }
                };
                console.log('🔍 DEBUG - Consultando asistencias con whereClause:', whereClauseAsistencias);
                const asistenciasExistentes = await prisma.asistencia_salon.findMany({
                    where: whereClauseAsistencias,
                    orderBy: { fecha: 'desc' }
                });
                console.log('🔍 DEBUG - Asistencias encontradas en BD:', asistenciasExistentes.length);
                asistenciasExistentes.forEach(a => {
                    console.log(`  - Estudiante ${a.estudiante_id}: ${a.estado} (${a.fecha})`);
                });
                console.log('🔍 DEBUG - Asistencias existentes para hoy:', asistenciasExistentes.length);
                // Solo usar la fecha actual
                const fechasUnicas = [fechaActual.toISOString().split('T')[0]];
                console.log('🔍 DEBUG - Fecha única (hoy):', fechasUnicas);
                console.log('🔍 DEBUG - Fecha actual para comparación:', fechaActual);
                console.log('🔍 DEBUG - Fecha fin para comparación:', fechaFinDia);
                // Crear un mapa de asistencias por estudiante y fecha
                const asistenciasMap = new Map();
                asistenciasExistentes.forEach(a => {
                    const key = `${a.estudiante_id}-${a.fecha.toISOString().split('T')[0]}`;
                    asistenciasMap.set(key, a);
                });
                // Generar datos para todos los estudiantes del día actual
                const datosCompletos = [];
                const fechaHoyString = fechaActual.toISOString().split('T')[0];
                for (const estudiante of todosLosEstudiantes) {
                    const key = `${estudiante.id}-${fechaHoyString}`;
                    const asistenciaExistente = asistenciasMap.get(key);
                    if (asistenciaExistente) {
                        // Estudiante tiene asistencia registrada para hoy
                        datosCompletos.push({
                            id: asistenciaExistente.id,
                            estudiante_id: estudiante.id,
                            profesor_id: profesor.id,
                            materia_id: 0,
                            fecha: fechaActual,
                            estado: asistenciaExistente.estado,
                            observaciones: asistenciaExistente.observaciones,
                            estudiante: {
                                id: estudiante.id,
                                nombres: estudiante.nombres,
                                apellidos: estudiante.apellidos,
                                dni: estudiante.dni,
                                nombreCompleto: `${estudiante.nombres} ${estudiante.apellidos}`
                            },
                            materia: null,
                            grado: estudiante.grados.nombre,
                            seccion: estudiante.secciones.nombre
                        });
                    }
                    else {
                        // Estudiante sin asistencia registrada para hoy - mostrar para que el profesor pueda marcar
                        datosCompletos.push({
                            id: null,
                            estudiante_id: estudiante.id,
                            profesor_id: profesor.id,
                            materia_id: 0,
                            fecha: fechaActual,
                            estado: 'SIN REGISTRAR',
                            observaciones: null,
                            estudiante: {
                                id: estudiante.id,
                                nombres: estudiante.nombres,
                                apellidos: estudiante.apellidos,
                                dni: estudiante.dni,
                                nombreCompleto: `${estudiante.nombres} ${estudiante.apellidos}`
                            },
                            materia: null,
                            grado: estudiante.grados.nombre,
                            seccion: estudiante.secciones.nombre
                        });
                    }
                }
                // Ordenar por nombre de estudiante (solo hay una fecha - hoy)
                datosCompletos.sort((a, b) => {
                    return a.estudiante.nombreCompleto.localeCompare(b.estudiante.nombreCompleto);
                });
                console.log('🔍 DEBUG - Datos completos generados:', datosCompletos.length);
                console.log('🔍 DEBUG - Primeros 3 registros:', JSON.stringify(datosCompletos.slice(0, 3), null, 2));
                console.log('🔍 DEBUG - Estados de asistencias:', datosCompletos.map(d => ({
                    estudiante: d.estudiante?.nombreCompleto,
                    estado: d.estado,
                    fecha: d.fecha
                })));
                return c.json({
                    success: true,
                    data: datosCompletos
                });
            }
            // Si no se especifica asignación, usar la lógica original
            const whereClause = {
                profesor_id: profesor.id
            };
            if (fechaInicio && fechaFin) {
                whereClause.fecha = {
                    gte: new Date(fechaInicio),
                    lte: new Date(fechaFin)
                };
            }
            const asistencias = await prisma.asistencia_salon.findMany({
                where: whereClause,
                include: {
                    estudiantes: {
                        include: {
                            grados: true,
                            secciones: true
                        }
                    }
                },
                orderBy: { fecha: 'desc' }
            });
            const mappedData = asistencias.map(a => ({
                id: a.id,
                estudiante_id: a.estudiante_id,
                profesor_id: a.profesor_id,
                materia_id: 0,
                fecha: a.fecha,
                estado: a.estado,
                observaciones: a.observaciones,
                estudiante: {
                    id: a.estudiantes.id,
                    nombres: a.estudiantes.nombres,
                    apellidos: a.estudiantes.apellidos,
                    dni: a.estudiantes.dni,
                    nombreCompleto: `${a.estudiantes.nombres} ${a.estudiantes.apellidos}`
                },
                materia: null,
                grado: a.estudiantes.grados.nombre,
                seccion: a.estudiantes.secciones.nombre
            }));
            return c.json({
                success: true,
                data: mappedData
            });
        }
        catch (error) {
            console.error('❌ ProfesorController01.obtenerReportes - Error:', error);
            console.error('❌ ProfesorController01.obtenerReportes - Error stack:', error instanceof Error ? error.stack : 'No stack available');
            return c.json({ message: 'Error interno del servidor' }, 500);
        }
    }
    /**
     * Obtener estadísticas de asistencia por materia
     */
    static async obtenerEstadisticasAsistencia(c) {
        try {
            const user = c.get('user');
            if (!user || user.rol_id !== 2) {
                return c.json({ message: 'Acceso denegado. Solo profesores pueden acceder.' }, 403);
            }
            const profesor = await prisma.profesores.findFirst({
                where: { usuario_id: user.id }
            });
            if (!profesor) {
                return c.json({ message: 'Profesor no encontrado' }, 404);
            }
            // Obtener estadísticas por asignación
            const asignaciones = await prisma.profesor_grado_seccion.findMany({
                where: { profesor_id: profesor.id },
                include: {
                    grados: true,
                    secciones: true
                }
            });
            const estadisticas = await Promise.all(asignaciones.map(async (asignacion) => {
                const totalEstudiantes = await prisma.estudiantes.count({
                    where: {
                        grado_id: asignacion.grado_id,
                        seccion_id: asignacion.seccion_id,
                        estado: 'Activo'
                    }
                });
                // Obtener estudiantes de esta asignación
                const estudiantesAsignacion = await prisma.estudiantes.findMany({
                    where: {
                        grado_id: asignacion.grado_id,
                        seccion_id: asignacion.seccion_id,
                        estado: 'Activo'
                    },
                    select: { id: true }
                });
                const estudiantesIds = estudiantesAsignacion.map(e => e.id);
                const totalAsistencias = await prisma.asistencia_salon.count({
                    where: {
                        profesor_id: profesor.id,
                        estudiante_id: { in: estudiantesIds }
                    }
                });
                const asistenciasPresentes = await prisma.asistencia_salon.count({
                    where: {
                        profesor_id: profesor.id,
                        estudiante_id: { in: estudiantesIds },
                        estado: 'Presente'
                    }
                });
                const porcentajeAsistencia = totalAsistencias > 0
                    ? Math.round((asistenciasPresentes / totalAsistencias) * 100)
                    : 0;
                return {
                    asignacionId: asignacion.id,
                    grado: asignacion.grados.nombre,
                    seccion: asignacion.secciones.nombre,
                    esTutor: asignacion.es_tutor,
                    anioEscolar: asignacion.anio_escolar,
                    totalEstudiantes,
                    totalAsistencias,
                    asistenciasPresentes,
                    porcentajeAsistencia
                };
            }));
            return c.json({
                success: true,
                data: estadisticas
            });
        }
        catch (error) {
            console.error('Error al obtener estadísticas:', error);
            return c.json({ message: 'Error interno del servidor' }, 500);
        }
    }
    // ========================================
    // ACTUALIZACIÓN DE ASISTENCIAS
    // ========================================
    /**
     * Actualizar asistencia existente
     */
    static async actualizarAsistencia(c) {
        try {
            const user = c.get('user');
            if (!user || user.rol_id !== 2) {
                return c.json({ message: 'Acceso denegado. Solo profesores pueden acceder.' }, 403);
            }
            const asistenciaId = parseInt(c.req.param('id'));
            const requestBody = await c.req.json();
            console.log('📦 Datos recibidos para actualizar asistencia:', JSON.stringify(requestBody, null, 2));
            const { estado, observaciones } = requestBody;
            const profesor = await prisma.profesores.findFirst({
                where: { usuario_id: user.id }
            });
            if (!profesor) {
                return c.json({ message: 'Profesor no encontrado' }, 404);
            }
            // Verificar que la asistencia existe y pertenece al profesor
            const asistenciaExistente = await prisma.asistencia_salon.findFirst({
                where: {
                    id: asistenciaId,
                    profesor_id: profesor.id
                }
            });
            if (!asistenciaExistente) {
                return c.json({ message: 'Asistencia no encontrada o no autorizada' }, 404);
            }
            // Actualizar la asistencia
            const asistenciaActualizada = await prisma.asistencia_salon.update({
                where: { id: asistenciaId },
                data: {
                    estado: estado,
                    observaciones: observaciones || null,
                    updated_at: new Date()
                },
                include: {
                    estudiantes: true
                }
            });
            return c.json({
                success: true,
                message: 'Asistencia actualizada exitosamente',
                data: {
                    id: asistenciaActualizada.id,
                    fecha: asistenciaActualizada.fecha,
                    estado: asistenciaActualizada.estado,
                    observaciones: asistenciaActualizada.observaciones,
                    estudiante: {
                        nombres: asistenciaActualizada.estudiantes.nombres,
                        apellidos: asistenciaActualizada.estudiantes.apellidos,
                        dni: asistenciaActualizada.estudiantes.dni
                    }
                }
            });
        }
        catch (error) {
            console.error('Error al actualizar asistencia:', error);
            return c.json({ message: 'Error interno del servidor' }, 500);
        }
    }
    // ========================================
    // ESTADÍSTICAS DEL DASHBOARD DEL PROFESOR
    // ========================================
    /**
     * Obtener estadísticas del dashboard del profesor
     * GET /profesor/:usuarioId/estadisticas
     */
    static async obtenerEstadisticasDashboard(c) {
        try {
            const usuarioId = parseInt(c.req.param('usuarioId'));
            if (isNaN(usuarioId) || usuarioId <= 0) {
                return c.json({
                    success: false,
                    message: 'ID de usuario inválido'
                }, 400);
            }
            // Obtener profesor
            const profesor = await prisma.profesores.findFirst({
                where: { usuario_id: usuarioId },
                include: {
                    profesor_grado_seccion: {
                        where: { activo: true },
                        include: {
                            grados: true,
                            secciones: true
                        }
                    }
                }
            });
            if (!profesor) {
                return c.json({
                    success: false,
                    message: 'Profesor no encontrado'
                }, 404);
            }
            // Obtener IDs de grados y secciones asignados
            const asignaciones = profesor.profesor_grado_seccion;
            const gradoIds = asignaciones.map(a => a.grado_id);
            const seccionIds = asignaciones.map(a => a.seccion_id);
            // Obtener estudiantes de las asignaciones
            const estudiantes = await prisma.estudiantes.findMany({
                where: {
                    grado_id: { in: gradoIds },
                    seccion_id: { in: seccionIds },
                    estado: 'Activo'
                },
                include: {
                    grados: true,
                    secciones: true
                }
            });
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            // Resumen de hoy
            const asistenciasHoy = await prisma.asistencia_salon.count({
                where: {
                    profesor_id: profesor.id,
                    fecha: hoy
                }
            });
            const estudiantesAusentesHoy = await prisma.asistencia_salon.count({
                where: {
                    profesor_id: profesor.id,
                    fecha: hoy,
                    estado: 'Ausente'
                }
            });
            const permisosPendientes = await prisma.solicitudes_permisos.count({
                where: {
                    estado: 'Pendiente',
                    estudiantes: {
                        grado_id: { in: gradoIds },
                        seccion_id: { in: seccionIds }
                    }
                }
            });
            // Estadísticas por asignación
            const estadisticasPorAsignacion = await Promise.all(asignaciones.map(async (asignacion) => {
                const estudiantesAsignacion = estudiantes.filter(e => e.grado_id === asignacion.grado_id && e.seccion_id === asignacion.seccion_id);
                // Asistencia promedio últimos 7 días
                const hace7Dias = new Date();
                hace7Dias.setDate(hace7Dias.getDate() - 7);
                const asistencias7Dias = await prisma.asistencia_salon.count({
                    where: {
                        profesor_id: profesor.id,
                        fecha: { gte: hace7Dias },
                        estado: 'Presente',
                        estudiantes: {
                            grado_id: asignacion.grado_id,
                            seccion_id: asignacion.seccion_id
                        }
                    }
                });
                const totalAsistencias7Dias = await prisma.asistencia_salon.count({
                    where: {
                        profesor_id: profesor.id,
                        fecha: { gte: hace7Dias },
                        estudiantes: {
                            grado_id: asignacion.grado_id,
                            seccion_id: asignacion.seccion_id
                        }
                    }
                });
                const asistenciaPromedio = totalAsistencias7Dias > 0
                    ? Math.round((asistencias7Dias / totalAsistencias7Dias) * 100)
                    : 0;
                return {
                    grado: asignacion.grados.nombre,
                    seccion: asignacion.secciones.nombre,
                    estudiantes: estudiantesAsignacion.length,
                    asistenciaPromedio: asistenciaPromedio
                };
            }));
            return c.json({
                success: true,
                data: {
                    resumenHoy: {
                        asistenciasRegistradas: asistenciasHoy,
                        estudiantesAusentes: estudiantesAusentesHoy,
                        permisosPendientes: permisosPendientes
                    },
                    estadisticasPorAsignacion: estadisticasPorAsignacion
                }
            });
        }
        catch (error) {
            console.error('Error al obtener estadísticas del dashboard:', error);
            return c.json({
                success: false,
                message: 'Error interno del servidor'
            }, 500);
        }
    }
}
//# sourceMappingURL=profesorController01.js.map