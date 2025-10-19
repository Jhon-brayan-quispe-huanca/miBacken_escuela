const { execSync } = require('child_process');

console.log('🔧 Configuración SIMPLE de Prisma...');

try {
  // Solo generar Prisma, sin configuraciones complejas
  console.log('🔧 Generando cliente Prisma...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  console.log('✅ Prisma generado correctamente!');
  
} catch (error) {
  console.error('❌ Error generando Prisma:', error.message);
  // No salir con error, continuar
  console.log('⚠️ Continuando sin configuración personalizada...');
}
