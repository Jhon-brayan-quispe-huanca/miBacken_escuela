import { Hono } from 'hono';
import { debugController } from '../controllers/debugController.js';
export const debugRoutes = new Hono();
// Rutas de debug
debugRoutes.route('/', debugController);
//# sourceMappingURL=debugRoutes.js.map