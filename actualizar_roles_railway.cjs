const { PrismaClient } = require('./generated/prisma/index.js');
const prisma = new PrismaClient();

async function actualizarRoles() {
  console.log('🔧 Actualizando roles en Railway...');
  
  const rolesData = [
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
    console.log(`✅ Rol ${role.nombre} (ID: ${role.id}) actualizado con requiere_dni: ${role.requiere_dni}, puede_login_email: ${role.puede_login_email}`);
  }
  
  console.log('🎉 Roles actualizados exitosamente!');
  
  const allRoles = await prisma.roles.findMany();
  console.log('\n📋 Roles en la base de datos:');
  allRoles.forEach(r => console.log(`- ID: ${r.id} | Nombre: ${r.nombre} | Requiere DNI: ${r.requiere_dni} | Puede Login Email: ${r.puede_login_email}`));
}

actualizarRoles()
  .catch((e) => {
    console.error('❌ Error al actualizar roles:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
