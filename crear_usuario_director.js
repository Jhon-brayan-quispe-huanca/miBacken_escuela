const { PrismaClient } = require('../../generated/prisma');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function crearUsuarioDirector() {
  try {
    console.log('🚀 Iniciando creación de roles y usuario director...');

    // 1. CREAR ROLES PRIMERO
    console.log('📋 Creando roles...');
    
    const roles = [
      {
        id: 1,
        nombre: 'Director',
        descripcion: 'Administrador del sistema escolar',
        requiere_dni: true,
        puede_login_email: true
      },
      {
        id: 2,
        nombre: 'Profesor',
        descripcion: 'Docente del centro educativo',
        requiere_dni: true,
        puede_login_email: true
      },
      {
        id: 3,
        nombre: 'Portero',
        descripcion: 'Personal de seguridad y control de acceso',
        requiere_dni: true,
        puede_login_email: true
      },
      {
        id: 4,
        nombre: 'Apoderado',
        descripcion: 'Padre, madre o tutor legal del estudiante',
        requiere_dni: true,
        puede_login_email: true
      }
    ];

    for (const rol of roles) {
      const rolExistente = await prisma.roles.findUnique({
        where: { id: rol.id }
      });

      if (!rolExistente) {
        await prisma.roles.create({
          data: {
            ...rol,
            created_at: new Date(),
            updated_at: new Date()
          }
        });
        console.log(`✅ Rol creado: ${rol.nombre} (ID: ${rol.id})`);
      } else {
        console.log(`⚠️ Rol ya existe: ${rol.nombre} (ID: ${rol.id})`);
      }
    }

    console.log('📋 Roles verificados/creados correctamente');

    // 2. CREAR USUARIO DIRECTOR
    console.log('👤 Creando usuario director...');

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
        nombre: 'Briyan',
        apellido: 'Quispe',
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
    console.log('👤 Nombre:', usuario.nombre, usuario.apellido);
    console.log('🆔 DNI:', usuario.dni);
    console.log('📞 Teléfono:', usuario.telefono);
    console.log('🏠 Dirección:', usuario.direccion);
    console.log('🎂 Fecha nacimiento:', usuario.fecha_nacimiento);
    console.log('👤 Género:', usuario.genero);
    console.log('👤 Rol ID:', usuario.rol_id);
    console.log('📊 Estado:', usuario.estado);
    console.log('📅 Fecha creación:', usuario.fecha_creacion);

    // Verificar que se creó correctamente
    const usuarioVerificado = await prisma.usuarios.findUnique({
      where: { id: usuario.id },
      include: {
        rol: true
      }
    });

    console.log('🔍 Usuario verificado:');
    console.log('📧 Email:', usuarioVerificado.email);
    console.log('👤 Rol:', usuarioVerificado.rol?.nombre);
    console.log('📊 Estado:', usuarioVerificado.estado);

  } catch (error) {
    console.error('❌ Error creando usuario director:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar la función
crearUsuarioDirector();
