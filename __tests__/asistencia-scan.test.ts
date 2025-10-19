// Mock de Prisma
jest.mock('../generated/prisma/index.js', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    estudiantes: {
      findFirst: jest.fn(),
    },
    asistencia_general: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    usuarios: {
      findUnique: jest.fn(),
    },
  })),
}));

// Mock de dateUtils
jest.mock('../src/utils/dateUtils.js', () => ({
  getFechaActualPeru: jest.fn(),
  getHoraActualPeru: jest.fn(),
  getHoraActualPeruParaBD: jest.fn(),
  formatearHoraPeru: jest.fn(),
  esHoyEnPeru: jest.fn(),
}));

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import app from '../src/index.js';
import { estudianteMañana, estudianteTarde, porteroMock } from './fixtures/estudiantes.js';
import * as dateUtils from '../src/utils/dateUtils.js';
import { PrismaClient } from '../generated/prisma/index.js';

// Variables globales para los mocks
const mockDateUtils = jest.mocked(dateUtils);
const mockPrismaClient = new PrismaClient() as jest.Mocked<PrismaClient>;
const mockPrisma = mockPrismaClient;

const makeRequest = async (method: string, path: string, body?: any) => {
  const request = new Request(`http://localhost${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const response = await app.fetch(request);
  const responseBody = await response.json();

  return {
    status: response.status,
    body: responseBody,
  };
};

describe('Endpoint /asistencia/scan', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock del portero por defecto
    mockPrisma.usuarios.findUnique.mockResolvedValue(porteroMock);
    mockDateUtils.getFechaActualPeru.mockReturnValue('2024-01-15');
    mockDateUtils.esHoyEnPeru.mockReturnValue(true);
  });

  describe('Turno Mañana', () => {
    it('debería registrar entrada "Presente" para llegada temprana', async () => {
      const horaEntrada = '07:30:00';
      
      mockDateUtils.getHoraActualPeru.mockReturnValue(horaEntrada);
      mockPrisma.estudiantes.findFirst.mockResolvedValue(estudianteMañana);
      mockPrisma.asistencia_general.findFirst.mockResolvedValue(null);
      mockPrisma.asistencia_general.create.mockResolvedValue({
        id: 1,
        estudiante_id: parseInt(estudianteMañana.codigo_estudiante),
        usuario_portero_id: 1,
        fecha: new Date('2024-01-15'),
        hora_entrada: new Date('2024-01-15T07:30:00'),
        hora_salida: null,
        estado: 'Presente',
        observaciones: null,
        created_at: new Date(),
        updated_at: new Date()
      });

      const response = await makeRequest('POST', '/asistencia/scan', {
        qr_data: JSON.stringify(estudianteMañana),
        portero_id: 1,
        tipo_registro: 'entrada'
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.estado).toBe('Presente');
      expect(mockPrisma.asistencia_general.create).toHaveBeenCalled();
    });

    it('debería registrar entrada "Tarde" para llegada tardía', async () => {
      const horaEntradaTarde = '08:30:00';
      
      mockDateUtils.getHoraActualPeru.mockReturnValue(horaEntradaTarde);
      mockPrisma.estudiantes.findFirst.mockResolvedValue(estudianteMañana);
      mockPrisma.asistencia_general.findFirst.mockResolvedValue(null);
      mockPrisma.asistencia_general.create.mockResolvedValue({
        id: 1,
        estudiante_id: parseInt(estudianteMañana.codigo_estudiante),
        usuario_portero_id: 1,
        fecha: new Date('2024-01-15'),
        hora_entrada: new Date('2024-01-15T08:30:00'),
        hora_salida: null,
        estado: 'Tarde',
        observaciones: null,
        created_at: new Date(),
        updated_at: new Date()
      });

      const response = await makeRequest('POST', '/asistencia/scan', {
        qr_data: JSON.stringify(estudianteMañana),
        portero_id: 1,
        tipo_registro: 'entrada'
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.estado).toBe('Tarde');
      expect(mockPrisma.asistencia_general.create).toHaveBeenCalled();
    });

    it('debería registrar salida correctamente', async () => {
      const horaSalida = '12:30:00';
      
      mockDateUtils.getHoraActualPeru.mockReturnValue(horaSalida);
      mockPrisma.estudiantes.findFirst.mockResolvedValue(estudianteMañana);
      
      const asistenciaExistente = {
        id: 1,
        estudiante_id: parseInt(estudianteMañana.codigo_estudiante),
        usuario_portero_id: 1,
        fecha: new Date('2024-01-15'),
        hora_entrada: new Date('2024-01-15T07:30:00'),
        hora_salida: null,
        estado: 'Presente',
        observaciones: null,
        created_at: new Date(),
        updated_at: new Date()
      };

      mockPrisma.asistencia_general.findFirst.mockResolvedValue(asistenciaExistente);
      mockPrisma.asistencia_general.update.mockResolvedValue({
        ...asistenciaExistente,
        hora_salida: new Date('2024-01-15T12:30:00'),
        updated_at: new Date()
      });

      const response = await makeRequest('POST', '/asistencia/scan', {
        qr_data: JSON.stringify(estudianteMañana),
        portero_id: 1,
        tipo_registro: 'salida'
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.estado).toBe('Presente');
      expect(mockPrisma.asistencia_general.update).toHaveBeenCalled();
    });

    it('debería rechazar entrada fuera de horario', async () => {
      const horaFueraHorario = '22:00:00';
      
      mockDateUtils.getHoraActualPeru.mockReturnValue(horaFueraHorario);

      const response = await makeRequest('POST', '/asistencia/scan', {
        qr_data: JSON.stringify(estudianteMañana),
        portero_id: 1,
        tipo_registro: 'entrada'
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Fuera del horario permitido para registro');
    });
  });

  describe('Turno Tarde', () => {
    it('debería registrar entrada "Presente" para llegada temprana', async () => {
      const horaEntrada = '13:30:00';
      
      mockDateUtils.getHoraActualPeru.mockReturnValue(horaEntrada);
      mockPrisma.estudiantes.findFirst.mockResolvedValue(estudianteTarde);
      mockPrisma.asistencia_general.findFirst.mockResolvedValue(null);
      mockPrisma.asistencia_general.create.mockResolvedValue({
        id: 1,
        estudiante_id: parseInt(estudianteTarde.codigo_estudiante),
        usuario_portero_id: 1,
        fecha: new Date('2024-01-15'),
        hora_entrada: new Date('2024-01-15T13:30:00'),
        hora_salida: null,
        estado: 'Presente',
        observaciones: null,
        created_at: new Date(),
        updated_at: new Date()
      });

      const response = await makeRequest('POST', '/asistencia/scan', {
        qr_data: JSON.stringify(estudianteTarde),
        portero_id: 1,
        tipo_registro: 'entrada'
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.estado).toBe('Presente');
      expect(mockPrisma.asistencia_general.create).toHaveBeenCalled();
    });

    it('debería registrar salida correctamente', async () => {
      const horaSalida = '18:30:00';
      
      mockDateUtils.getHoraActualPeru.mockReturnValue(horaSalida);
      mockPrisma.estudiantes.findFirst.mockResolvedValue(estudianteTarde);
      
      const asistenciaExistente = {
        id: 1,
        estudiante_id: parseInt(estudianteTarde.codigo_estudiante),
        usuario_portero_id: 1,
        fecha: new Date('2024-01-15'),
        hora_entrada: new Date('2024-01-15T13:30:00'),
        hora_salida: null,
        estado: 'Presente',
        observaciones: null,
        created_at: new Date(),
        updated_at: new Date()
      };

      mockPrisma.asistencia_general.findFirst.mockResolvedValue(asistenciaExistente);
      mockPrisma.asistencia_general.update.mockResolvedValue({
        ...asistenciaExistente,
        hora_salida: new Date('2024-01-15T18:30:00'),
        updated_at: new Date()
      });

      const response = await makeRequest('POST', '/asistencia/scan', {
        qr_data: JSON.stringify(estudianteTarde),
        portero_id: 1,
        tipo_registro: 'salida'
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.estado).toBe('Presente');
      expect(mockPrisma.asistencia_general.update).toHaveBeenCalled();
    });

    it('debería rechazar entrada fuera de horario', async () => {
      const horaFueraHorario = '22:00:00';
      
      mockDateUtils.getHoraActualPeru.mockReturnValue(horaFueraHorario);

      const response = await makeRequest('POST', '/asistencia/scan', {
        qr_data: JSON.stringify(estudianteTarde),
        portero_id: 1,
        tipo_registro: 'entrada'
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Fuera del horario permitido para registro');
    });
  });

  describe('Escenarios de Error', () => {
    it('debería rechazar QR inexistente', async () => {
      const datosIncompletos = {
        codigo_estudiante: '999999',
        nombres: 'No Existe',
        apellidos: 'Estudiante',
        grado: '1',
        seccion: 'A',
        turno: 'mañana'
      };

      mockPrisma.estudiantes.findFirst.mockResolvedValue(null);

      const response = await makeRequest('POST', '/asistencia/scan', {
        qr_data: JSON.stringify(datosIncompletos),
        portero_id: 1,
        tipo_registro: 'entrada'
      });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Estudiante no encontrado');
    });

    it('debería rechazar datos requeridos faltantes', async () => {
      const response = await makeRequest('POST', '/asistencia/scan', {
        portero_id: 1,
        tipo_registro: 'entrada'
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('requeridos');
    });

    it('debería rechazar portero no encontrado', async () => {
      mockPrisma.usuarios.findUnique.mockResolvedValue(null);

      const response = await makeRequest('POST', '/asistencia/scan', {
        qr_data: JSON.stringify(estudianteMañana),
        portero_id: 999,
        tipo_registro: 'entrada'
      });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Portero no encontrado');
    });

    it('debería manejar errores de base de datos', async () => {
      mockPrisma.asistencia_general.findFirst.mockRejectedValue(new Error('Database error'));

      const response = await makeRequest('POST', '/asistencia/scan', {
        qr_data: JSON.stringify(estudianteMañana),
        portero_id: 1,
        tipo_registro: 'entrada'
      });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Error interno del servidor');
    });

    it('debería rechazar JSON inválido', async () => {
      const response = await makeRequest('POST', '/asistencia/scan', {
        qr_data: 'json_invalido',
        portero_id: 1,
        tipo_registro: 'entrada'
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Casos Especiales', () => {
    it('debería rechazar ya existe salida registrada', async () => {
      const horaSalida = '12:30:00';
      
      mockDateUtils.getHoraActualPeru.mockReturnValue(horaSalida);
      mockPrisma.estudiantes.findFirst.mockResolvedValue(estudianteMañana);
      
      const asistenciaCompleta = {
        id: 1,
        estudiante_id: parseInt(estudianteMañana.codigo_estudiante),
        usuario_portero_id: 1,
        fecha: new Date('2024-01-15'),
        hora_entrada: new Date('2024-01-15T07:30:00'),
        hora_salida: new Date('2024-01-15T12:30:00'),
        estado: 'Presente',
        observaciones: null,
        created_at: new Date(),
        updated_at: new Date()
      };

      mockPrisma.asistencia_general.findFirst.mockResolvedValue(asistenciaCompleta);

      const response = await makeRequest('POST', '/asistencia/scan', {
        qr_data: JSON.stringify(estudianteMañana),
        portero_id: 1,
        tipo_registro: 'salida'
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Ya se registró la salida para este estudiante');
    });

    it('debería rechazar escaneos fuera de horario', async () => {
      const horaFueraHorario = '22:00:00';
      
      mockDateUtils.getHoraActualPeru.mockReturnValue(horaFueraHorario);

      const response = await makeRequest('POST', '/asistencia/scan', {
        qr_data: JSON.stringify(estudianteMañana),
        portero_id: 1,
        tipo_registro: 'entrada'
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Fuera del horario permitido para registro');
    });
  });
});
