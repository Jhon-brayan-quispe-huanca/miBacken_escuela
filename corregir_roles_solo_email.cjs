const { PrismaClient } = require('./generated/prisma/index.js');
const prisma = new PrismaClient();

async function corregirRolesSoloEmail() {
  console.log('🔧 Corrigiendo roles para login SOLO con email...');
  
  const rolesData = [
    { 
      id: 1, 
      nombre: 'Director', 
      descripcion: 'Director de la institución educativa', 
      requiere_dni: false,    // NO requiere DNI para login
      puede_login_email: true // Login SOLO con email
    },
    { 
      id: 2, 
      nombre: 'Profesor', 
      descripcion: 'Profesor de la institución educativa', 
      requiere_dni: false,    // NO requiere DNI para login
      puede_login_email: true // Login SOLO con email
    },
    { 
      id: 3, 
      nombre: 'Portero', 
      descripcion: 'Portero de la institución educativa', 
      requiere_dni: false,    // NO requiere DNI para login
      puede_login_email: true // Login SOLO con email
    },
    { 
      id: 4, 
      nombre: 'Apoderado', 
      descripcion: 'Apoderado de estudiantes', 
      requiere_dni: false,    // NO requiere DNI para login
      puede_login_email: true // Login SOLO con email
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
  console.log('📝 LOGIN SOLO CON EMAIL - NO DNI');
  console.log('📝 DNI solo para identificación personal');
  
  const allRoles = await prisma.roles.findMany();
  console.log('\n📋 Roles finales:');
  allRoles.forEach(r => console.log(`- ${r.nombre}: DNI=${r.requiere_dni}, LoginEmail=${r.puede_login_email}`));
}

corregirRolesSoloEmail()
  .catch((e) => {
    console.error('❌ Error al corregir roles:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
