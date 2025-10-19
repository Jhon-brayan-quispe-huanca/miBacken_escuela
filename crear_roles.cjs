const { PrismaClient } = require('./generated/prisma/index.js');

const prisma = new PrismaClient();

async function crearRoles() {
  try {
    console.log('🔧 Creando roles...');
    
    // Insertar roles con IDs específicos
    const roles = [
      {
        id: 1,
        nombre: 'Director',
        descripcion: 'Director de la institución educativa',
        requiere_dni: true,
        puede_login_email: true
      },
      {
        id: 2,
        nombre: 'Profesor',
        descripcion: 'Profesor de la institución educativa',
        requiere_dni: true,
        puede_login_email: true
      },
      {
        id: 3,
        nombre: 'Portero',
        descripcion: 'Portero de la institución educativa',
        requiere_dni: true,
        puede_login_email: true
      },
      {
        id: 4,
        nombre: 'Apoderado',
        descripcion: 'Apoderado de estudiantes',
        requiere_dni: true,
        puede_login_email: true
      }
    ];

    for (const rol of roles) {
      try {
        await prisma.roles.upsert({
          where: { id: rol.id },
          update: rol,
          create: rol
        });
        console.log(`✅ Rol ${rol.nombre} (ID: ${rol.id}) creado/actualizado`);
      } catch (error) {
        console.error(`❌ Error con rol ${rol.nombre}:`, error.message);
      }
    }

    console.log('🎉 Roles creados exitosamente!');
    
    // Verificar roles creados
    const rolesCreados = await prisma.roles.findMany({
      orderBy: { id: 'asc' }
    });
    
    console.log('\n📋 Roles en la base de datos:');
    rolesCreados.forEach(rol => {
      console.log(`- ID: ${rol.id} | Nombre: ${rol.nombre} | Descripción: ${rol.descripcion}`);
    });

  } catch (error) {
    console.error('❌ Error general:', error);
  } finally {
    await prisma.$disconnect();
  }
}

crearRoles();
