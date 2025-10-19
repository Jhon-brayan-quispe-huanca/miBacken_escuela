import { PrismaClient } from '../../generated/prisma/index.js';
import { CarnetMasivoService } from '../services/carnetService.js';
const prisma = new PrismaClient();
export class CarnetMasivoController {
    /**
     * Obtiene estudiantes filtrados por grado y sección
     */
    static async obtenerEstudiantesFiltrados(c) {
        try {
            const { gradoId, seccionId } = c.req.query();
            if (!gradoId || !seccionId) {
                return c.json({
                    success: false,
                    message: 'Grado y sección son requeridos'
                }, 400);
            }
            const estudiantes = await prisma.estudiantes.findMany({
                where: {
                    grado_id: parseInt(gradoId),
                    seccion_id: parseInt(seccionId)
                },
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
            return c.json({
                success: true,
                estudiantes: estudiantes.map(est => ({
                    id: est.id,
                    codigo_estudiante: est.codigo_estudiante,
                    nombre: est.nombres,
                    apellido: est.apellidos,
                    grado: est.grados.nombre,
                    seccion: est.secciones.nombre,
                    turno: est.turno
                }))
            });
        }
        catch (error) {
            console.error('Error al obtener estudiantes filtrados:', error);
            return c.json({
                success: false,
                message: 'Error interno del servidor'
            }, 500);
        }
    }
    /**
     * Genera carnets masivamente para impresión (múltiples carnets en una página)
     */
    static async generarCarnetsMasivo(c) {
        try {
            const { estudiantesIds } = await c.req.json();
            if (!estudiantesIds || !Array.isArray(estudiantesIds) || estudiantesIds.length === 0) {
                return c.json({
                    success: false,
                    message: 'Lista de estudiantes es requerida'
                }, 400);
            }
            console.log(`Iniciando generación masiva para impresión: ${estudiantesIds.length} estudiantes`);
            // Obtener datos de todos los estudiantes
            const estudiantes = await prisma.estudiantes.findMany({
                where: {
                    id: { in: estudiantesIds }
                },
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
            // Generar HTML para impresión masiva usando el servicio optimizado
            const carnetMasivoService = new CarnetMasivoService();
            const htmlContent = await carnetMasivoService.generarHTMLCarnetsMasivo(estudiantes);
            // Generar PDF con Puppeteer
            const pdfBuffer = await carnetMasivoService.generarPDFCarnetsMasivo(htmlContent);
            console.log(`Generación masiva completada: ${estudiantes.length} carnets para impresión`);
            return new Response(pdfBuffer, {
                headers: {
                    'Content-Type': 'application/pdf',
                    'Content-Disposition': 'attachment; filename="carnets_impresion_masiva.pdf"',
                    'Content-Length': pdfBuffer.length.toString()
                }
            });
        }
        catch (error) {
            console.error('Error en generación masiva:', error);
            return c.json({
                success: false,
                message: 'Error al generar carnets masivamente'
            }, 500);
        }
    }
    /**
     * Obtiene estadísticas de estudiantes por grado y sección
     */
    static async obtenerEstadisticasFiltro(c) {
        try {
            const { gradoId, seccionId } = c.req.query();
            let whereClause = {};
            if (gradoId && gradoId !== 'null') {
                whereClause.grado_id = parseInt(gradoId);
            }
            if (seccionId && seccionId !== 'null') {
                whereClause.seccion_id = parseInt(seccionId);
            }
            const totalEstudiantes = await prisma.estudiantes.count({
                where: whereClause
            });
            return c.json({
                success: true,
                totalEstudiantes
            });
        }
        catch (error) {
            console.error('Error al obtener estadísticas:', error);
            return c.json({
                success: false,
                message: 'Error al obtener estadísticas'
            }, 500);
        }
    }
}
//# sourceMappingURL=carnetMasivoController.js.map