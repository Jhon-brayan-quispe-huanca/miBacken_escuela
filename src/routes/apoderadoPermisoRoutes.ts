import { Hono } from 'hono';
import { apoderadoPermisoController } from '../controllers/apoderadoPermisoController.js';

export const apoderadoPermisoRoutes = new Hono();

// Rutas para la gestión de permisos por el apoderado
apoderadoPermisoRoutes.route('/', apoderadoPermisoController);
