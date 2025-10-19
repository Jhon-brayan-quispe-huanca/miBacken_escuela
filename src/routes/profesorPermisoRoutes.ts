import { Hono } from 'hono';
import { profesorPermisoController } from '../controllers/apoderadoController.js';

export const profesorPermisoRoutes = new Hono();

// Rutas para la gestión de permisos por el profesor
profesorPermisoRoutes.route('/', profesorPermisoController);
