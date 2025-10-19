import { Hono } from 'hono';
import { EstudiantesController } from '../controllers/apoderadoController.js';
import { authMiddleware } from '../middleware/.js';

const estudiantesRoutes = new Hono();

// Middleware de autenticación para todas las rutas
estudiantesRoutes.use('*', authMiddleware);

// Rutas auxiliares para formularios (deben ir ANTES que las rutas con parámetros)
estudiantesRoutes.get('/datos/grados-secciones', EstudiantesController.obtenerGradosYSecciones);
estudiantesRoutes.get('/datos/apoderados', EstudiantesController.obtenerApoderados);

// Rutas principales de estudiantes
estudiantesRoutes.get('/', EstudiantesController.obtenerEstudiantes);
estudiantesRoutes.get('/:id', EstudiantesController.obtenerEstudiantePorId);
estudiantesRoutes.post('/', EstudiantesController.crearEstudiante);
estudiantesRoutes.put('/:id', EstudiantesController.actualizarEstudiante);
estudiantesRoutes.patch('/:id/estado', EstudiantesController.cambiarEstadoEstudiante);
estudiantesRoutes.delete('/:id', EstudiantesController.eliminarEstudiante);

export default estudiantesRoutes;
