import { Hono } from 'hono';
import { PrismaClient } from '../../generated/prisma';
import bcrypt from 'bcryptjs';

const seedRoutes = new Hono();
const prisma = new PrismaClient();

// Endpoint temporal para crear el usuario portero
seedRoutes.post('/create-portero', async (c) => {
  try {
    console.log('🔍 Verificando si existe el rol Portero...');
    
    // Verificar si existe el rol Portero
    let rolPortero = await prisma.roles.findFirst({
      where: { nombre: 'Portero' }
    });

    if (!rolPortero) {
      console.log('📝 Creando rol Portero...');
      rolPortero = await prisma.roles.create({
        data: {
          id: 3,
          nombre: 'Portero',
          descripcion: 'Personal encargado de la seguridad y control de acceso',
          requiere_dni: false,
          puede_login_email: true
        }
      });
      console.log('✅ Rol Portero creado con ID:', rolPortero.id);
    } else {
      console.log('✅ Rol Portero ya existe con ID:', rolPortero.id);
    }

    // Verificar si ya existe el usuario portero
    const usuarioExistente = await prisma.usuarios.findFirst({
      where: { email: 'portero@escuela.edu.pe' }
    });

    if (usuarioExistente) {
      return c.json({
        success: false,
        message: 'El usuario portero ya existe',
        data: {
          email: usuarioExistente.email,
          id: usuarioExistente.id
        }
      });
    }

    console.log('👤 Creando usuario portero...');
    
    // Hash de la contraseña
    const passwordHash = await bcrypt.hash('portero123', 10);

    // Crear usuario portero
    const usuarioPortero = await prisma.usuarios.create({
      data: {
        dni: null, // El portero puede usar email para login
        nombres: 'Portero',
        apellidos: 'Sistema',
        email: 'portero@escuela.edu.pe',
        telefono: '999888777',
        direccion: 'Escuela',
        fecha_nacimiento: new Date('1980-01-01'),
        genero: 'Masculino',
        rol_id: rolPortero.id,
        password_hash: passwordHash,
        activo: true
      }
    });

    console.log('✅ Usuario portero creado exitosamente');

    return c.json({
      success: true,
      message: 'Usuario portero creado exitosamente',
      data: {
        email: usuarioPortero.email,
        password: 'portero123',
        id: usuarioPortero.id,
        rol_id: usuarioPortero.rol_id
      }
    });

  } catch (error) {
    console.error('❌ Error al crear el usuario portero:', error);
    return c.json({
      success: false,
      message: 'Error al crear el usuario portero',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, 500);
  }
});

export default seedRoutes;
