// Jest setup file
// Mock de variables de entorno
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
process.env.JWT_SECRET = 'test_jwt_secret';

// Mock global de console para tests más limpios
global.console = {
  ...console,
  // Silenciar logs durante tests
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};