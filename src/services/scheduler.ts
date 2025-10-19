import { PrismaClient } from '../../generated/prisma';
import cron, { ScheduledTask } from 'node-cron';
import { AsistenciaService } from './asistenciaService.js';

const prisma = new PrismaClient();

/**
 * Servicio de programación de tareas para el sistema de asistencia
 */
export class SchedulerService {
  private static instance: SchedulerService;
  private tasks: Map<string, ScheduledTask> = new Map();

  private constructor() {}

  public static getInstance(): SchedulerService {
    if (!SchedulerService.instance) {
      SchedulerService.instance = new SchedulerService();
    }
    return SchedulerService.instance;
  }

  /**
   * Inicia todas las tareas programadas
   */
  public startAllTasks(): void {
    this.startDailyReset();
    this.startAutoAbsenceMarking();
    console.log('📅 Scheduler: Todas las tareas programadas han sido iniciadas');
  }

  /**
   * Programa el reinicio diario a las 11:59 PM
   * Esta tarea prepara el sistema para el nuevo día
   */
  private startDailyReset(): void {
    // Ejecutar todos los días a las 23:59 (11:59 PM)
    const task = cron.schedule('59 23 * * *', async () => {
      try {
        console.log('🌙 Scheduler: Iniciando reinicio diario a las 11:59 PM');
        await this.performDailyReset();
        console.log('✅ Scheduler: Reinicio diario completado exitosamente');
      } catch (error) {
        console.error('❌ Scheduler: Error durante el reinicio diario:', error);
      }
    }, {
      timezone: 'America/Lima' // Ajustar según la zona horaria del sistema
    });

    this.tasks.set('dailyReset', task);
    task.start();
    console.log('📅 Scheduler: Tarea de reinicio diario programada para las 11:59 PM');
  }

  /**
   * Programa el marcado automático de ausencias a las 8:00 PM
   * Esta tarea marca como "falta" a los estudiantes que no registraron asistencia durante el día
   */
  private startAutoAbsenceMarking(): void {
    // Ejecutar todos los días a las 20:00 (8:00 PM)
    const task = cron.schedule('0 20 * * *', async () => {
      try {
        console.log('🕐 Scheduler: Iniciando marcado automático de ausencias a las 8:00 PM');
        const resultado = await AsistenciaService.marcarAusenciasAutomaticas();
        console.log(`✅ Scheduler: ${resultado.mensaje}`);
        console.log(`📊 Scheduler: ${resultado.ausenciasMarcadas} estudiantes marcados como ausentes`);
      } catch (error) {
        console.error('❌ Scheduler: Error durante el marcado automático de ausencias:', error);
      }
    }, {
      timezone: 'America/Lima' // Zona horaria de Perú
    });

    this.tasks.set('autoAbsenceMarking', task);
    task.start();
    console.log('📅 Scheduler: Tarea de marcado automático de ausencias programada para las 8:00 PM');
  }

  /**
   * Realiza las operaciones de reinicio diario
   */
  private async performDailyReset(): Promise<void> {
    const ahora = new Date();
    const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
    
    console.log(`🔄 Scheduler: Preparando sistema para el nuevo día: ${hoy.toISOString().split('T')[0]}`);

    // Aquí puedes agregar más operaciones de limpieza si es necesario
    // Por ejemplo: limpiar logs antiguos, actualizar estadísticas, etc.
    
    // Log de estadísticas del día que termina
    await this.logDailyStatistics(hoy);
    
    console.log('🎯 Scheduler: Sistema preparado para el nuevo día');
  }

  /**
   * Registra estadísticas del día que termina
   */
  private async logDailyStatistics(fecha: Date): Promise<void> {
    try {
      const inicioDelDia = new Date(fecha);
      const finDelDia = new Date(fecha);
      finDelDia.setHours(23, 59, 59, 999);

      // Contar asistencias del día
      const totalAsistencias = await prisma.asistencia_salon.count({
        where: {
          fecha: {
            gte: inicioDelDia,
            lte: finDelDia
          }
        }
      });

      // Contar estudiantes presentes
      const estudiantesPresentes = await prisma.asistencia_salon.count({
        where: {
          fecha: {
            gte: inicioDelDia,
            lte: finDelDia
          },
          estado: 'Presente'
        }
      });

      // Contar estudiantes ausentes
      const estudiantesAusentes = await prisma.asistencia_salon.count({
        where: {
          fecha: {
            gte: inicioDelDia,
            lte: finDelDia
          },
          estado: 'Ausente'
        }
      });

      console.log(`📊 Estadísticas del día ${fecha.toISOString().split('T')[0]}:`);
      console.log(`   - Total de registros de asistencia: ${totalAsistencias}`);
      console.log(`   - Estudiantes presentes: ${estudiantesPresentes}`);
      console.log(`   - Estudiantes ausentes: ${estudiantesAusentes}`);
      
    } catch (error) {
      console.error('❌ Error al generar estadísticas diarias:', error);
    }
  }

  /**
   * Detiene todas las tareas programadas
   */
  public stopAllTasks(): void {
    this.tasks.forEach((task, name) => {
      task.stop();
      console.log(`🛑 Scheduler: Tarea '${name}' detenida`);
    });
    this.tasks.clear();
    console.log('🛑 Scheduler: Todas las tareas han sido detenidas');
  }

  /**
   * Obtiene el estado de todas las tareas
   */
  public getTasksStatus(): { [key: string]: boolean } {
    const status: { [key: string]: boolean } = {};
    this.tasks.forEach((task, name) => {
      // Las tareas en el Map están activas por defecto
      status[name] = true;
    });
    return status;
  }
}

export default SchedulerService;
