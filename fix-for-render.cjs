const fs = require('fs');
const path = require('path');

// Función para corregir el archivo compilado para Render
function fixCompiledFile() {
    const filePath = path.join(__dirname, 'dist/index.js');
    
    if (!fs.existsSync(filePath)) {
        console.log('❌ dist/index.js not found');
        return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    // Reemplazar la ruta de Prisma en el archivo compilado para Render
    // Render busca: /opt/render/project/generated/prisma/index.js
    // Pero el archivo está en: /opt/render/project/src/generated/prisma/index.js
    // Necesitamos: ../../generated/prisma/index.js desde dist/
    content = content.replace(
        /from ['"]\.\.\/generated\/prisma\/index\.js['"]/g,
        "from '../../generated/prisma/index.js'"
    );
    
    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('✅ Fixed dist/index.js for Render');
    } else {
        console.log('⚠️ No changes needed in dist/index.js');
    }
}

console.log('🔧 Fixing compiled file for Render...');
fixCompiledFile();
console.log('✅ Done!');
