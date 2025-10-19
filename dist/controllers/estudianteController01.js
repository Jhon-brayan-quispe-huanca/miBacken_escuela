import { PrismaClient } from '../../generated/prisma/index.js';
const prisma = new PrismaClient();
export class EstudianteController01 {
    // Obtener perfil del estudiante
    static async obtenerPerfil(c) {
        try {
            const user = c.get('user');
            // Verificar que el usuario esté autenticado y sea estudiante
            if (!user || user.rol_id !== 5) { // rol_id 5 es para estudiantes
                return c.json({
                    success: false,
                    message: 'Acceso denegado. Solo estudiantes pueden acceder.'
                }, 403);
            }
            // Obtener datos del estudiante desde la base de datos
            const estudiante = await prisma.estudiantes.findFirst({
                where: {
                    usuario_id: user.id,
                    estado: 'Activo'
                },
                include: {
                    usuarios: {
                        select: {
                            id: true,
                            nombres: true,
                            apellidos: true,
                            dni: true,
                            email: true,
                            telefono: true,
                            direccion: true,
                            created_at: true
                        }
                    },
                    grados: {
                        select: {
                            id: true,
                            nombre: true
                        }
                    },
                    secciones: {
                        select: {
                            id: true,
                            nombre: true
                        }
                    }
                }
            });
            if (!estudiante) {
                return c.json({
                    success: false,
                    message: 'Estudiante no encontrado'
                }, 404);
            }
            const perfilEstudiante = {
                id: estudiante.id,
                nombres: estudiante.usuarios.nombres,
                apellidos: estudiante.usuarios.apellidos,
                dni: estudiante.usuarios.dni,
                email: estudiante.usuarios.email,
                telefono: estudiante.usuarios.telefono,
                direccion: estudiante.usuarios.direccion,
                grado: estudiante.grados.nombre,
                seccion: estudiante.secciones.nombre,
                codigoEstudiante: estudiante.codigo_estudiante,
                fechaIngreso: estudiante.fecha_matricula,
                estado: estudiante.estado,
                turno: estudiante.turno
            };
            return c.json({
                success: true,
                data: perfilEstudiante,
                message: 'Perfil del estudiante obtenido correctamente'
            });
        }
        catch (error) {
            console.error('Error al obtener perfil del estudiante:', error);
            return c.json({
                success: false,
                message: 'Error interno del servidor'
            }, 500);
        }
    }
    // Actualizar perfil del estudiante
    static async actualizarPerfil(c) {
        try {
            const user = c.get('user');
            // Verificar que el usuario esté autenticado y sea estudiante
            if (!user || user.rol_id !== 5) {
                return c.json({
                    success: false,
                    message: 'Acceso denegado. Solo estudiantes pueden acceder.'
                }, 403);
            }
            const { nombres, apellidos, email, telefono, direccion, turno } = await c.req.json();
            // Validaciones básicas
            if (!nombres || !apellidos) {
                return c.json({
                    success: false,
                    message: 'Los campos nombres y apellidos son obligatorios'
                }, 400);
            }
            // Validar turno si se proporciona
            if (turno && !['mañana', 'tarde'].includes(turno)) {
                return c.json({
                    success: false,
                    message: 'El turno debe ser "mañana" o "tarde"'
                }, 400);
            }
            // Verificar que el estudiante existe
            const estudiante = await prisma.estudiantes.findFirst({
                where: {
                    usuario_id: user.id,
                    estado: 'Activo'
                }
            });
            if (!estudiante) {
                return c.json({
                    success: false,
                    message: 'Estudiante no encontrado'
                }, 404);
            }
            // Usar transacción para actualizar tanto usuario como estudiante
            const resultado = await prisma.$transaction(async (tx) => {
                // Actualizar datos del usuario
                const usuarioActualizado = await tx.usuarios.update({
                    where: { id: user.id },
                    data: {
                        nombres,
                        apellidos,
                        email,
                        telefono,
                        direccion,
                        updated_at: new Date()
                    },
                    select: {
                        id: true,
                        nombres: true,
                        apellidos: true,
                        email: true,
                        telefono: true,
                        direccion: true,
                        updated_at: true
                    }
                });
                // Actualizar turno del estudiante si se proporciona
                let estudianteActualizado = null;
                if (turno) {
                    estudianteActualizado = await tx.estudiantes.update({
                        where: { id: estudiante.id },
                        data: { turno },
                        select: { turno: true }
                    });
                }
                return {
                    usuario: usuarioActualizado,
                    estudiante: estudianteActualizado
                };
            });
            return c.json({
                success: true,
                data: {
                    ...resultado.usuario,
                    turno: resultado.estudiante?.turno || estudiante.turno
                },
                message: 'Perfil actualizado correctamente'
            });
        }
        catch (error) {
            console.error('Error al actualizar perfil del estudiante:', error);
            return c.json({
                success: false,
                message: 'Error interno del servidor'
            }, 500);
        }
    }
    // Obtener dashboard del estudiante
    static async obtenerDashboard(c) {
        try {
            const user = c.get('user');
            // Verificar que el usuario esté autenticado y sea estudiante
            if (!user || user.rol_id !== 5) {
                return c.json({
                    success: false,
                    message: 'Acceso denegado. Solo estudiantes pueden acceder.'
                }, 403);
            }
            // Obtener datos del estudiante
            const estudiante = await prisma.estudiantes.findFirst({
                where: {
                    usuario_id: user.id,
                    estado: 'Activo'
                },
                include: {
                    usuarios: {
                        select: {
                            nombres: true,
                            apellidos: true
                        }
                    },
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
            if (!estudiante) {
                return c.json({
                    success: false,
                    message: 'Estudiante no encontrado'
                }, 404);
            }
            // Obtener fecha de hoy
            const hoy = new Date();
            const fechaHoy = hoy.toISOString().split('T')[0];
            // Obtener asistencias reales del estudiante para hoy
            const asistenciasHoy = await prisma.asistencia_general.findMany({
                where: {
                    estudiante_id: estudiante.id,
                    fecha: {
                        gte: new Date(fechaHoy + 'T00:00:00.000Z'),
                        lt: new Date(fechaHoy + 'T23:59:59.999Z')
                    }
                }
            });
            // Calcular estadísticas reales
            const totalAsistenciasEstudiante = await prisma.asistencia_general.count({
                where: {
                    estudiante_id: estudiante.id
                }
            });
            const asistenciasPresentes = await prisma.asistencia_general.count({
                where: {
                    estudiante_id: estudiante.id,
                    estado: 'Presente'
                }
            });
            const porcentajeAsistencia = totalAsistenciasEstudiante > 0
                ? (asistenciasPresentes / totalAsistenciasEstudiante) * 100
                : 0;
            const dashboardData = {
                estudiante: {
                    id: estudiante.id,
                    nombres: estudiante.usuarios.nombres,
                    apellidos: estudiante.usuarios.apellidos,
                    grado: estudiante.grados.nombre,
                    seccion: estudiante.secciones.nombre
                },
                asistenciaHoy: {
                    presente: asistenciasHoy.filter(a => a.estado === 'Presente').length,
                    total: asistenciasHoy.length,
                    porcentaje: asistenciasHoy.length > 0 ? (asistenciasHoy.filter(a => a.estado === 'Presente').length / asistenciasHoy.length) * 100 : 0
                },
                asistenciasHoy: asistenciasHoy.map(a => ({
                    fecha: a.fecha,
                    horaEntrada: a.hora_entrada,
                    horaSalida: a.hora_salida,
                    estado: a.estado,
                    observaciones: a.observaciones
                })),
                estadisticas: {
                    porcentajeAsistenciaGeneral: Math.round(porcentajeAsistencia * 10) / 10,
                    diasPresente: asistenciasPresentes,
                    diasTotal: totalAsistenciasEstudiante
                }
            };
            return c.json({
                success: true,
                data: dashboardData,
                message: 'Dashboard obtenido correctamente'
            });
        }
        catch (error) {
            console.error('Error al obtener dashboard del estudiante:', error);
            return c.json({
                success: false,
                message: 'Error interno del servidor'
            }, 500);
        }
    }
    // Obtener historial de asistencias
    static async obtenerHistorialAsistencias(c) {
        try {
            const user = c.get('user');
            // Verificar que el usuario esté autenticado y sea estudiante
            if (!user || user.rol_id !== 5) {
                return c.json({
                    success: false,
                    message: 'Acceso denegado. Solo estudiantes pueden acceder.'
                }, 403);
            }
            const { fecha_inicio, fecha_fin, materia } = c.req.query();
            // Verificar que el estudiante existe
            const estudiante = await prisma.estudiantes.findFirst({
                where: {
                    usuario_id: user.id,
                    estado: 'Activo'
                }
            });
            if (!estudiante) {
                return c.json({
                    success: false,
                    message: 'Estudiante no encontrado'
                }, 404);
            }
            // TODO: Implementar lógica real para obtener historial de asistencias
            // Por ahora usamos datos de ejemplo
            const historial = [
                {
                    fecha: '2024-01-15',
                    materia: 'Matemáticas',
                    presente: true,
                    horaEntrada: '08:15',
                    observaciones: null
                },
                {
                    fecha: '2024-01-15',
                    materia: 'Ciencias',
                    presente: true,
                    horaEntrada: '09:10',
                    observaciones: null
                },
                {
                    fecha: '2024-01-14',
                    materia: 'Historia',
                    presente: false,
                    horaEntrada: null,
                    observaciones: 'Falta justificada'
                }
            ];
            return c.json({
                success: true,
                data: historial,
                message: 'Historial de asistencias obtenido correctamente'
            });
        }
        catch (error) {
            console.error('Error al obtener historial de asistencias:', error);
            return c.json({
                success: false,
                message: 'Error interno del servidor'
            }, 500);
        }
    }
    // Registrar asistencia
    static async registrarAsistencia(c) {
        try {
            const user = c.get('user');
            // Verificar que el usuario esté autenticado y sea estudiante
            if (!user || user.rol_id !== 5) {
                return c.json({
                    success: false,
                    message: 'Acceso denegado. Solo estudiantes pueden acceder.'
                }, 403);
            }
            const { materia, presente, observaciones } = await c.req.json();
            // Validaciones
            if (!materia || presente === undefined) {
                return c.json({
                    success: false,
                    message: 'Los campos materia y presente son obligatorios'
                }, 400);
            }
            // Verificar que el estudiante existe
            const estudiante = await prisma.estudiantes.findFirst({
                where: {
                    usuario_id: user.id,
                    estado: 'Activo'
                }
            });
            if (!estudiante) {
                return c.json({
                    success: false,
                    message: 'Estudiante no encontrado'
                }, 404);
            }
            // TODO: Implementar lógica real para registrar asistencia
            const asistencia = {
                estudianteId: estudiante.id,
                materia,
                presente,
                fecha: new Date().toISOString().split('T')[0],
                horaRegistro: new Date().toLocaleTimeString(),
                observaciones: observaciones || null
            };
            return c.json({
                success: true,
                data: asistencia,
                message: 'Asistencia registrada correctamente'
            }, 201);
        }
        catch (error) {
            console.error('Error al registrar asistencia:', error);
            return c.json({
                success: false,
                message: 'Error interno del servidor'
            }, 500);
        }
    }
    // Obtener horario del estudiante
    static async obtenerHorario(c) {
        try {
            const user = c.get('user');
            // Verificar que el usuario esté autenticado y sea estudiante
            if (!user || user.rol_id !== 5) {
                return c.json({
                    success: false,
                    message: 'Acceso denegado. Solo estudiantes pueden acceder.'
                }, 403);
            }
            // Verificar que el estudiante existe
            const estudiante = await prisma.estudiantes.findFirst({
                where: {
                    usuario_id: user.id,
                    estado: 'Activo'
                }
            });
            if (!estudiante) {
                return c.json({
                    success: false,
                    message: 'Estudiante no encontrado'
                }, 404);
            }
            // TODO: Implementar lógica real para obtener horario del estudiante
            const horario = {
                lunes: [
                    { hora: '08:00-09:00', materia: 'Matemáticas', profesor: 'Prof. García' },
                    { hora: '09:00-10:00', materia: 'Ciencias', profesor: 'Prof. López' },
                    { hora: '10:00-11:00', materia: 'Historia', profesor: 'Prof. Martínez' }
                ],
                martes: [
                    { hora: '08:00-09:00', materia: 'Inglés', profesor: 'Prof. Smith' },
                    { hora: '09:00-10:00', materia: 'Matemáticas', profesor: 'Prof. García' },
                    { hora: '10:00-11:00', materia: 'Arte', profesor: 'Prof. Ruiz' }
                ],
                miercoles: [
                    { hora: '08:00-09:00', materia: 'Ciencias', profesor: 'Prof. López' },
                    { hora: '09:00-10:00', materia: 'Educación Física', profesor: 'Prof. Torres' },
                    { hora: '10:00-11:00', materia: 'Historia', profesor: 'Prof. Martínez' }
                ],
                jueves: [
                    { hora: '08:00-09:00', materia: 'Matemáticas', profesor: 'Prof. García' },
                    { hora: '09:00-10:00', materia: 'Inglés', profesor: 'Prof. Smith' },
                    { hora: '10:00-11:00', materia: 'Ciencias', profesor: 'Prof. López' }
                ],
                viernes: [
                    { hora: '08:00-09:00', materia: 'Arte', profesor: 'Prof. Ruiz' },
                    { hora: '09:00-10:00', materia: 'Historia', profesor: 'Prof. Martínez' },
                    { hora: '10:00-11:00', materia: 'Educación Física', profesor: 'Prof. Torres' }
                ]
            };
            return c.json({
                success: true,
                data: horario,
                message: 'Horario obtenido correctamente'
            });
        }
        catch (error) {
            console.error('Error al obtener horario del estudiante:', error);
            return c.json({
                success: false,
                message: 'Error interno del servidor'
            }, 500);
        }
    }
    // Actualizar turno del estudiante
    static async actualizarTurno(c) {
        try {
            const user = c.get('user');
            // Verificar que el usuario esté autenticado y sea estudiante
            if (!user || user.rol_id !== 5) {
                return c.json({
                    success: false,
                    message: 'Acceso denegado. Solo estudiantes pueden acceder.'
                }, 403);
            }
            const { turno } = await c.req.json();
            // Validar turno
            if (!turno || !['mañana', 'tarde'].includes(turno)) {
                return c.json({
                    success: false,
                    message: 'El turno debe ser "mañana" o "tarde"'
                }, 400);
            }
            // Verificar que el estudiante existe
            const estudiante = await prisma.estudiantes.findFirst({
                where: {
                    usuario_id: user.id,
                    estado: 'Activo'
                }
            });
            if (!estudiante) {
                return c.json({
                    success: false,
                    message: 'Estudiante no encontrado'
                }, 404);
            }
            // Actualizar turno del estudiante
            const estudianteActualizado = await prisma.estudiantes.update({
                where: { id: estudiante.id },
                data: { turno },
                select: {
                    id: true,
                    turno: true,
                    usuarios: {
                        select: {
                            nombres: true,
                            apellidos: true
                        }
                    }
                }
            });
            return c.json({
                success: true,
                data: {
                    id: estudianteActualizado.id,
                    turno: estudianteActualizado.turno,
                    nombres: estudianteActualizado.usuarios.nombres,
                    apellidos: estudianteActualizado.usuarios.apellidos
                },
                message: 'Turno actualizado correctamente'
            });
        }
        catch (error) {
            console.error('Error al actualizar turno del estudiante:', error);
            return c.json({
                success: false,
                message: 'Error interno del servidor'
            }, 500);
        }
    }
}
//# sourceMappingURL=estudianteController01.js.map