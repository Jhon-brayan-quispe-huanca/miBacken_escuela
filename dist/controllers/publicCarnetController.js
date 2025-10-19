import { Hono } from 'hono';
import { PrismaClient } from '../../generated/prisma/index.js';
import { carnetService } from '../services/carnetService.js';
const prisma = new PrismaClient();
export const publicCarnetController = new Hono();
/**
 * Endpoint público para obtener PDF del carnet (SIN AUTENTICACIÓN)
 * GET /api/public/carnets/:estudiante_id/pdf
 */
publicCarnetController.get('/:estudiante_id/pdf', async (c) => {
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
 * Endpoint público para obtener imagen del carnet (SIN AUTENTICACIÓN)
 * GET /api/public/carnets/:estudiante_id/imagen
 */
publicCarnetController.get('/:estudiante_id/imagen', async (c) => {
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
        // Generar imagen PNG del carnet usando el mismo servicio del director
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
//# sourceMappingURL=publicCarnetController.js.map