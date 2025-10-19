import { Hono } from 'hono';
import { PorteroController } from '../controllers/porteroController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const porteroRoutes = new Hono();

// Aplicar middleware de autenticación a todas las rutas
porteroRoutes.use('*', authMiddleware);

// Rutas del perfil del portero
porteroRoutes.get('/perfil', PorteroController.obtenerPerfil);
porteroRoutes.put('/perfil', PorteroController.actualizarPerfil);

// Rutas del dashboard
porteroRoutes.get('/dashboard', PorteroController.obtenerDashboard);

// Rutas de asistencia
porteroRoutes.post('/asistencia/escanear-qr', PorteroController.procesarEscaneoQR);
porteroRoutes.post('/asistencia/manual', PorteroController.registrarAsistenciaManual);
porteroRoutes.get('/asistencia/hoy', PorteroController.obtenerAsistenciasHoy);
porteroRoutes.get('/asistencia/fecha', PorteroController.obtenerAsistenciasPorFecha);
porteroRoutes.get('/asistencia/historial/:estudianteId', PorteroController.obtenerHistorialEstudiante);
porteroRoutes.get('/asistencia/historial-completo/:estudianteId', PorteroController.obtenerHistorialCompletoEstudiante);

// Endpoint para marcar ausencias automáticas (para pruebas)
porteroRoutes.post('/asistencia/marcar-ausencias', PorteroController.marcarAusenciasManual);

porteroRoutes.get('/estudiante/buscar/:codigo', PorteroController.buscarEstudiantePorCodigo);

// Buscar estudiantes por nombre (búsqueda global)
porteroRoutes.get('/estudiantes/buscar', PorteroController.buscarEstudiantesPorNombre);

// Rutas de control de turno - COMENTADAS: El método no existe en el controlador actual
// porteroRoutes.put('/turno/estado', PorteroController.cambiarEstadoTurno);

export default porteroRoutes;
