import { Hono } from 'hono';
import { PrismaClient } from '../../generated/prisma/index.js';
const prisma = new PrismaClient();
const publicRoutes = new Hono();
// Endpoint público para obtener roles (sin autenticación)
publicRoutes.get('/roles', async (c) => {
    try {
        const roles = await prisma.roles.findMany({
            select: {
                id: true,
                nombre: true,
                descripcion: true
            },
            orderBy: {
                id: 'asc'
            }
        });
        return c.json({
            success: true,
            data: roles
        });
    }
    catch (error) {
        console.error('Error obteniendo roles:', error);
        return c.json({
            success: false,
            message: 'Error interno del servidor'
        }, 500);
    }
});
export default publicRoutes;
//# sourceMappingURL=publicRoutes.js.map