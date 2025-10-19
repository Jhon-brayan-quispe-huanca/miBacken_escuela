const fs = require('fs');
const path = require('path');

// Directorios a procesar
const directories = [
    'src/controllers',
    'src/services',
    'src/routes',
    'src/middleware'
];

// Agregar el archivo index.ts también
const files = ['src/index.ts'];

function fixPrismaImports(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    // Corregir importaciones de Prisma para Render
    // En Render, la estructura es: /opt/render/project/generated/prisma/index.js
    // Pero desde src/ necesitamos: ../generated/prisma/index.js
    content = content.replace(
        /from ['"]\.\.\/generated\/prisma\/index\.js['"]/g,
        "from '../generated/prisma/index.js'"
    );
    
    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Fixed Prisma imports in: ${filePath}`);
    }
}

// Procesar directorios
directories.forEach(dir => {
    const fullPath = path.join(__dirname, dir);
    if (fs.existsSync(fullPath)) {
        fs.readdirSync(fullPath).forEach(file => {
            if (file.endsWith('.ts')) {
                fixPrismaImports(path.join(fullPath, file));
            }
        });
    }
});

// Procesar archivos específicos
files.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        fixPrismaImports(filePath);
    }
});

console.log('All Prisma import paths fixed for Render!');
