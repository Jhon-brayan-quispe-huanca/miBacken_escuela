import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de roles fijos...');

  // Definir los 4 roles fijos con IDs específicos
  const rolesFijos = [
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

  // Insertar o actualizar cada rol
  for (const rol of rolesFijos) {
    try {
      await prisma.roles.upsert({
        where: { id: rol.id },
        update: {
          nombre: rol.nombre,
          descripcion: rol.descripcion,
          requiere_dni: rol.requiere_dni,
          puede_login_email: rol.puede_login_email,
          updated_at: new Date()
        },
        create: {
          id: rol.id,
          nombre: rol.nombre,
          descripcion: rol.descripcion,
          requiere_dni: rol.requiere_dni,
          puede_login_email: rol.puede_login_email
        }
      });
      console.log(`✅ Rol ${rol.id} (${rol.nombre}) insertado/actualizado`);
    } catch (error) {
      console.error(`❌ Error al insertar rol ${rol.id}:`, error);
    }
  }

  // Verificar que los roles se insertaron correctamente
  const rolesInsertados = await prisma.roles.findMany({
    orderBy: { id: 'asc' }
  });

  console.log('\n📋 Roles en la base de datos:');
  rolesInsertados.forEach(rol => {
    console.log(`  ${rol.id}: ${rol.nombre} - ${rol.descripcion}`);
  });

  console.log('\n🎉 Seed completado exitosamente!');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
