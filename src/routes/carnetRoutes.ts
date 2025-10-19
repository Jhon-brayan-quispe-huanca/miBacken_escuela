import { Hono } from 'hono';
import { CarnetController } from '../controllers/apoderadoController.js';
import { authMiddleware } from '../middleware/.js';

const carnetRoutes = new Hono();

// Aplicar middleware de autenticación a todas las rutas
carnetRoutes.use('*', authMiddleware);

// Rutas para generación de carnets
carnetRoutes.get('/estudiante/:estudianteId/generar', CarnetController.generarCarnetEstudiante);
carnetRoutes.get('/estudiante/:estudianteId/datos', CarnetController.obtenerDatosEstudiante);
carnetRoutes.get('/estudiante/:estudianteId/qr', CarnetController.generarQREstudiante);

export default carnetRoutes;
