const fs = require('fs');
const path = require('path');

// Función para corregir un archivo
function fixFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    // Reemplazar TODAS las rutas de Prisma con la ruta correcta
    content = content.replace(
        /from ['"]\.\.\/generated\/prisma\/index\.js['"]/g,
        "from '../../generated/prisma/index.js'"
    );
    
    content = content.replace(
        /from ['"]\.\/generated\/prisma\/index\.js['"]/g,
        "from '../../generated/prisma/index.js'"
    );
    
    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Fixed: ${filePath}`);
        return true;
    }
    return false;
}

// Función recursiva para procesar directorios
function processDirectory(dirPath) {
    const items = fs.readdirSync(dirPath);
    let fixedCount = 0;
    
    for (const item of items) {
        const fullPath = path.join(dirPath, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            fixedCount += processDirectory(fullPath);
        } else if (item.endsWith('.ts')) {
            if (fixFile(fullPath)) {
                fixedCount++;
            }
        }
    }
    
    return fixedCount;
}

// Procesar todos los archivos TypeScript
console.log('🔧 Fixing ALL Prisma import paths with CORRECT paths...');

let totalFixed = 0;

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
        console.log(`📁 Processing ${dir}...`);
        totalFixed += processDirectory(fullPath);
    }
});

// Archivos específicos
const specificFiles = [
    'src/index.ts',
    'src/routes/publicRoutes.ts'
];

specificFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        if (fixFile(filePath)) {
            totalFixed++;
        }
    }
});

console.log(`✅ Fixed ${totalFixed} files!`);
console.log('🎉 All Prisma import paths corrected with SECURE paths!');
