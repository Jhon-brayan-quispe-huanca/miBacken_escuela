import { Hono } from 'hono';
import { PrismaClient } from '../../generated/prisma/index.js';
import { carnetService } from '../services/carnetService.js';
const prisma = new PrismaClient();
export const directorCarnetController = new Hono();
/**
 * Guardar carnet individual generado por el director
 * POST /api/director/carnets
 */
directorCarnetController.post('/', async (c) => {
    try {
        const body = await c.req.json();
        const { estudiante_id, codigo_qr, foto_url } = body;
        // Validación
        if (!estudiante_id) {
            return c.json({
                success: false,
                message: 'ID de estudiante requerido'
            }, 400);
        }
        // Verificar si el estudiante existe
        const estudiante = await prisma.estudiantes.findUnique({
            where: { id: estudiante_id },
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
        if (!estudiante) {
            return c.json({
                success: false,
                message: 'Estudiante no encontrado'
            }, 404);
        }
        // Verificar si ya existe un carnet para este estudiante
        const carnetExistente = await prisma.carnets.findUnique({
            where: { estudiante_id }
        });
        let carnet;
        if (carnetExistente) {
            // Actualizar carnet existente
            carnet = await prisma.carnets.update({
                where: { estudiante_id },
                data: {
                    codigo_qr: codigo_qr || carnetExistente.codigo_qr,
                    foto_url: foto_url || carnetExistente.foto_url,
                    activo: true,
                    updated_at: new Date()
                }
            });
        }
        else {
            // Crear nuevo carnet
            carnet = await prisma.carnets.create({
                data: {
                    estudiante_id,
                    codigo_qr: codigo_qr || null,
                    foto_url: foto_url || null,
                    activo: true
                }
            });
        }
        return c.json({
            success: true,
            message: `Carnet de ${estudiante.nombres} ${estudiante.apellidos} guardado exitosamente`,
            data: {
                id: carnet.id,
                estudiante_id: carnet.estudiante_id,
                estudiante_nombre: `${estudiante.nombres} ${estudiante.apellidos}`,
                codigo_qr: carnet.codigo_qr,
                foto_url: carnet.foto_url,
                activo: carnet.activo
            }
        });
    }
    catch (error) {
        console.error('Error al guardar carnet:', error);
        return c.json({
            success: false,
            message: 'Error interno del servidor'
        }, 500);
    }
});
/**
 * Guardar carnets masivos generados por el director
 * POST /api/director/carnets/masivo
 */
directorCarnetController.post('/masivo', async (c) => {
    try {
        const body = await c.req.json();
        const { carnets } = body;
        // Validación
        if (!carnets || !Array.isArray(carnets)) {
            return c.json({
                success: false,
                message: 'Lista de carnets requerida'
            }, 400);
        }
        const resultados = [];
        const errores = [];
        for (const carnetData of carnets) {
            try {
                const { estudiante_id, codigo_qr, foto_url } = carnetData;
                if (!estudiante_id) {
                    errores.push(`ID de estudiante requerido para carnet`);
                    continue;
                }
                // Verificar si el estudiante existe
                const estudiante = await prisma.estudiantes.findUnique({
                    where: { id: estudiante_id },
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
                if (!estudiante) {
                    errores.push(`Estudiante con ID ${estudiante_id} no encontrado`);
                    continue;
                }
                // Verificar si ya existe un carnet para este estudiante
                const carnetExistente = await prisma.carnets.findUnique({
                    where: { estudiante_id }
                });
                let carnet;
                if (carnetExistente) {
                    // Actualizar carnet existente
                    carnet = await prisma.carnets.update({
                        where: { estudiante_id },
                        data: {
                            codigo_qr: codigo_qr || carnetExistente.codigo_qr,
                            foto_url: foto_url || carnetExistente.foto_url,
                            activo: true,
                            updated_at: new Date()
                        }
                    });
                }
                else {
                    // Crear nuevo carnet
                    carnet = await prisma.carnets.create({
                        data: {
                            estudiante_id,
                            codigo_qr: codigo_qr || null,
                            foto_url: foto_url || null,
                            activo: true
                        }
                    });
                }
                resultados.push({
                    id: carnet.id,
                    estudiante_id: carnet.estudiante_id,
                    estudiante_nombre: `${estudiante.nombres} ${estudiante.apellidos}`,
                    codigo_qr: carnet.codigo_qr,
                    foto_url: carnet.foto_url,
                    activo: carnet.activo
                });
            }
            catch (error) {
                console.error(`Error al procesar carnet para estudiante ${carnetData.estudiante_id}:`, error);
                errores.push(`Error al procesar carnet para estudiante ${carnetData.estudiante_id}`);
            }
        }
        return c.json({
            success: true,
            message: `Carnets procesados: ${resultados.length} exitosos, ${errores.length} errores`,
            data: {
                exitosos: resultados,
                errores: errores,
                total_procesados: carnets.length,
                total_exitosos: resultados.length,
                total_errores: errores.length
            }
        });
    }
    catch (error) {
        console.error('Error al procesar carnets masivos:', error);
        return c.json({
            success: false,
            message: 'Error interno del servidor'
        }, 500);
    }
});
/**
 * Obtener carnets de un estudiante específico
 * GET /api/director/carnets/:estudiante_id
 */
directorCarnetController.get('/:estudiante_id', async (c) => {
    try {
        const estudianteId = parseInt(c.req.param('estudiante_id'));
        if (isNaN(estudianteId) || estudianteId <= 0) {
            return c.json({
                success: false,
                message: 'ID de estudiante inválido'
            }, 400);
        }
        const carnet = await prisma.carnets.findUnique({
            where: { estudiante_id: estudianteId },
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
            }
        });
        if (!carnet) {
            return c.json({
                success: false,
                message: 'Carnet no encontrado'
            }, 404);
        }
        return c.json({
            success: true,
            data: {
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
            }
        });
    }
    catch (error) {
        console.error('Error al obtener carnet:', error);
        return c.json({
            success: false,
            message: 'Error interno del servidor'
        }, 500);
    }
});
/**
 * Generar PDF del carnet (SIN AUTENTICACIÓN)
 * GET /api/director/carnets/:estudiante_id/pdf
 */
directorCarnetController.get('/:estudiante_id/pdf', async (c) => {
    try {
        const estudianteId = parseInt(c.req.param('estudiante_id'));
        if (isNaN(estudianteId) || estudianteId <= 0) {
            return c.json({ success: false, message: 'ID de estudiante inválido' }, 400);
        }
        // Obtener datos del estudiante
        const estudiante = await prisma.estudiantes.findUnique({
            where: { id: estudianteId },
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
                carnets: {
                    select: {
                        codigo_qr: true,
                        foto_url: true,
                    },
                },
            },
        });
        if (!estudiante) {
            return c.json({ success: false, message: 'Estudiante no encontrado' }, 404);
        }
        // Generar PDF del carnet
        const pdfBuffer = await carnetService.generarPDFCarnet(estudiante.id);
        // Devolver PDF
        return new Response(pdfBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `inline; filename="carnet_${estudianteId}.pdf"`,
            },
        });
    }
    catch (error) {
        console.error('Error al generar PDF del carnet:', error);
        return c.json({ success: false, message: 'Error interno del servidor' }, 500);
    }
});
/**
 * Generar PDF del carnet (SIN AUTENTICACIÓN) - ENDPOINT PÚBLICO
 * GET /api/director/carnets/:estudiante_id/pdf-publico
 */
directorCarnetController.get('/:estudiante_id/pdf-publico', async (c) => {
    try {
        const estudianteId = parseInt(c.req.param('estudiante_id'));
        if (isNaN(estudianteId) || estudianteId <= 0) {
            return c.json({ success: false, message: 'ID de estudiante inválido' }, 400);
        }
        // Obtener datos del estudiante
        const estudiante = await prisma.estudiantes.findUnique({
            where: { id: estudianteId },
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
                carnets: {
                    select: {
                        codigo_qr: true,
                        foto_url: true,
                    },
                },
            },
        });
        if (!estudiante) {
            return c.json({ success: false, message: 'Estudiante no encontrado' }, 404);
        }
        // Generar PDF del carnet
        const pdfBuffer = await carnetService.generarPDFCarnet(estudiante.id);
        // Devolver PDF
        return new Response(pdfBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `inline; filename="carnet_${estudianteId}.pdf"`,
            },
        });
    }
    catch (error) {
        console.error('Error al generar PDF del carnet:', error);
        return c.json({ success: false, message: 'Error interno del servidor' }, 500);
    }
});
/**
 * Generar imagen PNG del carnet para apoderado (SIN AUTENTICACIÓN)
 * GET /api/director/carnets/:estudiante_id/imagen
 */
directorCarnetController.get('/:estudiante_id/imagen', async (c) => {
    try {
        const estudianteId = parseInt(c.req.param('estudiante_id'));
        if (isNaN(estudianteId) || estudianteId <= 0) {
            return c.json({ success: false, message: 'ID de estudiante inválido' }, 400);
        }
        // Obtener datos del estudiante
        const estudiante = await prisma.estudiantes.findUnique({
            where: { id: estudianteId },
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
                carnets: {
                    select: {
                        codigo_qr: true,
                        foto_url: true,
                    },
                },
            },
        });
        if (!estudiante) {
            return c.json({ success: false, message: 'Estudiante no encontrado' }, 404);
        }
        // Generar imagen PNG del carnet
        const imagenBuffer = await carnetService.generarImagenCarnet({
            id: estudiante.id,
            nombres: estudiante.nombres,
            apellidos: estudiante.apellidos,
            dni: estudiante.dni,
            grado: estudiante.grados.nombre,
            seccion: estudiante.secciones.nombre,
            turno: 'MAÑANA', // Por defecto, se puede ajustar
            codigo_qr: estudiante.carnets?.codigo_qr || `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=EST${estudiante.id.toString().padStart(4, '0')}`,
            foto_url: estudiante.carnets?.foto_url || null,
        });
        // Devolver imagen PNG
        return new Response(imagenBuffer, {
            headers: {
                'Content-Type': 'image/png',
                'Content-Disposition': `inline; filename="carnet_${estudianteId}.png"`,
            },
        });
    }
    catch (error) {
        console.error('Error al generar imagen del carnet:', error);
        return c.json({ success: false, message: 'Error interno del servidor' }, 500);
    }
});
/**
 * Endpoint público para obtener imagen del carnet (SIN AUTENTICACIÓN)
 * GET /api/director/carnets/:estudiante_id/imagen-publica
 */
directorCarnetController.get('/:estudiante_id/imagen-publica', async (c) => {
    try {
        const estudianteId = parseInt(c.req.param('estudiante_id'));
        if (isNaN(estudianteId) || estudianteId <= 0) {
            return c.json({ success: false, message: 'ID de estudiante inválido' }, 400);
        }
        // Obtener datos del estudiante
        const estudiante = await prisma.estudiantes.findUnique({
            where: { id: estudianteId },
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
                carnets: {
                    select: {
                        codigo_qr: true,
                        foto_url: true,
                    },
                },
            },
        });
        if (!estudiante) {
            return c.json({ success: false, message: 'Estudiante no encontrado' }, 404);
        }
        // Generar imagen PNG del carnet
        const imagenBuffer = await carnetService.generarImagenCarnet({
            id: estudiante.id,
            nombres: estudiante.nombres,
            apellidos: estudiante.apellidos,
            dni: estudiante.dni,
            grado: estudiante.grados.nombre,
            seccion: estudiante.secciones.nombre,
            turno: 'MAÑANA', // Por defecto, se puede ajustar
            codigo_qr: estudiante.carnets?.codigo_qr || `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=EST${estudiante.id.toString().padStart(4, '0')}`,
            foto_url: estudiante.carnets?.foto_url || null,
        });
        // Devolver imagen PNG
        return new Response(imagenBuffer, {
            headers: {
                'Content-Type': 'image/png',
                'Content-Disposition': `inline; filename="carnet_${estudianteId}.png"`,
            },
        });
    }
    catch (error) {
        console.error('Error al generar imagen del carnet:', error);
        return c.json({ success: false, message: 'Error interno del servidor' }, 500);
    }
});
//# sourceMappingURL=directorCarnetController.js.map