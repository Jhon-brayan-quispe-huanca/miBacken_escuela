const { PrismaClient } = require('./generated/prisma');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function crearSoloUsuario() {
  try {
    console.log('🚀 Creando usuario director...');

    // Verificar si ya existe el usuario
    const usuarioExistente = await prisma.usuarios.findFirst({
      where: {
        email: 'briyan@escuela.edu.pe'
      }
    });

    if (usuarioExistente) {
      console.log('⚠️ El usuario ya existe:', usuarioExistente);
      return;
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash('159briyan159', 10);
    console.log('🔐 Contraseña hasheada');

    // Crear el usuario director
    const usuario = await prisma.usuarios.create({
      data: {
        dni: '12345678',
        nombres: 'Briyan',
        apellidos: 'Quispe',
        email: 'briyan@escuela.edu.pe',
        telefono: '987654321',
        direccion: 'Lima, Perú',
        fecha_nacimiento: new Date('1990-01-01'),
        genero: 'Masculino',
        contrasena: hashedPassword,
        rol_id: 1, // Director
        estado: 'Activo',
        fecha_creacion: new Date(),
        fecha_actualizacion: new Date()
      }
    });

    console.log('✅ Usuario director creado exitosamente:');
    console.log('🆔 ID:', usuario.id);
    console.log('📧 Email:', usuario.email);
    console.log('👤 Nombres:', usuario.nombres, usuario.apellidos);
    console.log('🆔 DNI:', usuario.dni);
    console.log('📞 Teléfono:', usuario.telefono);
    console.log('🏠 Dirección:', usuario.direccion);
    console.log('🎂 Fecha nacimiento:', usuario.fecha_nacimiento);
    console.log('👤 Género:', usuario.genero);
    console.log('👤 Rol ID:', usuario.rol_id);
    console.log('📊 Estado:', usuario.estado);
    console.log('📅 Fecha creación:', usuario.fecha_creacion);

  } catch (error) {
    console.error('❌ Error creando usuario director:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar la función
crearSoloUsuario();
