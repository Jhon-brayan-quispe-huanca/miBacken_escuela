import { Hono } from 'hono';
import { apoderadoController } from '../controllers/.js';
export const apoderadoRoutes = new Hono();
// Rutas del apoderado
apoderadoRoutes.route('/', apoderadoController);
//# sourceMappingURL=apoderadoRoutes.js.map