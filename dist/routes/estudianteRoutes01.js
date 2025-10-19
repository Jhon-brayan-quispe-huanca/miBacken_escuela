import { Hono } from 'hono';
import { EstudianteController01 } from '../controllers/estudianteController01.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
const estudianteApp = new Hono();
// Aplicar middleware de autenticación a todas las rutas
estudianteApp.use('*', authMiddleware);
/**
 * Rutas específicas para las funcionalidades del estudiante
 * Estas rutas manejan las operaciones que los estudiantes realizan
 * desde su área en la aplicación Flutter
 */
// ========================================
// RUTAS DEL PERFIL
// ========================================
// GET /estudiante/perfil - Obtener información del perfil
estudianteApp.get('/perfil', EstudianteController01.obtenerPerfil);
// PUT /estudiante/perfil - Actualizar información del perfil
estudianteApp.put('/perfil', EstudianteController01.actualizarPerfil);
// PUT /estudiante/turno - Actualizar turno del estudiante
estudianteApp.put('/turno', EstudianteController01.actualizarTurno);
// ========================================
// RUTAS DEL DASHBOARD
// ========================================
// GET /estudiante/dashboard - Obtener estadísticas del dashboard
estudianteApp.get('/dashboard', EstudianteController01.obtenerDashboard);
// ========================================
// RUTAS DE ASISTENCIAS
// ========================================
// GET /estudiante/asistencias - Obtener historial de asistencias
estudianteApp.get('/asistencias', EstudianteController01.obtenerHistorialAsistencias);
// POST /estudiante/asistencias - Registrar asistencia
estudianteApp.post('/asistencias', EstudianteController01.registrarAsistencia);
// ========================================
// RUTAS DE HORARIO
// ========================================
// GET /estudiante/horario - Obtener horario del estudiante
estudianteApp.get('/horario', EstudianteController01.obtenerHorario);
export default estudianteApp;
//# sourceMappingURL=estudianteRoutes01.js.map