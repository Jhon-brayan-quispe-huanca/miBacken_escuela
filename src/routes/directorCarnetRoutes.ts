import { Hono } from 'hono';
import { directorCarnetController } from '../controllers/apoderadoController.js';

export const directorCarnetRoutes = new Hono();

// Registrar todas las rutas de carnets del director
directorCarnetRoutes.route('/carnets', directorCarnetController);
