import { Hono } from 'hono';
import { directorCarnetController } from '../controllers/.js';
export const directorCarnetRoutes = new Hono();
// Registrar todas las rutas de carnets del director
directorCarnetRoutes.route('/carnets', directorCarnetController);
//# sourceMappingURL=directorCarnetRoutes.js.map