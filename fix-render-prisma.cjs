const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing Prisma paths for Render deployment...');

// Leer el archivo compilado
const distIndexPath = path.join(__dirname, 'dist/index.js');
let content = fs.readFileSync(distIndexPath, 'utf8');

// Reemplazar la ruta de Prisma para Render
content = content.replace(
  /from ['"]\.\.\/generated\/prisma\/index\.js['"]/g,
  "from '../generated/prisma/index.js'"
);

// Escribir el archivo corregido
fs.writeFileSync(distIndexPath, content, 'utf8');

console.log('✅ Fixed dist/index.js for Render');
console.log('🎉 Prisma path corrected for Render deployment!');
