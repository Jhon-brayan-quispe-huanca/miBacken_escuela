import { Hono } from 'hono';
import { ProfesorController01 } from '../controllers/profesorController01.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const profesorApp = new Hono();

// Aplicar middleware de autenticación a todas las rutas
profesorApp.use('*', authMiddleware);

/**
 * Rutas específicas para las funcionalidades del profesor
 * Estas rutas manejan las operaciones que los profesores realizan
 * desde su área en la aplicación Flutter
 */

// ========================================
// RUTAS DEL DASHBOARD
// ========================================

// GET /profesor/dashboard - Obtener estadísticas del dashboard
profesorApp.get('/dashboard', ProfesorController01.obtenerDashboard);

// ========================================
// RUTAS DEL PERFIL
// ========================================

// GET /profesor/perfil - Obtener información del perfil
profesorApp.get('/perfil', ProfesorController01.obtenerPerfil);

// PUT /profesor/perfil - Actualizar información del perfil
profesorApp.put('/perfil', ProfesorController01.actualizarPerfil);

// ========================================
// RUTAS DE MATERIAS Y ASIGNACIONES
// ========================================

// GET /profesor/asignaciones - Obtener asignaciones del profesor (grados y secciones)
profesorApp.get('/asignaciones', ProfesorController01.obtenerAsignaciones);

// GET /profesor/asignacion/:asignacionId/estudiantes - Obtener estudiantes de una asignación
profesorApp.get('/asignacion/:asignacionId/estudiantes', ProfesorController01.obtenerEstudiantesAsignacion);

// ========================================
// RUTAS DE ASISTENCIAS
// ========================================

// POST /profesor/asistencia - Registrar asistencia de estudiantes
profesorApp.post('/asistencia', ProfesorController01.registrarAsistencia);

// PUT /profesor/asistencia/:id - Actualizar asistencia existente
profesorApp.put('/asistencia/:id', ProfesorController01.actualizarAsistencia);

// ========================================
// RUTAS DE REPORTES Y ESTADÍSTICAS
// ========================================

// GET /profesor/asignaciones-filtro - Obtener asignaciones para filtrado
profesorApp.get('/asignaciones-filtro', ProfesorController01.obtenerAsignacionesParaFiltro);

// GET /profesor/reportes - Obtener reportes de asistencia
profesorApp.get('/reportes', ProfesorController01.obtenerReportes);

// GET /profesor/estadisticas - Obtener estadísticas de asistencia
profesorApp.get('/estadisticas', ProfesorController01.obtenerEstadisticasAsistencia);

// ========================================
// RUTAS DEL PROFESOR (DEBE IR AL FINAL)
// ========================================

// GET /profesor/:usuarioId/estadisticas - Obtener estadísticas del dashboard
profesorApp.get('/:usuarioId/estadisticas', ProfesorController01.obtenerEstadisticasDashboard);

// GET /profesor/:usuarioId - Obtener información del profesor por usuario ID
// IMPORTANTE: Esta ruta debe ir AL FINAL porque captura cualquier ruta que no haya sido capturada antes
profesorApp.get('/:usuarioId', ProfesorController01.obtenerProfesorPorUsuarioId);

export default profesorApp;