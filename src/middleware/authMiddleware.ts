import { Context, Next } from 'hono';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '../../generated/prisma/index.js';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'mariano_nunez_secret_key_2024_sistema_asistencia';

export const authMiddleware = async (c: Context, next: Next) => {
  try {
    const authHeader = c.req.header('Authorization');
    const url = c.req.url;
    console.error('🔍 AuthMiddleware - URL:', url);
    console.error('🔍 AuthMiddleware - Authorization header:', authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('❌ AuthMiddleware - Token no proporcionado');
      return c.json({ 
        success: false, 
        message: 'Token no proporcionado' 
      }, 401);
    }

    const token = authHeader.substring(7);
    console.error('🔍 AuthMiddleware - Token extraído:', token.substring(0, 50) + '...');
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    console.error('🔍 AuthMiddleware - Token decodificado:', decoded);

    // Obtener información completa del usuario
    console.error('🔍 AuthMiddleware - Buscando usuario con ID:', decoded.userId);
    const usuario = await prisma.usuarios.findFirst({
      where: {
        id: decoded.userId,
        activo: true
      },
      include: {
        roles: true
      }
    });

    if (!usuario) {
      console.error('❌ AuthMiddleware - Usuario no encontrado o inactivo');
      return c.json({ 
        success: false, 
        message: 'Usuario no encontrado o inactivo' 
      }, 401);
    }
    
    console.error('✅ AuthMiddleware - Usuario encontrado:', { id: usuario.id, email: usuario.email, rol_id: usuario.rol_id });

    // Agregar información del usuario al contexto
    const userContext = {
      id: usuario.id,
      dni: usuario.dni,
      nombres: usuario.nombres,
      apellidos: usuario.apellidos,
      email: usuario.email,
      rol_id: usuario.rol_id,
      rol_nombre: usuario.roles?.nombre,
      activo: usuario.activo
    };
    
    console.error('🔍 AuthMiddleware - Usuario establecido en contexto:', userContext);
    c.set('user', userContext);

    console.error('🔍 AuthMiddleware - Continuando al siguiente middleware/controlador');
    await next();
  } catch (error) {
    console.error('❌ AuthMiddleware - Error:', error);
    return c.json({ 
      success: false, 
      message: 'Token inválido' 
    }, 401);
  }
};
