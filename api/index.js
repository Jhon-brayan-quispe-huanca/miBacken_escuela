// Adaptador para Vercel + Hono
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'

const app = new Hono()

// Middlewares
app.use('*', logger())
app.use('*', cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:8080',
    'http://192.168.18.22:3000',
    'http://10.0.2.2:3000',
    'https://mi-backen-escuela.vercel.app'
  ],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

// Health check
app.get('/api/health', (c) => {
  return c.json({
    success: true,
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString()
  })
})

// Test endpoint
app.get('/api/test', (c) => {
  return c.json({
    success: true,
    message: 'Conexión exitosa',
    timestamp: new Date().toISOString()
  })
})

// Root endpoint
app.get('/', (c) => {
  return c.json({
    success: true,
    message: 'Backend funcionando en Vercel',
    timestamp: new Date().toISOString(),
    endpoints: [
      '/api/health',
      '/api/test'
    ]
  })
})

// Catch all for API routes
app.get('/api/*', (c) => {
  return c.json({
    success: false,
    message: 'Endpoint no encontrado',
    path: c.req.path
  }, 404)
})

export default app