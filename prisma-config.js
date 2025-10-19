
// Configuración para deshabilitar prepared statements en Supabase
const { PrismaClient } = require('./generated/prisma');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  },
  // Deshabilitar prepared statements para Supabase
  __internal: {
    engine: {
      useUds: false
    }
  }
});

module.exports = prisma;
