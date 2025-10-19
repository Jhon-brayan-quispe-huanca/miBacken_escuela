const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Inicializando Prisma para Render...');

try {
  // 1. Generar Prisma
  console.log('🔧 Generando cliente Prisma...');
  execSync('npx prisma generate', { stdio: 'inherit' });

  // 2. Sincronizar esquema con la base de datos
  console.log('🔄 Sincronizando esquema con Supabase...');
  execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });

  console.log('✅ Prisma inicializado correctamente!');

} catch (error) {
  console.error('❌ Error inicializando Prisma:', error.message);
  process.exit(1);
}
