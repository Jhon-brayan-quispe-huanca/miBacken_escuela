const { PrismaClient } = require('./generated/prisma/index.js');
const prisma = new PrismaClient();

async function corregirRoles() {
  console.log('🔧 Corrigiendo roles para login solo con email...');
  
  const rolesData = [
    { 
      id: 1, 
      nombre: 'Director', 
      descripcion: 'Director de la institución educativa', 
      requiere_dni: true,    // DNI para identificación
      puede_login_email: true // Login solo con email
    },
    { 
      id: 2, 
      nombre: 'Profesor', 
      descripcion: 'Profesor de la institución educativa', 
      requiere_dni: true,    // DNI para identificación
      puede_login_email: true // Login solo con email
    },
    { 
      id: 3, 
      nombre: 'Portero', 
      descripcion: 'Portero de la institución educativa', 
      requiere_dni: true,    // DNI para identificación
      puede_login_email: true // Login solo con email
    },
    { 
      id: 4, 
      nombre: 'Apoderado', 
      descripcion: 'Apoderado de estudiantes', 
      requiere_dni: true,    // DNI para identificación
      puede_login_email: true // Login solo con email
    },
  ];

  for (const role of rolesData) {
    await prisma.roles.update({
      where: { id: role.id },
      data: {
        requiere_dni: role.requiere_dni,
        puede_login_email: role.puede_login_email,
      },
    });
    console.log(`✅ Rol ${role.nombre} (ID: ${role.id}) - DNI: ${role.requiere_dni}, Login Email: ${role.puede_login_email}`);
  }
  
  console.log('🎉 Roles corregidos exitosamente!');
  console.log('📝 Todos los usuarios necesitan DNI para identificación');
  console.log('📝 Todos los usuarios hacen login SOLO con email');
  
  const allRoles = await prisma.roles.findMany();
  console.log('\n📋 Roles finales:');
  allRoles.forEach(r => console.log(`- ${r.nombre}: DNI=${r.requiere_dni}, LoginEmail=${r.puede_login_email}`));
}

corregirRoles()
  .catch((e) => {
    console.error('❌ Error al corregir roles:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
