import { Hono } from 'hono';
import { publicCarnetController } from '../controllers/publicCarnetController.js';
export const publicCarnetRoutes = new Hono();
// Rutas públicas para imágenes de carnets (SIN AUTENTICACIÓN)
publicCarnetRoutes.route('/', publicCarnetController);
//# sourceMappingURL=publicCarnetRoutes.js.map