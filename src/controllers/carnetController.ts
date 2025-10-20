import { Context } from 'hono';
import { carnetService } from '../services/carnetService.js';

export class CarnetController {
  /**
   * Generar carnet de estudiante en PDF
   */
  static async generarCarnetEstudiante(c: Context) {
    const startTime = Date.now();
    console.log('🎫 [CARNET] Iniciando generación de carnet...');
    
    try {
      const estudianteId = c.req.param('estudianteId');
      
      if (!estudianteId) {
        console.log('❌ [CARNET] ID del estudiante no proporcionado');
        return c.json({ 
          success: false,
          message: 'ID del estudiante es requerido' 
        }, 400);
      }

      const estudianteIdNum = parseInt(estudianteId);
      if (isNaN(estudianteIdNum)) {
        console.log('❌ [CARNET] ID del estudiante inválido:', estudianteId);
        return c.json({ 
          success: false,
          message: 'ID del estudiante debe ser un número válido' 
        }, 400);
      }

      console.log('🔍 [CARNET] Validando estudiante ID:', estudianteIdNum);

      // Validar que el estudiante existe con timeout
      const estudianteExiste = await Promise.race([
        carnetService.validarEstudiante(estudianteIdNum),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Timeout: Validación tardó demasiado')), 5000)
        )
      ]);

      if (!estudianteExiste) {
        console.log('❌ [CARNET] Estudiante no encontrado:', estudianteIdNum);
        return c.json({ 
          success: false,
          message: 'Estudiante no encontrado' 
        }, 404);
      }

      console.log('✅ [CARNET] Estudiante validado, generando PDF...');

      // Generar el PDF del carnet con timeout
      const pdfBuffer = await Promise.race([
        carnetService.generarPDFCarnet(estudianteIdNum),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Timeout: Generación de PDF tardó demasiado')), 30000)
        )
      ]);

      console.log('✅ [CARNET] PDF generado, obteniendo datos del estudiante...');

      // Obtener datos del estudiante para el nombre del archivo
      const datosEstudiante = await carnetService.obtenerDatosEstudiante(estudianteIdNum);
      const nombreArchivo = `carnet_${datosEstudiante?.codigo_estudiante || estudianteId}.pdf`;

      const generationTime = Date.now() - startTime;
      console.log(`🎉 [CARNET] Carnet generado exitosamente en ${generationTime}ms`);

      // Configurar headers para la descarga del PDF
      return new Response(new Uint8Array(pdfBuffer), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${nombreArchivo}"`,
          'Content-Length': pdfBuffer.length.toString()
        }
      });
    } catch (error) {
      const errorTime = Date.now() - startTime;
      console.error(`❌ [CARNET] Error después de ${errorTime}ms:`, error);
      
      if (error instanceof Error) {
        if (error.message.includes('Timeout')) {
          return c.json({ 
            success: false,
            message: 'La generación del carnet tardó demasiado. Intente nuevamente.' 
          }, 408);
        }
        if (error.message.includes('Estudiante no encontrado')) {
          return c.json({ 
            success: false,
            message: 'Estudiante no encontrado' 
          }, 404);
        }
      }
      
      return c.json({ 
        success: false,
        message: 'Error interno del servidor al generar el carnet' 
      }, 500);
    }
  }

  /**
   * Obtener datos del estudiante para vista previa
   */
  static async obtenerDatosEstudiante(c: Context) {
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
    } catch (error) {
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
  static async generarQREstudiante(c: Context) {
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
    } catch (error) {
      console.error('Error al generar QR:', error);
      return c.json({ 
        success: false,
        message: 'Error interno del servidor al generar QR' 
      }, 500);
    }
  }
}
