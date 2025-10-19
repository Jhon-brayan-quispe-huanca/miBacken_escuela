const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔄 Regenerando Prisma con nueva configuración...');

try {
  // 1. Eliminar el directorio generated existente
  const generatedPath = path.join(__dirname, 'generated');
  if (fs.existsSync(generatedPath)) {
    console.log('🗑️ Eliminando directorio generated existente...');
    fs.rmSync(generatedPath, { recursive: true, force: true });
  }

  // 2. Regenerar Prisma
  console.log('🔧 Ejecutando prisma generate...');
  execSync('npx prisma generate', { stdio: 'inherit' });

  // 3. Verificar que se generó correctamente
  const prismaIndexPath = path.join(generatedPath, 'prisma', 'index.js');
  if (fs.existsSync(prismaIndexPath)) {
    console.log('✅ Prisma regenerado exitosamente!');
    console.log('📁 Ubicación:', prismaIndexPath);
  } else {
    console.log('❌ Error: No se pudo generar Prisma');
  }

} catch (error) {
  console.error('❌ Error regenerando Prisma:', error.message);
  process.exit(1);
}
