import { Hono } from 'hono';
import { DirectorController } from '../controllers/directorController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const directorRoutes = new Hono();

// Middleware de autenticación para todas las rutas del director
directorRoutes.use('*', authMiddleware);

// Obtener perfil del director
directorRoutes.get('/perfil', DirectorController.obtenerPerfil);

// Actualizar perfil del director (sin DNI)
directorRoutes.put('/perfil', DirectorController.actualizarPerfil);

// Obtener estadísticas del dashboard
directorRoutes.get('/dashboard', DirectorController.obtenerEstadisticasDashboard);

// Obtener estadísticas generales
directorRoutes.get('/estadisticas', DirectorController.obtenerEstadisticas);

// Cambiar contraseña
directorRoutes.put('/cambiar-password', DirectorController.cambiarContrasena);

// Rutas para asignaciones de profesores
directorRoutes.get('/asignaciones', DirectorController.obtenerAsignaciones);
directorRoutes.post('/asignaciones', DirectorController.crearAsignacion);
directorRoutes.put('/asignaciones/:id', DirectorController.actualizarAsignacion);
directorRoutes.delete('/asignaciones/:id', DirectorController.eliminarAsignacion);

// Rutas auxiliares para formularios de asignaciones
directorRoutes.get('/asignaciones/datos/grados', DirectorController.obtenerGrados);
directorRoutes.get('/asignaciones/datos/secciones', DirectorController.obtenerSecciones);
directorRoutes.get('/asignaciones/datos/materias', DirectorController.obtenerMaterias);
directorRoutes.get('/asignaciones/datos/profesores', DirectorController.obtenerProfesores);

// Ruta para asistencia por salón
// directorRoutes.get('/asistencia-salon', DirectorController.obtenerAsistenciaPorSalon); // COMENTADO: Usar DirectorAsistenciaController en su lugar

export default directorRoutes;
