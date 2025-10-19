import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export class EstudiantesController {
    // Obtener todos los estudiantes con paginación
    static async obtenerEstudiantes(c) {
        try {
            const user = c.get('user');
            if (!user || user.rol_id !== 1) {
                return c.json({
                    success: false,
                    message: 'Acceso denegado. Solo directores pueden acceder.'
                }, 403);
            }
            const page = parseInt(c.req.query('page') || '1');
            const limit = parseInt(c.req.query('limit') || '10');
            const search = c.req.query('search') || '';
            const estado = c.req.query('estado') || '';
            const gradoId = c.req.query('grado_id');
            const seccionId = c.req.query('seccion_id');
            const skip = (page - 1) * limit;
            // Construir filtros
            const where = {};
            if (search) {
                where.OR = [
                    { nombres: { contains: search, mode: 'insensitive' } },
                    { apellidos: { contains: search, mode: 'insensitive' } },
                    { dni: { contains: search, mode: 'insensitive' } },
                    { codigo_estudiante: { contains: search, mode: 'insensitive' } }
                ];
            }
            if (estado) {
                where.estado = estado;
            }
            if (gradoId) {
                where.grado_id = parseInt(gradoId);
            }
            if (seccionId) {
                where.seccion_id = parseInt(seccionId);
            }
            const [estudiantes, total] = await Promise.all([
                prisma.estudiantes.findMany({
                    where,
                    skip,
                    take: limit,
                    include: {
                        apoderados: {
                            include: {
                                usuarios: {
                                    select: {
                                        nombres: true,
                                        apellidos: true,
                                        dni: true,
                                        telefono: true,
                                        email: true
                                    }
                                }
                            }
                        },
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
                        { apellidos: 'asc' },
                        { nombres: 'asc' }
                    ]
                }),
                prisma.estudiantes.count({ where })
            ]);
            return c.json({
                success: true,
                data: {
                    estudiantes,
                    pagination: {
                        page,
                        limit,
                        total,
                        pages: Math.ceil(total / limit)
                    }
                }
            });
        }
        catch (error) {
            console.error('Error al obtener estudiantes:', error);
            return c.json({
                success: false,
                message: 'Error interno del servidor'
            }, 500);
        }
    }
    // Obtener estudiante por ID
    static async obtenerEstudiantePorId(c) {
        try {
            const user = c.get('user');
            if (!user || user.rol_id !== 1) {
                return c.json({
                    success: false,
                    message: 'Acceso denegado. Solo directores pueden acceder.'
                }, 403);
            }
            const id = parseInt(c.req.param('id'));
            if (isNaN(id)) {
                return c.json({
                    success: false,
                    message: 'ID de estudiante inválido'
                }, 400);
            }
            const estudiante = await prisma.estudiantes.findUnique({
                where: { id },
                include: {
                    apoderados: {
                        include: {
                            usuarios: {
                                select: {
                                    nombres: true,
                                    apellidos: true,
                                    dni: true,
                                    telefono: true,
                                    email: true
                                }
                            }
                        }
                    },
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
                }
            });
            if (!estudiante) {
                return c.json({
                    success: false,
                    message: 'Estudiante no encontrado'
                }, 404);
            }
            return c.json({
                success: true,
                data: estudiante
            });
        }
        catch (error) {
            console.error('Error al obtener estudiante:', error);
            return c.json({
                success: false,
                message: 'Error interno del servidor'
            }, 500);
        }
    }
    // Crear nuevo estudiante
    static async crearEstudiante(c) {
        try {
            const user = c.get('user');
            if (!user || user.rol_id !== 1) {
                return c.json({
                    success: false,
                    message: 'Acceso denegado. Solo directores pueden acceder.'
                }, 403);
            }
            const { nombres, apellidos, dni, genero, apoderado_id, grado_id, seccion_id, codigo_estudiante, estado = 'Activo', turno = 'mañana' } = await c.req.json();
            // Validaciones
            if (!nombres || !apellidos || !apoderado_id || !grado_id || !seccion_id) {
                return c.json({
                    success: false,
                    message: 'Faltan campos obligatorios: nombres, apellidos, apoderado_id, grado_id, seccion_id'
                }, 400);
            }
            // Verificar que el apoderado existe
            const apoderado = await prisma.apoderados.findUnique({
                where: { id: apoderado_id }
            });
            if (!apoderado) {
                return c.json({
                    success: false,
                    message: 'El apoderado especificado no existe'
                }, 400);
            }
            // Verificar que el grado existe
            const grado = await prisma.grados.findUnique({
                where: { id: grado_id }
            });
            if (!grado) {
                return c.json({
                    success: false,
                    message: 'El grado especificado no existe'
                }, 400);
            }
            // Verificar que la sección existe
            const seccion = await prisma.secciones.findUnique({
                where: { id: seccion_id }
            });
            if (!seccion) {
                return c.json({
                    success: false,
                    message: 'La sección especificada no existe'
                }, 400);
            }
            // Verificar DNI único (si se proporciona)
            if (dni) {
                const estudianteConDni = await prisma.estudiantes.findUnique({
                    where: { dni }
                });
                if (estudianteConDni) {
                    return c.json({
                        success: false,
                        message: 'Ya existe un estudiante con este DNI'
                    }, 400);
                }
            }
            // Generar código de estudiante si no se proporciona
            let codigoFinal = codigo_estudiante;
            if (!codigoFinal) {
                const ultimoEstudiante = await prisma.estudiantes.findFirst({
                    orderBy: { id: 'desc' }
                });
                const siguienteId = (ultimoEstudiante?.id || 0) + 1;
                codigoFinal = `EST${siguienteId.toString().padStart(4, '0')}`;
            }
            // Crear estudiante
            const nuevoEstudiante = await prisma.estudiantes.create({
                data: {
                    nombres,
                    apellidos,
                    dni: dni || null,
                    genero: genero || null,
                    apoderado_id,
                    grado_id,
                    seccion_id,
                    codigo_estudiante: codigoFinal,
                    estado,
                    turno
                },
                include: {
                    apoderados: {
                        include: {
                            usuarios: {
                                select: {
                                    nombres: true,
                                    apellidos: true,
                                    dni: true,
                                    telefono: true,
                                    email: true
                                }
                            }
                        }
                    },
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
                }
            });
            return c.json({
                success: true,
                message: 'Estudiante creado exitosamente',
                data: nuevoEstudiante
            });
        }
        catch (error) {
            console.error('Error al crear estudiante:', error);
            return c.json({
                success: false,
                message: 'Error interno del servidor'
            }, 500);
        }
    }
    // Actualizar estudiante
    static async actualizarEstudiante(c) {
        try {
            const user = c.get('user');
            if (!user || user.rol_id !== 1) {
                return c.json({
                    success: false,
                    message: 'Acceso denegado. Solo directores pueden acceder.'
                }, 403);
            }
            const id = parseInt(c.req.param('id'));
            if (isNaN(id)) {
                return c.json({
                    success: false,
                    message: 'ID de estudiante inválido'
                }, 400);
            }
            const { nombres, apellidos, dni, genero, apoderado_id, grado_id, seccion_id, codigo_estudiante, estado, turno } = await c.req.json();
            // Verificar que el estudiante existe
            const estudianteExistente = await prisma.estudiantes.findUnique({
                where: { id }
            });
            if (!estudianteExistente) {
                return c.json({
                    success: false,
                    message: 'Estudiante no encontrado'
                }, 404);
            }
            // Verificar DNI único (si se está cambiando)
            if (dni && dni !== estudianteExistente.dni) {
                const estudianteConDni = await prisma.estudiantes.findUnique({
                    where: { dni }
                });
                if (estudianteConDni) {
                    return c.json({
                        success: false,
                        message: 'Ya existe un estudiante con este DNI'
                    }, 400);
                }
            }
            // Verificar apoderado (si se está cambiando)
            if (apoderado_id && apoderado_id !== estudianteExistente.apoderado_id) {
                const apoderado = await prisma.apoderados.findUnique({
                    where: { id: apoderado_id }
                });
                if (!apoderado) {
                    return c.json({
                        success: false,
                        message: 'El apoderado especificado no existe'
                    }, 400);
                }
            }
            // Verificar grado (si se está cambiando)
            if (grado_id && grado_id !== estudianteExistente.grado_id) {
                const grado = await prisma.grados.findUnique({
                    where: { id: grado_id }
                });
                if (!grado) {
                    return c.json({
                        success: false,
                        message: 'El grado especificado no existe'
                    }, 400);
                }
            }
            // Verificar sección (si se está cambiando)
            if (seccion_id && seccion_id !== estudianteExistente.seccion_id) {
                const seccion = await prisma.secciones.findUnique({
                    where: { id: seccion_id }
                });
                if (!seccion) {
                    return c.json({
                        success: false,
                        message: 'La sección especificada no existe'
                    }, 400);
                }
            }
            // Actualizar estudiante
            const estudianteActualizado = await prisma.estudiantes.update({
                where: { id },
                data: {
                    ...(nombres && { nombres }),
                    ...(apellidos && { apellidos }),
                    ...(dni !== undefined && { dni }),
                    ...(genero !== undefined && { genero }),
                    ...(apoderado_id && { apoderado_id }),
                    ...(grado_id && { grado_id }),
                    ...(seccion_id && { seccion_id }),
                    ...(codigo_estudiante && { codigo_estudiante }),
                    ...(estado && { estado }),
                    ...(turno && { turno }),
                    updated_at: new Date()
                },
                include: {
                    apoderados: {
                        include: {
                            usuarios: {
                                select: {
                                    nombres: true,
                                    apellidos: true,
                                    dni: true,
                                    telefono: true,
                                    email: true
                                }
                            }
                        }
                    },
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
                }
            });
            return c.json({
                success: true,
                message: 'Estudiante actualizado exitosamente',
                data: estudianteActualizado
            });
        }
        catch (error) {
            console.error('Error al actualizar estudiante:', error);
            return c.json({
                success: false,
                message: 'Error interno del servidor'
            }, 500);
        }
    }
    // Cambiar estado del estudiante
    static async cambiarEstadoEstudiante(c) {
        try {
            const user = c.get('user');
            if (!user || user.rol_id !== 1) {
                return c.json({
                    success: false,
                    message: 'Acceso denegado. Solo directores pueden acceder.'
                }, 403);
            }
            const id = parseInt(c.req.param('id'));
            const { estado } = await c.req.json();
            if (isNaN(id)) {
                return c.json({
                    success: false,
                    message: 'ID de estudiante inválido'
                }, 400);
            }
            if (!estado) {
                return c.json({
                    success: false,
                    message: 'El estado es requerido'
                }, 400);
            }
            const estudianteActualizado = await prisma.estudiantes.update({
                where: { id },
                data: {
                    estado,
                    updated_at: new Date()
                }
            });
            return c.json({
                success: true,
                message: `Estudiante ${estado.toLowerCase()} exitosamente`,
                data: estudianteActualizado
            });
        }
        catch (error) {
            console.error('Error al cambiar estado del estudiante:', error);
            return c.json({
                success: false,
                message: 'Error interno del servidor'
            }, 500);
        }
    }
    // Eliminar estudiante
    static async eliminarEstudiante(c) {
        try {
            const user = c.get('user');
            if (!user || user.rol_id !== 1) {
                return c.json({
                    success: false,
                    message: 'Acceso denegado. Solo directores pueden acceder.'
                }, 403);
            }
            const id = parseInt(c.req.param('id'));
            if (isNaN(id)) {
                return c.json({
                    success: false,
                    message: 'ID de estudiante inválido'
                }, 400);
            }
            // Verificar que el estudiante existe
            const estudiante = await prisma.estudiantes.findUnique({
                where: { id }
            });
            if (!estudiante) {
                return c.json({
                    success: false,
                    message: 'Estudiante no encontrado'
                }, 404);
            }
            // Verificar si tiene asistencias registradas
            const tieneAsistencias = await prisma.asistencia_salon.count({
                where: { estudiante_id: id }
            });
            if (tieneAsistencias > 0) {
                return c.json({
                    success: false,
                    message: 'No se puede eliminar el estudiante porque tiene asistencias registradas. Considere cambiar su estado a "Inactivo" en su lugar.'
                }, 400);
            }
            // Eliminar estudiante
            await prisma.estudiantes.delete({
                where: { id }
            });
            return c.json({
                success: true,
                message: 'Estudiante eliminado exitosamente'
            });
        }
        catch (error) {
            console.error('Error al eliminar estudiante:', error);
            return c.json({
                success: false,
                message: 'Error interno del servidor'
            }, 500);
        }
    }
    // Obtener grados y secciones para formularios
    static async obtenerGradosYSecciones(c) {
        try {
            const user = c.get('user');
            if (!user || user.rol_id !== 1) {
                return c.json({
                    success: false,
                    message: 'Acceso denegado. Solo directores pueden acceder.'
                }, 403);
            }
            const [grados, secciones] = await Promise.all([
                prisma.grados.findMany({
                    orderBy: { nombre: 'asc' }
                }),
                prisma.secciones.findMany({
                    orderBy: { nombre: 'asc' }
                })
            ]);
            return c.json({
                success: true,
                data: {
                    grados,
                    secciones
                }
            });
        }
        catch (error) {
            console.error('Error al obtener grados y secciones:', error);
            return c.json({
                success: false,
                message: 'Error interno del servidor'
            }, 500);
        }
    }
    // Obtener apoderados para formularios
    static async obtenerApoderados(c) {
        try {
            const user = c.get('user');
            if (!user || user.rol_id !== 1) {
                return c.json({
                    success: false,
                    message: 'Acceso denegado. Solo directores pueden acceder.'
                }, 403);
            }
            const apoderados = await prisma.apoderados.findMany({
                include: {
                    usuarios: {
                        select: {
                            nombres: true,
                            apellidos: true,
                            email: true,
                            telefono: true
                        }
                    }
                },
                orderBy: {
                    usuarios: {
                        apellidos: 'asc'
                    }
                }
            });
            return c.json({
                success: true,
                data: apoderados
            });
        }
        catch (error) {
            console.error('Error al obtener apoderados:', error);
            return c.json({
                success: false,
                message: 'Error interno del servidor'
            }, 500);
        }
    }
}
//# sourceMappingURL=estudiantesController.js.map