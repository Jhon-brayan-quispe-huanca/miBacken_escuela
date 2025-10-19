import { Hono } from 'hono';
import { AuthController } from '../controllers/.js';
const authRoutes = new Hono();
// Ruta para login de otros usuarios (con email)
authRoutes.post('/login/usuario', AuthController.loginUsuario);
// Ruta para verificar token
authRoutes.get('/verify', AuthController.verifyToken);
// Ruta para logout (opcional, principalmente del lado del cliente)
authRoutes.post('/logout', (c) => {
    return c.json({
        success: true,
        message: 'Logout exitoso'
    });
});
export default authRoutes;
//# sourceMappingURL=authRoutes.js.map