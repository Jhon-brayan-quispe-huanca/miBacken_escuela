const { PrismaClient } = require('./generated/prisma/index.js');
const prisma = new PrismaClient();

async function crearRoles() {
  console.log('🔧 Creando roles en Railway...');
  
  const rolesData = [
    { id: 1, nombre: 'Director', descripcion: 'Director de la institución educativa', requiere_dni: true, puede_login_email: true },
    { id: 2, nombre: 'Profesor', descripcion: 'Profesor de la institución educativa', requiere_dni: true, puede_login_email: true },
    { id: 3, nombre: 'Portero', descripcion: 'Portero de la institución educativa', requiere_dni: true, puede_login_email: true },
    { id: 4, nombre: 'Apoderado', descripcion: 'Apoderado de estudiantes', requiere_dni: true, puede_login_email: true },
  ];

  for (const role of rolesData) {
    await prisma.roles.upsert({
      where: { id: role.id },
      update: role,
      create: role,
    });
    console.log(`✅ Rol ${role.nombre} (ID: ${role.id}) creado/actualizado`);
  }
  
  console.log('🎉 Roles creados exitosamente!');
  
  const allRoles = await prisma.roles.findMany();
  console.log('\n📋 Roles en la base de datos:');
  allRoles.forEach(r => console.log(`- ID: ${r.id} | Nombre: ${r.nombre} | Descripción: ${r.descripcion}`));
}

crearRoles()
  .catch((e) => {
    console.error('❌ Error al crear roles:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
