import { Hono } from 'hono';
import { CarnetMasivoController } from '../controllers/.js';
import { authMiddleware } from '../middleware/.js';
const carnetMasivoRoutes = new Hono();
// Aplicar middleware de autenticación a todas las rutas
carnetMasivoRoutes.use('*', authMiddleware);
// Obtener estudiantes filtrados por grado y sección
carnetMasivoRoutes.get('/estudiantes-filtrados', CarnetMasivoController.obtenerEstudiantesFiltrados);
// Generar carnets masivamente
carnetMasivoRoutes.post('/generar-masivo', CarnetMasivoController.generarCarnetsMasivo);
// Obtener estadísticas de filtro
carnetMasivoRoutes.get('/estadisticas-filtro', CarnetMasivoController.obtenerEstadisticasFiltro);
export { carnetMasivoRoutes };
//# sourceMappingURL=carnetMasivoRoutes.js.map