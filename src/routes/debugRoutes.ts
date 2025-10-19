import { Hono } from 'hono';
import { debugController } from '../controllers/apoderadoController.js';

export const debugRoutes = new Hono();

// Rutas de debug
debugRoutes.route('/', debugController);
