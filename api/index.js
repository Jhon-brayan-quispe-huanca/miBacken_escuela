// Adaptador para Vercel: añade raíz "/" y monta la app real
import { Hono } from 'hono'
import realApp from '../dist/index.js'

const app = new Hono()

// Respuesta para "/" para evitar 404 en el root
app.get('/', (c) =>
  c.json({
    success: true,
    message: 'Backend funcionando en Vercel',
    timestamp: new Date().toISOString(),
    endpoints: ['/api/health', '/api/test', '/api/test-db', '/api/public/roles']
  })
)

// Montar toda la app real (incluye todas las rutas /api/*)
app.route('/', realApp)

export default app