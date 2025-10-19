// Datos de prueba para estudiantes
export const estudianteMañana = {
  id: 1,
  apoderado_id: 1,
  estado: 'Activo',
  created_at: new Date('2024-01-01'),
  updated_at: new Date('2024-01-01'),
  usuario_id: 1,
  grado_id: 1,
  seccion_id: 1,
  codigo_estudiante: 'EST001',
  fecha_matricula: new Date('2024-01-01'),
  turno: 'MAÑANA',
  usuarios: {
    id: 1,
    nombres: 'Juan Carlos',
    apellidos: 'Pérez García',
    email: 'juan.perez@test.com',
  },
  grados: {
    id: 1,
    nombre: '5° Primaria',
  },
  secciones: {
    id: 1,
    nombre: 'A',
  },
  apoderados: [
    {
      id: 1,
      usuarios: {
        id: 2,
        nombres: 'María',
        apellidos: 'García',
        email: 'maria.garcia@test.com',
      },
    },
  ],
};

export const estudianteTarde = {
  id: 2,
  apoderado_id: 2,
  estado: 'Activo',
  created_at: new Date('2024-01-01'),
  updated_at: new Date('2024-01-01'),
  usuario_id: 3,
  grado_id: 2,
  seccion_id: 2,
  codigo_estudiante: 'EST002',
  fecha_matricula: new Date('2024-01-01'),
  turno: 'TARDE',
  usuarios: {
    id: 3,
    nombres: 'Ana Sofía',
    apellidos: 'López Mendoza',
    email: 'ana.lopez@test.com',
  },
  grados: {
    id: 2,
    nombre: '3° Secundaria',
  },
  secciones: {
    id: 2,
    nombre: 'B',
  },
  apoderados: [
    {
      id: 2,
      usuarios: {
        id: 4,
        nombres: 'Carlos',
        apellidos: 'López',
        email: 'carlos.lopez@test.com',
      },
    },
  ],
};

export const datosQRMañana = {
  codigo_estudiante: 'EST001',
  nombre: 'Juan Carlos',
  apellido: 'Pérez García',
  grado: '5° Primaria',
  seccion: 'A',
  turno: 'MAÑANA',
};

export const datosQRTarde = {
  codigo_estudiante: 'EST002',
  nombre: 'Ana Sofía',
  apellido: 'López Mendoza',
  grado: '3° Secundaria',
  seccion: 'B',
  turno: 'TARDE',
};

export const porteroMock = {
  id: 1,
  created_at: new Date(),
  updated_at: new Date(),
  direccion: 'Av. Principal 123',
  dni: '12345678',
  nombres: 'Carlos',
  apellidos: 'Portero',
  email: 'portero@test.com',
  telefono: '987654321',
  fecha_nacimiento: new Date('1980-01-01'),
  genero: 'M',
  estado: 'Activo',
  rol_id: 4,
  ultimo_login: null,
  password_hash: 'hashed_password_123',
  activo: true,
};