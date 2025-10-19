import { Hono } from 'hono';
import { ProfesoresController } from '../controllers/profesoresController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
const profesoresRoutes = new Hono();
// Middleware de autenticación para todas las rutas
profesoresRoutes.use('*', authMiddleware);
// Rutas auxiliares para formularios (deben ir ANTES que las rutas con parámetros)
profesoresRoutes.get('/datos/materias', ProfesoresController.obtenerMaterias);
// Rutas principales de profesores
profesoresRoutes.get('/', ProfesoresController.obtenerProfesores);
profesoresRoutes.get('/:id', ProfesoresController.obtenerProfesorPorId);
profesoresRoutes.post('/', ProfesoresController.crearProfesor);
profesoresRoutes.put('/:id', ProfesoresController.actualizarProfesor);
profesoresRoutes.patch('/:id/estado', ProfesoresController.cambiarEstadoProfesor);
profesoresRoutes.delete('/:id', ProfesoresController.eliminarProfesor);
// Rutas para asignaciones
profesoresRoutes.post('/:id/asignaciones', ProfesoresController.asignarProfesorGradoSeccion);
export default profesoresRoutes;
//# sourceMappingURL=profesoresRoutes.js.map