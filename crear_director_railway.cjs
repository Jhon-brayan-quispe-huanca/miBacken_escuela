const { PrismaClient } = require('./generated/prisma/index.js');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function crearDirector() {
  console.log('🔧 Creando usuario director en Railway...');
  
  const password = 'admin123';
  const hashedPassword = await bcrypt.hash(password, 10);

  const directorData = {
    dni: '12345678',
    nombres: 'Mariano',
    apellidos: 'Núñez',
    email: 'director@escuela.com',
    telefono: '987654321',
    direccion: 'Av. Principal 123',
    fecha_nacimiento: new Date('1980-01-01'),
    genero: 'Masculino',
    rol_id: 1, // ID del rol Director
    password_hash: hashedPassword,
    activo: true,
  };

  const director = await prisma.usuarios.upsert({
    where: { email: directorData.email },
    update: directorData,
    create: directorData,
  });

  console.log('✅ Usuario director creado exitosamente!');
  console.log(`📧 Email: ${director.email}`);
  console.log(`🔑 Contraseña: ${password}`);
  console.log(`👤 Nombre: ${director.nombres} ${director.apellidos}`);
  console.log(`🆔 DNI: ${director.dni}`);
  console.log(`🎭 Rol: Director (ID: ${director.rol_id})`);
}

crearDirector()
  .catch((e) => {
    console.error('❌ Error al crear director:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
