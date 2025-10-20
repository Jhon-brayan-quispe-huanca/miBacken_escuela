import { Hono } from 'hono';
import { PrismaClient } from '../../generated/prisma/index.js';
import * as bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL
        }
    },
    log: ['error'],
    errorFormat: 'minimal'
});
const fastAuthRoutes = new Hono();
// Login optimizado para Render Free Tier
fastAuthRoutes.post('/fast-login', async (c) => {
    try {
        const { email, password } = await c.req.json();
        if (!email || !password) {
            return c.json({
                success: false,
                message: 'Email y contraseña son requeridos'
            }, 400);
        }
        // Query optimizada - solo campos necesarios
        const usuario = await prisma.usuarios.findFirst({
            where: {
                email: email.trim(),
                activo: true
            },
            select: {
                id: true,
                nombres: true,
                apellidos: true,
                email: true,
                password_hash: true,
                rol_id: true,
                roles: {
                    select: {
                        nombre: true
                    }
                }
            }
        });
        if (!usuario) {
            return c.json({
                success: false,
                message: 'Email o contraseña incorrectos'
            }, 401);
        }
        // Verificar contraseña
        const isValidPassword = await bcrypt.compare(password, usuario.password_hash);
        if (!isValidPassword) {
            return c.json({
                success: false,
                message: 'Email o contraseña incorrectos'
            }, 401);
        }
        // Generar JWT
        const token = jwt.sign({
            userId: usuario.id,
            userType: 'director',
            email: usuario.email,
            rolId: usuario.rol_id
        }, process.env.JWT_SECRET || 'mariano_nunez_secret_key_2024_sistema_asistencia', { expiresIn: '24h' });
        return c.json({
            success: true,
            message: 'Login exitoso',
            data: {
                token,
                user: {
                    id: usuario.id,
                    tipo: 'director',
                    email: usuario.email,
                    nombre: usuario.nombres,
                    apellido: usuario.apellidos,
                    rol: usuario.roles?.nombre
                }
            }
        });
    }
    catch (error) {
        console.error('Error en fast-login:', error);
        return c.json({
            success: false,
            message: 'Error interno del servidor'
        }, 500);
    }
});
export default fastAuthRoutes;
//# sourceMappingURL=fastAuthRoutes.js.map