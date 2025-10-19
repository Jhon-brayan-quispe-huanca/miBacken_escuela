import 'dotenv/config'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient();

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

serve({
  fetch: app.fetch,
  port: Number(port),
})

console.log(` Servidor ejecutándose en puerto ${port}`)
console.log(` Health check: http://localhost:${port}/api/health`)

// Manejo de cierre graceful
process.on('SIGINT', async () => {
  console.log('\n Cerrando servidor...')
  await prisma.$disconnect()
  console.log(' Servidor cerrado correctamente')
  process.exit(0)
})

export default app
