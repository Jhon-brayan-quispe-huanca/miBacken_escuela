const { PrismaClient } = require('./generated/prisma/index.js');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function crearDirector() {
  try {
    console.log('🔧 Creando usuario director...');
    
    // Hash de la contraseña
    const passwordHash = await bcrypt.hash('admin123', 10);
    
    // Datos del director
    const directorData = {
      dni: '12345678',
      nombres: 'Mariano',
      apellidos: 'Núñez',
      email: 'director@escuela.com',
      telefono: '987654321',
      direccion: 'Av. Principal 123',
      fecha_nacimiento: new Date('1980-01-01'),
      genero: 'Masculino',
      rol_id: 1, // Director
      password_hash: passwordHash,
      activo: true
    };

    // Crear usuario director
    const director = await prisma.usuarios.upsert({
      where: { email: directorData.email },
      update: directorData,
      create: directorData
    });

    console.log('✅ Usuario director creado exitosamente!');
    console.log(`📧 Email: ${director.email}`);
    console.log(`🔑 Contraseña: admin123`);
    console.log(`👤 Nombre: ${director.nombres} ${director.apellidos}`);
    console.log(`🆔 DNI: ${director.dni}`);
    console.log(`🎭 Rol: Director (ID: ${director.rol_id})`);

  } catch (error) {
    console.error('❌ Error creando director:', error);
  } finally {
    await prisma.$disconnect();
  }
}

crearDirector();
