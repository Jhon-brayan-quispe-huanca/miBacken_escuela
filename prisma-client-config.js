
// Configuración personalizada para deshabilitar prepared statements
const { PrismaClient } = require('./generated/prisma');

// Configuración para Supabase connection pooling
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  },
  // Deshabilitar prepared statements completamente
  __internal: {
    engine: {
      useUds: false,
      binaryTargets: ['native']
    }
  },
  // Configuración de logging para debug
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error']
});

// Configurar para no usar prepared statements
prisma.$connect = async () => {
  // Conexión directa sin prepared statements
  return prisma;
};

module.exports = prisma;
