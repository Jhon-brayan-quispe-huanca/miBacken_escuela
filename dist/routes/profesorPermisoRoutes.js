import { Hono } from 'hono';
import { profesorPermisoController } from '../controllers/profesorPermisoController.js';
export const profesorPermisoRoutes = new Hono();
// Rutas para la gestión de permisos por el profesor
profesorPermisoRoutes.route('/', profesorPermisoController);
//# sourceMappingURL=profesorPermisoRoutes.js.map