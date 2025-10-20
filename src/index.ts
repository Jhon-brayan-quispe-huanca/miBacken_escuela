import 'dotenv/config'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { PrismaClient } from '../generated/prisma/index.js';

// Configuración optimizada para Vercel
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  },
  // Configuración para Vercel
  log: ['error'],
  errorFormat: 'minimal'
});

import { serve } from '@hono/node-server'
import { createServer } from 'node:http'
import authRoutes from './routes/authRoutes.js'
import directorRoutes from './routes/directorRoutes.js'
import estudiantesRoutes from './routes/estudiantesRoutes.js'
import profesoresRoutes from './routes/profesoresRoutes.js'
import profesorRoutes01 from './routes/profesorRoutes01.js'
import porteroRoutes from './routes/porteroRoutes.js'
import usuariosRoutes from './routes/usuariosRoutes.js'
import carnetRoutes from './routes/carnetRoutes.js'
import directorAsistenciaRoutes from './routes/directorAsistenciaRoutes.js'
import { carnetMasivoRoutes } from './routes/carnetMasivoRoutes.js'
import { apoderadoRoutes } from './routes/apoderadoRoutes.js'
import { apoderadoPermisoRoutes } from './routes/apoderadoPermisoRoutes.js'
import { profesorPermisoRoutes } from './routes/profesorPermisoRoutes.js'
import { directorCarnetRoutes } from './routes/directorCarnetRoutes.js'
import { debugRoutes } from './routes/debugRoutes.js'
import { publicCarnetRoutes } from './routes/publicCarnetRoutes.js'
import publicRoutes from './routes/publicRoutes.js'
import uploadController from './controllers/uploadController.js'
import notificacionController from './controllers/notificacionController.js'

// Prisma Client ya inicializado arriba

// Crear aplicación Hono
const app = new Hono()

// Middlewares globales
app.use('*', logger())
app.use('*', cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:8080',
    'http://192.168.18.22:3000',
    'http://10.0.2.2:3000',
    'https://unsharping-naoma-expensively.ngrok-free.dev' 
  ],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

// Health check endpoint
app.get('/api/health', (c) => {
  return c.json({
    success: true,
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString()
  })
})

// Endpoint de prueba para celular
app.get('/api/test', (c) => {
  return c.json({
    success: true,
    message: 'Conexión desde celular exitosa',
    timestamp: new Date().toISOString(),
    ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown'
  })
})

// Endpoint de prueba de conexión a DB
app.get('/api/test-db', async (c) => {
  try {
    console.log('🔍 [TEST-DB] Iniciando prueba de conexión...');
    console.log('🔍 [TEST-DB] DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
    console.log('🔍 [TEST-DB] DIRECT_URL:', process.env.DIRECT_URL ? 'SET' : 'NOT SET');
    console.log('🔍 [TEST-DB] DATABASE_URL value:', process.env.DATABASE_URL);
    console.log('🔍 [TEST-DB] DIRECT_URL value:', process.env.DIRECT_URL);
    
    const { PrismaClient } = await import('../generated/prisma/index.js');
    const prisma = new PrismaClient();

    console.log('🔍 [TEST-DB] PrismaClient creado, probando conexión...');
    
    // Prueba simple de conexión
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ [TEST-DB] Conexión exitosa:', result);

    // Probar consulta de usuarios
    const userCount = await prisma.usuarios.count();
    console.log('✅ [TEST-DB] Usuarios en DB:', userCount);

    await prisma.$disconnect();
    
    return c.json({
      success: true,
      message: 'Conexión a base de datos exitosa',
      data: {
        connection: 'OK',
        userCount,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ [TEST-DB] Error de conexión:', error);
    return c.json({
      success: false,
      message: 'Error de conexión a base de datos',
      error: error instanceof Error ? error.message : 'Unknown error',
      details: {
        databaseUrl: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
        directUrl: process.env.DIRECT_URL ? 'SET' : 'NOT SET',
        databaseUrlValue: process.env.DATABASE_URL,
        directUrlValue: process.env.DIRECT_URL,
        timestamp: new Date().toISOString()
      }
    }, 500);
  }
})

// Endpoint de prueba con conexión directa (sin pooler)
app.get('/api/test-db-direct', async (c) => {
  try {
    console.log('🔍 [TEST-DB-DIRECT] Probando conexión directa...');
    
    const { PrismaClient } = await import('../generated/prisma/index.js');
    
    // Usar DIRECT_URL si está disponible, sino DATABASE_URL
    const directUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
    console.log('🔍 [TEST-DB-DIRECT] Usando URL:', directUrl ? 'SET' : 'NOT SET');
    
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: directUrl
        }
      }
    });

    console.log('🔍 [TEST-DB-DIRECT] PrismaClient creado con conexión directa...');
    
    // Prueba simple de conexión
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ [TEST-DB-DIRECT] Conexión directa exitosa:', result);

    // Probar consulta de usuarios
    const userCount = await prisma.usuarios.count();
    console.log('✅ [TEST-DB-DIRECT] Usuarios en DB:', userCount);

    await prisma.$disconnect();
    
    return c.json({
      success: true,
      message: 'Conexión directa a base de datos exitosa',
      data: {
        connection: 'OK',
        userCount,
        connectionType: 'DIRECT',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ [TEST-DB-DIRECT] Error de conexión directa:', error);
    return c.json({
      success: false,
      message: 'Error de conexión directa a base de datos',
      error: error instanceof Error ? error.message : 'Unknown error',
      details: {
        directUrl: process.env.DIRECT_URL ? 'SET' : 'NOT SET',
        databaseUrl: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
        timestamp: new Date().toISOString()
      }
    }, 500);
  }
})

// Endpoint de prueba con SQLite local (fallback)
app.get('/api/test-sqlite', async (c) => {
  try {
    console.log('🔍 [TEST-SQLITE] Probando SQLite local...');
    
    // Crear conexión SQLite temporal
    const sqliteUrl = 'file:./test.db';
    console.log('🔍 [TEST-SQLITE] Usando SQLite:', sqliteUrl);
    
    const { PrismaClient } = await import('../generated/prisma/index.js');
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: sqliteUrl
        }
      }
    });

    console.log('🔍 [TEST-SQLITE] PrismaClient creado con SQLite...');
    
    // Prueba simple de conexión
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ [TEST-SQLITE] Conexión SQLite exitosa:', result);

    await prisma.$disconnect();
    
    return c.json({
      success: true,
      message: 'Conexión SQLite local exitosa',
      data: {
        connection: 'OK',
        connectionType: 'SQLITE_LOCAL',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ [TEST-SQLITE] Error de conexión SQLite:', error);
    return c.json({
      success: false,
      message: 'Error de conexión SQLite local',
      error: error instanceof Error ? error.message : 'Unknown error',
      details: {
        timestamp: new Date().toISOString()
      }
    }, 500);
  }
})

// Endpoint de login de prueba para celular (GET)
app.get('/api/test-login', async (c) => {
  try {
    const { PrismaClient } = await import('../generated/prisma/index.js');
    const bcrypt = await import('bcryptjs');
    const jwt = await import('jsonwebtoken');

    const prisma = new PrismaClient();

    // Buscar usuario director
    const usuario = await prisma.usuarios.findFirst({
      where: {
        email: 'director@escuela.com',
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
        message: 'Usuario no encontrado'
      }, 404);
    }

    // Verificar contraseña (admin123)
    const isValidPassword = await bcrypt.default.compare('admin123', usuario.password_hash);

    if (!isValidPassword) {
      return c.json({
        success: false,
        message: 'Contraseña incorrecta'
      }, 401);
    }

    // Generar JWT
    const token = jwt.default.sign(
      {
        userId: usuario.id,
        userType: 'director',
        email: usuario.email,
        rolId: usuario.rol_id
      },
      process.env.JWT_SECRET || 'mariano_nunez_secret_key_2024_sistema_asistencia',
      { expiresIn: '24h' }
    );

    return c.json({
      success: true,
      message: 'Login exitoso desde celular',
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

  } catch (error) {
    console.error('Error en test-login:', error);
    return c.json({
      success: false,
      message: 'Error interno del servidor'
    }, 500);
  }
})


// Rutas de debug (solo para desarrollo)
app.route('/api/debug', debugRoutes)

// Rutas de permisos del apoderado (registradas primero)
app.route('/api/apoderado', apoderadoPermisoRoutes)

// Rutas del apoderado
app.route('/api/apoderado', apoderadoRoutes)

// Rutas de permisos del profesor
app.route('/api/profesor', profesorPermisoRoutes)

// Rutas de autenticación
app.route('/api/auth', authRoutes)

// Rutas del director
app.route('/api/director', directorRoutes)

// Rutas de carnets del director
app.route('/api/director', directorCarnetRoutes)

// Rutas de estudiantes (gestión por director)
app.route('/api/estudiantes', estudiantesRoutes)


// Rutas de profesores (gestión por director)
app.route('/api/profesores', profesoresRoutes)

// Rutas de profesores individuales
app.route('/api/profesor', profesorRoutes01)

// Rutas de profesores (alias para compatibilidad)
app.route('/api/profesor01', profesorRoutes01)

// Rutas del portero
app.route('/api/portero', porteroRoutes)

// Rutas de usuarios
app.route('/api/usuarios', usuariosRoutes)

// Rutas de carnet
app.route('/api/carnet', carnetRoutes)

// Rutas de carnet masivo
app.route('/api/carnet-masivo', carnetMasivoRoutes)

// Rutas de asistencias del director
app.route('/api/director', directorAsistenciaRoutes)

// Rutas públicas para imágenes de carnets (SIN AUTENTICACIÓN)
app.route('/api/public/carnets', publicCarnetRoutes)

// Rutas públicas (SIN AUTENTICACIÓN)
app.route('/api/public', publicRoutes)

// Rutas de subida de archivos
app.route('/api/upload', uploadController)

// Rutas de notificaciones
app.route('/api/notificaciones', notificacionController)


// Inicializar servicios
// const schedulerService = new SchedulerService(prisma)
// const asistenciaService = new AsistenciaService(prisma)

// Iniciar el servidor
const port = process.env.PORT || 3000
const host = process.env.HOST || '0.0.0.0' // Permitir conexiones desde red local

serve({
  fetch: app.fetch,
  port: Number(port),
  hostname: host,
})

console.log(` Servidor ejecutándose en puerto ${port}`)
console.log(` Health check: http://localhost:${port}/api/health`)
console.log(` Red local: http://192.168.18.22:${port}/api/health`)
console.log(` Para celular: http://192.168.18.22:${port}/api/health`)

// Manejo de cierre graceful
process.on('SIGINT', async () => {
  console.log('\n Cerrando servidor...')
  await prisma.$disconnect()
  console.log(' Servidor cerrado correctamente')
  process.exit(0)
})

export default app
