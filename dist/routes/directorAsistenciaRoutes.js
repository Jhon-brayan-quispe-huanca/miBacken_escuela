import { Hono } from 'hono';
import { DirectorAsistenciaController } from '../controllers/.js';
import { authMiddleware } from '../middleware/.js';
const directorAsistenciaRoutes = new Hono();
// Aplicar middleware de autenticación a todas las rutas
directorAsistenciaRoutes.use('*', authMiddleware);
// GET /api/director/asistencias?fecha=YYYY-MM-DD (asistencias generales con lógica de ausentes automáticos)
directorAsistenciaRoutes.get('/asistencias', DirectorAsistenciaController.obtenerAsistenciasGenerales);
// PATCH /api/director/asistencias/:id/justificar
directorAsistenciaRoutes.patch('/asistencias/:id/justificar', DirectorAsistenciaController.justificarAsistencia);
// GET /api/director/asistencias/estadisticas?fecha=YYYY-MM-DD
directorAsistenciaRoutes.get('/asistencias/estadisticas', DirectorAsistenciaController.obtenerEstadisticasAsistencias);
// GET /api/director/asistencias/profesores?fecha=YYYY-MM-DD&grado_id=1&seccion_id=1
directorAsistenciaRoutes.get('/asistencias/profesores', DirectorAsistenciaController.obtenerProfesoresConAsistencia);
// GET /api/director/asistencia-salon?grado_id=1&seccion_id=1&fecha=YYYY-MM-DD&profesor_id=1
directorAsistenciaRoutes.get('/asistencia-salon', DirectorAsistenciaController.obtenerAsistenciasPorSalon);
// GET /api/director/exportar-excel?grado_id=1&seccion_id=1&fecha=YYYY-MM-DD&profesor_id=1
directorAsistenciaRoutes.get('/exportar-excel', DirectorAsistenciaController.exportarAsistenciaExcel);
// GET /api/director/asistencias-generales (endpoint directo para asistencias generales)
directorAsistenciaRoutes.get('/asistencias-generales', DirectorAsistenciaController.obtenerAsistenciasGenerales);
export default directorAsistenciaRoutes;
//# sourceMappingURL=directorAsistenciaRoutes.js.map