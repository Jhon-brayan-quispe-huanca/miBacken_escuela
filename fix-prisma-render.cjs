const fs = require('fs');
const path = require('path');

// Función para corregir un archivo
function fixFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    // Reemplazar todas las rutas de Prisma para Render
    content = content.replace(
        /from ['"]\.\.\/generated\/prisma\/index\.js['"]/g,
        "from './generated/prisma/index.js'"
    );
    
    content = content.replace(
        /from ['"]\.\.\/\.\.\/generated\/prisma\/index\.js['"]/g,
        "from './generated/prisma/index.js'"
    );
    
    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Fixed: ${filePath}`);
        return true;
    }
    return false;
}

// Función recursiva para procesar directorios
function processDirectory(dirPath) {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
        const fullPath = path.join(dirPath, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            processDirectory(fullPath);
        } else if (item.endsWith('.ts')) {
            fixFile(fullPath);
        }
    }
}

// Procesar todos los archivos TypeScript
console.log('🔧 Fixing all Prisma import paths for Render...');

// Archivos específicos
const specificFiles = [
    'src/index.ts',
    'src/routes/publicRoutes.ts'
];

specificFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        fixFile(filePath);
    }
});

// Procesar directorios
const directories = [
    'src/controllers',
    'src/services', 
    'src/routes',
    'src/middleware'
];

directories.forEach(dir => {
    const fullPath = path.join(__dirname, dir);
    if (fs.existsSync(fullPath)) {
        processDirectory(fullPath);
    }
});

console.log('✅ All Prisma import paths fixed for Render!');
