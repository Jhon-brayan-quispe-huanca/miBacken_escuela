import { Hono } from 'hono';
import { publicCarnetController } from '../controllers/apoderadoController.js';

export const publicCarnetRoutes = new Hono();

// Rutas públicas para imágenes de carnets (SIN AUTENTICACIÓN)
publicCarnetRoutes.route('/', publicCarnetController);
