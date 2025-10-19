import { carnetService } from '../services/carnetService';
export class CarnetController {
    /**
     * Generar carnet de estudiante en PDF
     */
    static async generarCarnetEstudiante(c) {
        try {
            const estudianteId = c.req.param('estudianteId');
            if (!estudianteId) {
                return c.json({
                    success: false,
                    message: 'ID del estudiante es requerido'
                }, 400);
            }
            const estudianteIdNum = parseInt(estudianteId);
            if (isNaN(estudianteIdNum)) {
                return c.json({
                    success: false,
                    message: 'ID del estudiante debe ser un número válido'
                }, 400);
            }
            // Validar que el estudiante existe
            const estudianteExiste = await carnetService.validarEstudiante(estudianteIdNum);
            if (!estudianteExiste) {
                return c.json({
                    success: false,
                    message: 'Estudiante no encontrado'
                }, 404);
            }
            // Generar el PDF del carnet
            const pdfBuffer = await carnetService.generarPDFCarnet(estudianteIdNum);
            // Obtener datos del estudiante para el nombre del archivo
            const datosEstudiante = await carnetService.obtenerDatosEstudiante(estudianteIdNum);
            const nombreArchivo = `carnet_${datosEstudiante?.codigo_estudiante || estudianteId}.pdf`;
            // Configurar headers para la descarga del PDF
            return new Response(new Uint8Array(pdfBuffer), {
                headers: {
                    'Content-Type': 'application/pdf',
                    'Content-Disposition': `attachment; filename="${nombreArchivo}"`,
                    'Content-Length': pdfBuffer.length.toString()
                }
            });
        }
        catch (error) {
            console.error('Error al generar carnet:', error);
            return c.json({
                success: false,
                message: 'Error interno del servidor al generar el carnet'
            }, 500);
        }
    }
    /**
     * Obtener datos del estudiante para vista previa
     */
    static async obtenerDatosEstudiante(c) {
        try {
            const estudianteId = c.req.param('estudianteId');
            if (!estudianteId) {
                return c.json({
                    success: false,
                    message: 'ID del estudiante es requerido'
                }, 400);
            }
            const estudianteIdNum = parseInt(estudianteId);
            if (isNaN(estudianteIdNum)) {
                return c.json({
                    success: false,
                    message: 'ID del estudiante debe ser un número válido'
                }, 400);
            }
            // Obtener datos del estudiante
            const datosEstudiante = await carnetService.obtenerDatosEstudiante(estudianteIdNum);
            if (!datosEstudiante) {
                return c.json({
                    success: false,
                    message: 'Estudiante no encontrado'
                }, 404);
            }
            return c.json({
                success: true,
                data: datosEstudiante
            });
        }
        catch (error) {
            console.error('Error al obtener datos del estudiante:', error);
            return c.json({
                success: false,
                message: 'Error interno del servidor'
            }, 500);
        }
    }
    /**
     * Generar solo el código QR del estudiante
     */
    static async generarQREstudiante(c) {
        try {
            const estudianteId = c.req.param('estudianteId');
            if (!estudianteId) {
                return c.json({
                    success: false,
                    message: 'ID del estudiante es requerido'
                }, 400);
            }
            const estudianteIdNum = parseInt(estudianteId);
            if (isNaN(estudianteIdNum)) {
                return c.json({
                    success: false,
                    message: 'ID del estudiante debe ser un número válido'
                }, 400);
            }
            // Obtener datos del estudiante
            const datosEstudiante = await carnetService.obtenerDatosEstudiante(estudianteIdNum);
            if (!datosEstudiante) {
                return c.json({
                    success: false,
                    message: 'Estudiante no encontrado'
                }, 404);
            }
            // Generar QR
            const qrCodeDataURL = await carnetService.generarQR(datosEstudiante);
            return c.json({
                success: true,
                data: {
                    estudiante: datosEstudiante,
                    qrCode: qrCodeDataURL
                }
            });
        }
        catch (error) {
            console.error('Error al generar QR:', error);
            return c.json({
                success: false,
                message: 'Error interno del servidor al generar QR'
            }, 500);
        }
    }
}
//# sourceMappingURL=carnetController.js.map