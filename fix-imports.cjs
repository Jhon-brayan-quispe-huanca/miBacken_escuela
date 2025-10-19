const fs = require('fs');
const path = require('path');

// Mapeo de importaciones correctas
const importMappings = {
  // Services
  'carnetService': 'carnetService.js',
  'CarnetMasivoService': 'carnetMasivoService.js',
  'permisoService': 'permisoService.js',
  'NotificacionService': 'notificacionService.js',
  'AsistenciaService': 'asistenciaService.js',
  'DatosQREstudiante': 'asistenciaService.js',
  'PorteroService': 'porteroService.js',
  
  // Controllers
  'AuthController': 'authController.js',
  'apoderadoController': 'apoderadoController.js',
  'apoderadoPermisoController': 'apoderadoPermisoController.js',
  'CarnetController': 'carnetController.js',
  'CarnetMasivoController': 'carnetMasivoController.js',
  'debugController': 'debugController.js',
  'DirectorAsistenciaController': 'directorAsistenciaController.js',
  'directorCarnetController': 'directorCarnetController.js',
  'DirectorController': 'directorController.js',
  'EstudiantesController': 'estudiantesController.js',
  'PorteroController': 'porteroController.js',
  'ProfesoresController': 'profesoresController.js',
  'profesorPermisoController': 'profesorPermisoController.js',
  'ProfesorController01': 'profesorController01.js',
  'publicCarnetController': 'publicCarnetController.js',
  'UsuariosController': 'usuariosController.js',
  
  // Middleware
  'authMiddleware': 'authMiddleware.js',
  
  // Utils
  'getFechaActualPeru': 'dateUtils.js',
  'getHoraActualPeru': 'dateUtils.js',
  'getFechaHoraActualPeru': 'dateUtils.js',
  'formatearFechaPeru': 'dateUtils.js',
  'formatearHoraPeru': 'dateUtils.js',
  'esHoyEnPeru': 'dateUtils.js',
  'getInicioDiaPeru': 'dateUtils.js',
  'getFinDiaPeru': 'dateUtils.js',
  'getHoraActualPeruParaBD': 'dateUtils.js'
};

function fixImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  // Corregir importaciones de servicios
  content = content.replace(/from '\.\.\/services\/([^']+)\.js'/g, (match, serviceName) => {
    const correctFile = importMappings[serviceName] || `${serviceName}.js`;
    changed = true;
    return `from '../services/${correctFile}'`;
  });
  
  // Corregir importaciones de controladores
  content = content.replace(/from '\.\.\/controllers\/([^']+)\.js'/g, (match, controllerName) => {
    const correctFile = importMappings[controllerName] || `${controllerName}.js`;
    changed = true;
    return `from '../controllers/${correctFile}'`;
  });
  
  // Corregir importaciones de middleware
  content = content.replace(/from '\.\.\/middleware\/([^']+)\.js'/g, (match, middlewareName) => {
    const correctFile = importMappings[middlewareName] || `${middlewareName}.js`;
    changed = true;
    return `from '../middleware/${correctFile}'`;
  });
  
  // Corregir importaciones de utils
  content = content.replace(/from '\.\.\/utils\/([^']+)\.js'/g, (match, utilName) => {
    const correctFile = importMappings[utilName] || `${utilName}.js`;
    changed = true;
    return `from '../utils/${correctFile}'`;
  });
  
  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log(`Fixed imports in: ${filePath}`);
  }
}

// Procesar todos los archivos TypeScript
function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      processDirectory(filePath);
    } else if (file.endsWith('.ts')) {
      fixImports(filePath);
    }
  }
}

// Procesar directorio src
processDirectory('./src');
console.log('All imports fixed!');
