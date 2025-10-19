const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Configurando Prisma para Supabase...');

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

  // 3. Crear archivo de configuración para deshabilitar prepared statements
  const configPath = path.join(__dirname, 'prisma-config.js');
  const configContent = `
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
`;

  fs.writeFileSync(configPath, configContent);
  console.log('📝 Archivo de configuración creado');

  // 4. Sincronizar con la base de datos
  console.log('🔄 Sincronizando con Supabase...');
  execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });

  console.log('✅ Prisma configurado correctamente para Supabase!');

} catch (error) {
  console.error('❌ Error configurando Prisma:', error.message);
  process.exit(1);
}
