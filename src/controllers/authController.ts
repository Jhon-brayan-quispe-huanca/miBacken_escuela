import { Context } from 'hono';
import * as bcrypt from 'bcryptjs';
// @ts-ignore
import jwt from 'jsonwebtoken';
import { PrismaClient } from '../../generated/prisma';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'mariano_nunez_secret_key_2024_sistema_asistencia';

export class AuthController {

  // Login para otros usuarios (usando email)
  static async loginUsuario(c: Context) {
    try {
      const { email, password } = await c.req.json();

      if (!email || !password) {
        return c.json({ 
          success: false, 
          message: 'Email y contraseña son requeridos' 
        }, 400);
      }

      // Limpiar caracteres nulos y espacios en blanco
      const cleanEmail = email.replace(/\0/g, '').trim();
      const cleanPassword = password.replace(/\0/g, '').trim();

      // Buscar usuario por email
      const usuario: any = await prisma.usuarios.findFirst({
        where: { email: cleanEmail },
        include: {
          profesores: true,
          apoderados: true,
          roles: true
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

      // Determinar tipo de usuario basado en el rol
      let userType = usuario.roles?.nombre?.toLowerCase() || 'usuario';
      let additionalData = {};

      if (usuario.profesores && usuario.profesores.length > 0) {
        userType = 'profesor';
        additionalData = {
          especialidad: usuario.profesores[0].especialidad,
          telefono: usuario.profesores[0].telefono
        };
      } else if (usuario.apoderados && usuario.apoderados.length > 0) {
        userType = 'apoderado';
        additionalData = {
          telefono: usuario.apoderados[0].telefono,
          relacion: usuario.apoderados[0].relacion
        };
      } else if (usuario.roles?.nombre === 'Director') {
        userType = 'director';
      } else if (usuario.roles?.nombre === 'Portero') {
        userType = 'portero';
      }

      // Generar JWT
      const token = jwt.sign(
        { 
          userId: usuario.id,
          userType: userType,
          email: usuario.email,
          rolId: usuario.rol_id
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      return c.json({
        success: true,
        message: 'Login exitoso',
        data: {
          token,
          user: {
            id: usuario.id,
            tipo: userType,
            email: usuario.email,
            nombre: usuario.nombres,
            apellido: usuario.apellidos,
            rol: usuario.roles?.nombre,
            ...additionalData
          }
        }
      });

    } catch (error) {
      console.error('Error en login usuario:', error);
      return c.json({ 
        success: false, 
        message: 'Error interno del servidor' 
      }, 500);
    }
  }

  // Verificar token JWT
  static async verifyToken(c: Context) {
    try {
      const authHeader = c.req.header('Authorization');
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return c.json({ 
          success: false, 
          message: 'Token no proporcionado' 
        }, 401);
      }

      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, JWT_SECRET) as any;

      return c.json({
        success: true,
        data: {
          userId: decoded.userId,
          userType: decoded.userType,
          email: decoded.email,
          dni: decoded.dni
        }
      });

    } catch (error) {
      return c.json({ 
        success: false, 
        message: 'Token inválido' 
      }, 401);
    }
  }
}
