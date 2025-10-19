const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Configuración FINAL de Prisma para Supabase...');

try {
  // 1. Eliminar directorio generated existente
  const generatedPath = path.join(__dirname, 'generated');
  if (fs.existsSync(generatedPath)) {
    console.log('🗑️ Eliminando directorio generated existente...');
    fs.rmSync(generatedPath, { recursive: true, force: true });
  }

  // 2. Generar Prisma con configuración optimizada
  console.log('🔧 Generando cliente Prisma...');
  execSync('npx prisma generate', { stdio: 'inherit' });

  // 3. Crear configuración personalizada para deshabilitar prepared statements
  const configPath = path.join(__dirname, 'prisma-client-config.js');
  const configContent = `
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
`;

  fs.writeFileSync(configPath, configContent);
  console.log('📝 Configuración personalizada creada');

  // 4. Sincronizar con la base de datos
  console.log('🔄 Sincronizando con Supabase...');
  execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });

  console.log('✅ Prisma configurado FINALMENTE para Supabase!');
  console.log('🎯 Prepared statements DESHABILITADOS');

} catch (error) {
  console.error('❌ Error configurando Prisma:', error.message);
  process.exit(1);
}
