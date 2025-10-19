import { Hono } from 'hono';
import { PrismaClient } from '../../generated/prisma/index.js';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();
const uploadController = new Hono();

/**
 * Subir documento de justificación
 * POST /api/upload/justificacion
 */
uploadController.post('/justificacion', async (c) => {
  try {
    // Obtener el archivo del FormData
    const formData = await c.req.formData();
    const file = formData.get('documento') as File;
    
    if (!file) {
      return c.json({
        success: false,
        message: 'No se ha subido ningún archivo'
      }, 400);
    }

    // Validar tipo de archivo
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      return c.json({
        success: false,
        message: 'Solo se permiten archivos PDF, JPG y PNG'
      }, 400);
    }

    // Validar tamaño (5MB máximo)
    if (file.size > 5 * 1024 * 1024) {
      return c.json({
        success: false,
        message: 'El archivo no puede ser mayor a 5MB'
      }, 400);
    }

    // Crear directorio si no existe
    const uploadPath = path.join(process.cwd(), 'uploads', 'justificaciones');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    // Generar nombre único
    const timestamp = Date.now();
    const ext = path.extname(file.name);
    const nameWithoutExt = path.basename(file.name, ext);
    const uniqueName = `${timestamp}_${nameWithoutExt}${ext}`;
    const filePath = path.join(uploadPath, uniqueName);

    // Convertir File a Buffer y guardar
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(filePath, buffer);

    // Determinar tipo de documento
    let tipoDocumento = '';
    if (file.type === 'application/pdf') {
      tipoDocumento = 'PDF';
    } else if (file.type.startsWith('image/')) {
      tipoDocumento = 'FOTO';
    }

    return c.json({
      success: true,
      message: 'Archivo subido exitosamente',
      data: {
        documento_path: filePath,
        documento_nombre: file.name,
        documento_tipo: tipoDocumento,
        documento_size: file.size,
        documento_mimetype: file.type
      }
    });

  } catch (error) {
    console.error('Error al subir archivo:', error);
    return c.json({
      success: false,
      message: 'Error interno del servidor'
    }, 500);
  }
});

/**
 * Obtener documento de justificación
 * GET /api/upload/justificacion/:filename
 */
uploadController.get('/justificacion/:filename', async (c) => {
  try {
    const filename = c.req.param('filename');
    const filePath = path.join(process.cwd(), 'uploads', 'justificaciones', filename);
    
    // Verificar que el archivo existe
    if (!fs.existsSync(filePath)) {
      return c.json({
        success: false,
        message: 'Archivo no encontrado'
      }, 404);
    }

    // Leer y enviar el archivo
    const fileBuffer = fs.readFileSync(filePath);
    const ext = path.extname(filename).toLowerCase();
    
    let contentType = 'application/octet-stream';
    if (ext === '.pdf') {
      contentType = 'application/pdf';
    } else if (ext === '.jpg' || ext === '.jpeg') {
      contentType = 'image/jpeg';
    } else if (ext === '.png') {
      contentType = 'image/png';
    }

    return new Response(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${filename}"`
      }
    });

  } catch (error) {
    console.error('Error al obtener archivo:', error);
    return c.json({
      success: false,
      message: 'Error interno del servidor'
    }, 500);
  }
});

export default uploadController;
