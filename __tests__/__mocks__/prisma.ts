// Mock de PrismaClient para tests
export const mockPrismaClient = {
  estudiantes: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  asistencia_general: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  usuarios: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  grados: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
  },
  secciones: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
  },
  apoderados: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
  },
  $disconnect: jest.fn(),
};

// Mock del constructor de PrismaClient
export const PrismaClient = jest.fn(() => mockPrismaClient);