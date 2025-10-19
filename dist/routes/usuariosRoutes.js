import { Hono } from 'hono';
import { UsuariosController } from '../controllers/usuariosController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
const usuariosRoutes = new Hono();
// Middleware de autenticación para todas las rutas
usuariosRoutes.use('*', authMiddleware);
// Rutas auxiliares para formularios (deben ir ANTES que las rutas con parámetros)
usuariosRoutes.get('/roles', UsuariosController.obtenerRoles);
// Rutas principales de usuarios
usuariosRoutes.get('/', UsuariosController.obtenerUsuarios);
usuariosRoutes.get('/:id', UsuariosController.obtenerUsuarioPorId);
usuariosRoutes.post('/', UsuariosController.crearUsuario);
usuariosRoutes.put('/:id', UsuariosController.actualizarUsuario);
usuariosRoutes.patch('/:id/password', UsuariosController.cambiarContrasena);
usuariosRoutes.patch('/:id/estado', UsuariosController.cambiarEstadoUsuario);
usuariosRoutes.delete('/:id', UsuariosController.eliminarUsuario);
export default usuariosRoutes;
//# sourceMappingURL=usuariosRoutes.js.map