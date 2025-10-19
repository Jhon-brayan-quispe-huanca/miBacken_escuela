import { PrismaClient } from '../../generated/prisma/index.js';
import { getFechaActualPeru, getHoraActualPeru, getFechaHoraActualPeru, formatearFechaPeru, formatearHoraPeru, esHoyEnPeru, getInicioDiaPeru, getFinDiaPeru, getHoraActualPeruParaBD } from '../utils/dateUtils.js';

const prisma = new PrismaClient();

export interface DatosQREstudiante {
  codigo_estudiante: string;
  nombre: string;
  apellido: string;
  grado: string;
  seccion: string;
  turno: string;
}

export interface ResultadoAsistencia {
  success: boolean;
  message: string;
  tipo: 'entrada' | 'salida';
  estado: 'Presente' | 'Tarde' | 'Ausente';
  hora: string;
  estudiante?: any;
  asistencia?: any;
}

export interface AsistenciaFormateada {
  id: string | number;
  fecha: string;
  hora: string;
  estado: 'entrada' | 'salida';
  estado_asistencia: 'Presente' | 'Tarde' | 'Ausente' | 'Justificado';
  es_tardanza: boolean;
  estudiante: {
    id: number;
    codigo_estudiante: string;
    nombres: string;
    apellidos: string;
    grado: string;
    seccion: string;
    turno: string;
  };
}



export class AsistenciaService {
  /**
   * Procesa el escaneo de QR y registra la asistencia
   */
  static async procesarEscaneoQR(
    datosQR: DatosQREstudiante, 
    porteroId: number
  ): Promise<ResultadoAsistencia> {
    try {
      // 1. Buscar estudiante por código
      const estudiante = await prisma.estudiantes.findFirst({
        where: {
          codigo_estudiante: datosQR.codigo_estudiante
        },
        include: {
          grados: true,
          secciones: true,
          apoderados: {
            include: {
              usuarios: true
            }
          }
        }
      });

      if (!estudiante) {
        return {
          success: false,
          message: 'Estudiante no encontrado',
          tipo: 'entrada',
          estado: 'Ausente',
          hora: new Date().toLocaleTimeString()
        };
      }

      // Validar que el estudiante tiene los datos necesarios
      if (!estudiante) {
        return {
          success: false,
          message: 'Datos de estudiante incompletos',
          tipo: 'entrada',
          estado: 'Ausente',
          hora: new Date().toLocaleTimeString()
        };
      }

      // 2. Verificar que el turno coincida
      const turnoEstudiante = estudiante.turno || '';
      const turnoQR = datosQR.turno || '';
      
      if (turnoEstudiante.toLowerCase() !== turnoQR.toLowerCase()) {
        return {
          success: false,
          message: `Turno incorrecto. Estudiante registrado en turno ${turnoEstudiante}`,
          tipo: 'entrada',
          estado: 'Ausente',
          hora: new Date().toLocaleTimeString()
        };
      }

      // Usar zona horaria de Perú
      const fechaHoyPeru = getFechaActualPeru();
      const horaActualPeru = getFechaHoraActualPeru();
      const inicioDiaPeru = getInicioDiaPeru();
      const finDiaPeru = getFinDiaPeru();
      
      // 3. Buscar registro de asistencia existente para hoy
      const asistenciaExistente = await prisma.asistencia_general.findFirst({
        where: {
          estudiante_id: estudiante.id,
          created_at: {
            gte: inicioDiaPeru,
            lte: finDiaPeru
          }
        }
      });
      const { esHorarioEntrada, esHorarioSalida, estado } = this.determinarEstadoAsistencia(
          horaActualPeru, 
          datosQR.turno
        );

      // 4. Si no existe registro y es horario de entrada
      if (!asistenciaExistente && esHorarioEntrada) {
        const nuevaAsistencia = await prisma.asistencia_general.create({
          data: {
            estudiante_id: estudiante.id,
            usuario_portero_id: porteroId,
            fecha: new Date(fechaHoyPeru),
            hora_entrada: getHoraActualPeruParaBD(),
            estado: estado,
            observaciones: `Entrada registrada - ${estado}`,
            created_at: horaActualPeru,
            updated_at: horaActualPeru
          }
        });

        return {
          success: true,
          message: `Entrada registrada: ${estado}`,
          tipo: 'entrada',
          estado: estado as 'Presente' | 'Tarde' | 'Ausente',
          hora: formatearHoraPeru(horaActualPeru),
          estudiante: {
            nombre: estudiante.nombres || 'Sin nombre',
            apellido: estudiante.apellidos || 'Sin apellido',
            grado: datosQR.grado || 'Sin grado',
            seccion: datosQR.seccion || 'Sin sección',
            turno: datosQR.turno || 'Sin turno'
          },
          asistencia: nuevaAsistencia
        };
      }

      // 5. Si existe registro y es horario de salida
      if (asistenciaExistente && esHorarioSalida && !asistenciaExistente.hora_salida) {
        const asistenciaActualizada = await prisma.asistencia_general.update({
          where: {
            id: asistenciaExistente.id
          },
          data: {
            hora_salida: getHoraActualPeruParaBD(),
            observaciones: `${asistenciaExistente.observaciones || ''} - Salida registrada`,
            updated_at: horaActualPeru
          }
        });

        // Enviar notificación al apoderado
        await this.notificarApoderado(estudiante, 'salida', horaActualPeru);

        return {
          success: true,
          message: 'Salida registrada correctamente',
          tipo: 'salida',
          estado: asistenciaExistente.estado as 'Presente' | 'Tarde' | 'Ausente',
          hora: formatearHoraPeru(horaActualPeru),
          estudiante: {
            nombre: estudiante.nombres || 'Sin nombre',
            apellido: estudiante.apellidos || 'Sin apellido',
            grado: datosQR.grado || 'Sin grado',
            seccion: datosQR.seccion || 'Sin sección',
            turno: datosQR.turno || 'Sin turno'
          },
          asistencia: asistenciaActualizada
        };
      }

      // 6. Casos de error
      if (asistenciaExistente && asistenciaExistente.hora_salida) {
        return {
          success: false,
          message: 'Ya se registró entrada y salida para hoy',
          tipo: 'salida',
          estado: asistenciaExistente.estado as 'Presente' | 'Tarde' | 'Ausente',
          hora: formatearHoraPeru(horaActualPeru)
        };
      }

      if (!esHorarioEntrada && !esHorarioSalida) {
        return {
          success: false,
          message: 'Fuera del horario permitido para registro',
          tipo: 'entrada',
          estado: 'Ausente',
          hora: formatearHoraPeru(horaActualPeru)
        };
      }

      return {
        success: false,
        message: 'No se pudo procesar el registro',
        tipo: 'entrada',
        estado: 'Ausente',
        hora: formatearHoraPeru(horaActualPeru)
      };

    } catch (error) {
      console.error('Error al procesar escaneo QR:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        tipo: 'entrada',
        estado: 'Ausente',
        hora: formatearHoraPeru(getFechaHoraActualPeru())
      };
    }
  }

  /**
   * Determina el estado de asistencia según la hora y turno
   */
  private static determinarEstadoAsistencia(hora: Date, turno: string) {
    const horaActual = hora.getHours() * 60 + hora.getMinutes(); // Convertir a minutos
    
    if (turno.toLowerCase() === 'mañana') {
      // Horarios de entrada mañana
      const entrada_inicio = 7 * 60 + 30; // 07:30
      const entrada_fin = 8 * 60; // 08:00
      
      // Horarios de salida mañana
      const salida_inicio = 12 * 60 + 30; // 12:30
      const salida_fin = 12 * 60 + 30; // 12:30 (mismo horario)
      
      if (horaActual >= entrada_inicio && horaActual <= entrada_fin) {
        return {
          esHorarioEntrada: true,
          esHorarioSalida: false,
          estado: 'Presente'
        };
      } else if (horaActual > entrada_fin && horaActual < salida_inicio) {
        return {
          esHorarioEntrada: true,
          esHorarioSalida: false,
          estado: 'Tarde'
        };
      } else if (horaActual >= salida_inicio) {
        return {
          esHorarioEntrada: false,
          esHorarioSalida: true,
          estado: 'Presente'
        };
      }
    } else if (turno.toLowerCase() === 'tarde') {
      // Horarios de entrada tarde
      const entrada_inicio = 12 * 60 + 30; // 12:30
      const entrada_fin = 13 * 60; // 13:00
      
      // Horarios de salida tarde
      const salida_inicio = 17 * 60; // 17:00
      const salida_fin = 20 * 60; // 20:00
      
      if (horaActual >= entrada_inicio && horaActual <= entrada_fin) {
        return {
          esHorarioEntrada: true,
          esHorarioSalida: false,
          estado: 'Presente'
        };
      } else if (horaActual > entrada_fin && horaActual < salida_inicio) {
        return {
          esHorarioEntrada: true,
          esHorarioSalida: false,
          estado: 'Tarde'
        };
      } else if (horaActual >= salida_inicio && horaActual <= salida_fin) {
        return {
          esHorarioEntrada: false,
          esHorarioSalida: true,
          estado: 'Presente'
        };
      }
    }

    return {
      esHorarioEntrada: false,
      esHorarioSalida: false,
      estado: 'Ausente'
    };
  }

  /**
   * Envía notificación al apoderado
   */
  private static async notificarApoderado(estudiante: any, tipo: 'entrada' | 'salida', hora: Date) {
    try {
      // Validar que el estudiante tenga los datos necesarios
      if (!estudiante || !estudiante.apoderados) {
        console.error('Datos de estudiante incompletos para notificación');
        return;
      }

      const nombres = estudiante.nombres || 'Sin nombre';
      const apellidos = estudiante.apellidos || 'Sin apellido';
      
      const mensaje = tipo === 'entrada' 
        ? `Su hijo/a ${nombres} ${apellidos} ha ingresado a la institución a las ${formatearHoraPeru(hora)}`
        : `Su hijo/a ${nombres} ${apellidos} ha salido de la institución a las ${formatearHoraPeru(hora)}`;

      // Verificar que existe el apoderado y su usuario_id
      if (estudiante.apoderados && estudiante.apoderados.usuario_id) {
        const fechaHoraPeru = getFechaHoraActualPeru();
        await prisma.notificaciones.create({
          data: {
            usuario_id: estudiante.apoderados.usuario_id,
            titulo: `${tipo === 'entrada' ? 'Ingreso' : 'Salida'} registrado`,
            mensaje: mensaje,
            tipo: 'Asistencia',
            leido: false,
            fecha_envio: fechaHoraPeru,
            created_at: fechaHoraPeru,
            updated_at: fechaHoraPeru
          }
        });
      }
    } catch (error) {
      console.error('Error al enviar notificación al apoderado:', error);
    }
  }



  /**
   * Obtiene las asistencias del día actual
   */
  static async obtenerAsistenciasHoy(): Promise<AsistenciaFormateada[]> {
    try {
      // Usar zona horaria de Perú
      const fechaHoyPeru = getFechaActualPeru();
      const fechaHoyPeruDate = new Date(fechaHoyPeru);
      const inicioDiaPeru = getInicioDiaPeru();
      const finDiaPeru = getFinDiaPeru();

      console.log('🔍 Obteniendo asistencias para la fecha (Perú):', fechaHoyPeru);
      console.log('🔍 Fecha como Date object:', fechaHoyPeruDate);
      console.log('🔍 Rango de búsqueda:', { inicio: inicioDiaPeru, fin: finDiaPeru });

      const asistencias = await prisma.asistencia_general.findMany({
        where: {
          fecha: {
            gte: inicioDiaPeru,
            lte: finDiaPeru
          }
        },
        include: {
          estudiantes: {
            include: {
              grados: true,
              secciones: true
            }
          },
        },
        orderBy: {
          created_at: 'desc'
        }
      });

      console.log('🔍 Registros encontrados en BD:', asistencias.length);
      
      // Log de los datos crudos de la BD
      asistencias.forEach((asistencia, index) => {
        console.log(`🔍 Registro ${index + 1}:`, {
          id: asistencia.id,
          estudiante_codigo: asistencia.estudiantes?.codigo_estudiante,
          estado_bd: asistencia.estado,
          hora_entrada: asistencia.hora_entrada,
          hora_salida: asistencia.hora_salida,
          created_at: asistencia.created_at
        });
      });

      // Formatear los datos para el frontend
      const asistenciasFormateadas: AsistenciaFormateada[] = [];
      
      asistencias.forEach(asistencia => {
        const estudiante = asistencia.estudiantes;
        const usuario = estudiante;
        const grado = estudiante?.grados;
        const seccion = estudiante?.secciones;

        // Determinar el estado_asistencia basado en los campos de la base de datos
        let estado_asistencia: 'Presente' | 'Tarde' | 'Ausente' | 'Justificado' = 'Presente';
        let es_tardanza = false;

        // Usar el estado de la BD directamente (campo 'estado' contiene: 'Presente', 'Tarde', 'Ausente', 'Justificado')
        console.log('🔍 Dashboard - Asistencia ID:', asistencia.id, 'Estado BD:', asistencia.estado);
        
        if (asistencia.estado === 'Tarde') {
          estado_asistencia = 'Tarde';
          es_tardanza = true;
        } else if (asistencia.estado === 'Ausente') {
          estado_asistencia = 'Ausente';
        } else if (asistencia.estado === 'Justificado') {
          estado_asistencia = 'Justificado';
          console.log('🔍 ✅ Estado Justificado detectado en dashboard para ID:', asistencia.id);
        } else {
          estado_asistencia = 'Presente';
        }
        
        console.log('🔍 Dashboard - Estado procesado:', estado_asistencia, 'para ID:', asistencia.id);

        const estudianteInfo = {
          id: estudiante?.id || 0,
          codigo_estudiante: estudiante?.codigo_estudiante || '',
          nombres: usuario?.nombres || '',
          apellidos: usuario?.apellidos || '',
          grado: grado?.nombre || '',
          seccion: seccion?.nombre || '',
          turno: estudiante?.turno || ''
        };

        // Si tiene hora de entrada, crear registro de entrada
        if (asistencia.hora_entrada) {
          const horaEntradaFormateada = asistencia.hora_entrada.toLocaleTimeString('es-PE', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          });

          asistenciasFormateadas.push({
            id: `${asistencia.id}_entrada`,
            fecha: formatearFechaPeru(asistencia.fecha || asistencia.created_at),
            hora: horaEntradaFormateada,
            estado: 'entrada',
            estado_asistencia,
            es_tardanza,
            estudiante: estudianteInfo
          });
        }

        // Si tiene hora de salida, crear registro de salida
        if (asistencia.hora_salida) {
          const horaSalidaFormateada = asistencia.hora_salida.toLocaleTimeString('es-PE', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          });

          asistenciasFormateadas.push({
            id: `${asistencia.id}_salida`,
            fecha: formatearFechaPeru(asistencia.fecha || asistencia.created_at),
            hora: horaSalidaFormateada,
            estado: 'salida',
            estado_asistencia: 'Presente', // La salida siempre es presente
            es_tardanza: false, // La salida no puede ser tardanza
            estudiante: estudianteInfo
          });
        }

        // Si no tiene ni entrada ni salida (caso raro), crear registro por defecto
        if (!asistencia.hora_entrada && !asistencia.hora_salida) {
          const horaParaMostrar = asistencia.created_at || asistencia.fecha;

          asistenciasFormateadas.push({
            id: asistencia.id,
            fecha: formatearFechaPeru(asistencia.fecha || asistencia.created_at),
            hora: formatearHoraPeru(horaParaMostrar),
            estado: 'entrada',
            estado_asistencia,
            es_tardanza,
            estudiante: estudianteInfo
          });
        }
      });

      return asistenciasFormateadas;
    } catch (error) {
      console.error('Error al obtener asistencias de hoy:', error);
      throw error;
    }
  }

  /**
   * Obtiene el historial de asistencia de un estudiante
   */
  static async obtenerHistorialAsistencia(
    estudianteId: number,
    fechaInicio?: Date,
    fechaFin?: Date
  ): Promise<AsistenciaFormateada[]> {
    try {
      const whereCondition: any = {
        estudiante_id: estudianteId
      };

      // Agregar filtros de fecha si se proporcionan
      if (fechaInicio || fechaFin) {
        whereCondition.fecha = {};
        if (fechaInicio) {
          whereCondition.fecha.gte = fechaInicio;
        }
        if (fechaFin) {
          whereCondition.fecha.lte = fechaFin;
        }
      }

      const asistencias = await prisma.asistencia_general.findMany({
        where: whereCondition,
        include: {
          estudiantes: {
            include: {
              grados: true,
              secciones: true
            }
          }
        },
        orderBy: {
          fecha: 'desc'
        }
      });

      // Formatear los datos para el frontend
      const historialFormateado: AsistenciaFormateada[] = [];
      
      for (const asistencia of asistencias) {
        const estudiante = asistencia.estudiantes;
        const usuario = estudiante;
        const grado = estudiante?.grados;
        const seccion = estudiante?.secciones;

        // Si tiene tanto entrada como salida, crear dos registros separados
        if (asistencia.hora_entrada && asistencia.hora_salida) {
          // Registro de entrada - usar el estado guardado en la BD
          const estadoEntrada = asistencia.estado as 'Presente' | 'Tarde' | 'Ausente' | 'Justificado';
          historialFormateado.push({
            id: `${asistencia.id}_entrada`,
            fecha: asistencia.fecha.toLocaleDateString('es-PE', {
              timeZone: 'America/Lima',
              year: 'numeric',
              month: '2-digit',
              day: '2-digit'
            }).split('/').reverse().join('-'),
            hora: asistencia.hora_entrada.toLocaleTimeString('es-PE', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            }),
            estado: 'entrada',
            estado_asistencia: estadoEntrada,
            es_tardanza: estadoEntrada === 'Tarde',
            estudiante: {
              id: estudiante?.id || 0,
              codigo_estudiante: estudiante?.codigo_estudiante || '',
              nombres: usuario?.nombres || '',
              apellidos: usuario?.apellidos || '',
              grado: grado?.nombre || '',
              seccion: seccion?.nombre || '',
              turno: estudiante?.turno || ''
            }
          });

          // Registro de salida
          historialFormateado.push({
            id: `${asistencia.id}_salida`,
            fecha: asistencia.fecha.toLocaleDateString('es-PE', {
              timeZone: 'America/Lima',
              year: 'numeric',
              month: '2-digit',
              day: '2-digit'
            }).split('/').reverse().join('-'),
            hora: asistencia.hora_salida.toLocaleTimeString('es-PE', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            }),
            estado: 'salida',
            estado_asistencia: 'Presente', // Las salidas siempre son "Presente"
            es_tardanza: false,
            estudiante: {
              id: estudiante?.id || 0,
              codigo_estudiante: estudiante?.codigo_estudiante || '',
              nombres: usuario?.nombres || '',
              apellidos: usuario?.apellidos || '',
              grado: grado?.nombre || '',
              seccion: seccion?.nombre || '',
              turno: estudiante?.turno || ''
            }
          });
        } else {
          // Solo tiene entrada o solo salida, crear un registro
          const tieneEntrada = !!asistencia.hora_entrada;
          const hora = tieneEntrada ? asistencia.hora_entrada! : asistencia.hora_salida!;
          const estado = tieneEntrada ? 'entrada' : 'salida';
          
          // Usar el estado guardado en la BD en lugar de recalcularlo
          const estadoAsistencia = asistencia.estado as 'Presente' | 'Tarde' | 'Ausente' | 'Justificado';

          historialFormateado.push({
            id: asistencia.id,
            fecha: asistencia.fecha.toLocaleDateString('es-PE', {
              timeZone: 'America/Lima',
              year: 'numeric',
              month: '2-digit',
              day: '2-digit'
            }).split('/').reverse().join('-'),
            hora: hora.toLocaleTimeString('es-PE', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            }),
            estado,
            estado_asistencia: estadoAsistencia,
            es_tardanza: estadoAsistencia === 'Tarde',
            estudiante: {
              id: estudiante?.id || 0,
              codigo_estudiante: estudiante?.codigo_estudiante || '',
              nombres: usuario?.nombres || '',
              apellidos: usuario?.apellidos || '',
              grado: grado?.nombre || '',
              seccion: seccion?.nombre || '',
              turno: estudiante?.turno || ''
            }
          });
        }
      }

      return historialFormateado;
    } catch (error) {
      console.error('Error al obtener historial de asistencia:', error);
      throw error;
    }
  }

  /**
   * Obtiene el historial completo de asistencia de un estudiante incluyendo días sin registro como "Ausente"
   */
  static async obtenerHistorialCompletoAsistencia(
    estudianteId: number,
    fechaInicio?: Date,
    fechaFin?: Date
  ): Promise<AsistenciaFormateada[]> {
    try {
      // Obtener datos del estudiante
      const estudiante = await prisma.estudiantes.findUnique({
        where: { id: estudianteId },
        include: {
          grados: true,
          secciones: true
        }
      });

      if (!estudiante) {
        throw new Error('Estudiante no encontrado');
      }

      // Si no se proporcionan fechas, usar los últimos 30 días
      const fechaFin_real = fechaFin || new Date();
      const fechaInicio_real = fechaInicio || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      // Obtener SOLO las asistencias que realmente existen en la base de datos
      const asistenciasExistentes = await prisma.asistencia_general.findMany({
        where: {
          estudiante_id: estudianteId,
          fecha: {
            gte: fechaInicio_real,
            lte: fechaFin_real
          }
        },
        orderBy: {
          fecha: 'desc'
        }
      });

      // Formatear SOLO los registros que existen en la base de datos
      const historialCompleto: AsistenciaFormateada[] = [];
      
      asistenciasExistentes.forEach(asistencia => {
        console.log('🔍 Historial - Fecha original en BD:', asistencia.fecha);
        
        // Usar las funciones de zona horaria ya importadas
        const fechaStr = formatearFechaPeru(asistencia.fecha, 'YYYY-MM-DD');
        
        console.log('🔍 Historial - Fecha formateada con moment:', fechaStr);

        if (asistencia.hora_entrada && asistencia.hora_salida) {
          // Registro de entrada
          const estadoEntrada = asistencia.estado as 'Presente' | 'Tarde' | 'Ausente' | 'Justificado';
          historialCompleto.push({
            id: `${asistencia.id}_entrada`,
            fecha: fechaStr,
            hora: asistencia.hora_entrada ? asistencia.hora_entrada.toLocaleTimeString('es-PE', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            }) : '--:--',
            estado: 'entrada',
            estado_asistencia: estadoEntrada,
            es_tardanza: estadoEntrada === 'Tarde',
            estudiante: {
              id: estudiante.id,
              codigo_estudiante: estudiante.codigo_estudiante || '',
              nombres: estudiante.nombres || '',
              apellidos: estudiante.apellidos || '',
              grado: estudiante.grados?.nombre || '',
              seccion: estudiante.secciones?.nombre || '',
              turno: estudiante.turno || ''
            }
          });

          // Registro de salida
          historialCompleto.push({
            id: `${asistencia.id}_salida`,
            fecha: fechaStr,
            hora: asistencia.hora_salida ? asistencia.hora_salida.toLocaleTimeString('es-PE', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            }) : '--:--',
            estado: 'salida',
            estado_asistencia: 'Presente',
            es_tardanza: false,
            estudiante: {
              id: estudiante.id,
              codigo_estudiante: estudiante.codigo_estudiante || '',
              nombres: estudiante.nombres || '',
              apellidos: estudiante.apellidos || '',
              grado: estudiante.grados?.nombre || '',
              seccion: estudiante.secciones?.nombre || '',
              turno: estudiante.turno || ''
            }
          });
        } else {
          // Solo entrada o solo salida
          const tieneEntrada = !!asistencia.hora_entrada;
          const hora = tieneEntrada ? asistencia.hora_entrada! : asistencia.hora_salida!;
          const estado = tieneEntrada ? 'entrada' : 'salida';
          const estadoAsistencia = asistencia.estado as 'Presente' | 'Tarde' | 'Ausente' | 'Justificado';

          // Para registros justificados, usar la hora de creación si no hay hora específica
          let horaMostrar = '--:--';
          if (hora) {
            horaMostrar = hora.toLocaleTimeString('es-PE', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            });
          } else if (estadoAsistencia === 'Justificado' && asistencia.created_at) {
            // Para justificados, usar la hora de creación del registro
            console.log('🔍 Historial - Registro Justificado ID:', asistencia.id, 'created_at:', asistencia.created_at);
            horaMostrar = asistencia.created_at.toLocaleTimeString('es-PE', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            });
            console.log('🔍 Historial - Hora calculada para Justificado:', horaMostrar);
          }

          historialCompleto.push({
            id: asistencia.id,
            fecha: fechaStr,
            hora: horaMostrar,
            estado,
            estado_asistencia: estadoAsistencia,
            es_tardanza: estadoAsistencia === 'Tarde',
            estudiante: {
              id: estudiante.id,
              codigo_estudiante: estudiante.codigo_estudiante || '',
              nombres: estudiante.nombres || '',
              apellidos: estudiante.apellidos || '',
              grado: estudiante.grados?.nombre || '',
              seccion: estudiante.secciones?.nombre || '',
              turno: estudiante.turno || ''
            }
          });
        }
      });

      // Ordenar por fecha descendente
      historialCompleto.sort((a, b) => {
        const fechaA = new Date(a.fecha);
        const fechaB = new Date(b.fecha);
        return fechaB.getTime() - fechaA.getTime();
      });

      return historialCompleto;
    } catch (error) {
      console.error('Error al obtener historial completo de asistencia:', error);
      throw error;
    }
  }

  /**
   * Obtiene las asistencias de una fecha específica
   */
  static async obtenerAsistenciasPorFecha(fecha: string): Promise<AsistenciaFormateada[]> {
    try {
      // Convertir la fecha string a Date object
      const fechaConsulta = new Date(fecha);
      
      console.log('🔍 Obteniendo asistencias para la fecha:', fecha);
      console.log('🔍 Fecha como Date object:', fechaConsulta);

      // Crear rango de fechas para evitar problemas de zona horaria
      const inicioDia = new Date(fechaConsulta);
      inicioDia.setHours(0, 0, 0, 0);
      
      const finDia = new Date(fechaConsulta);
      finDia.setHours(23, 59, 59, 999);

      console.log('🔍 Rango de búsqueda:', { inicioDia, finDia });

      const asistencias = await prisma.asistencia_general.findMany({
        where: {
          fecha: {
            gte: inicioDia,
            lte: finDia
          }
        },
        include: {
          estudiantes: {
            include: {
              grados: true,
              secciones: true
            }
          },
        },
        orderBy: {
          created_at: 'desc'
        }
      });

      console.log('🔍 Registros encontrados en BD para fecha', fecha, ':', asistencias.length);
      console.log('🔍 Estados de los registros:', asistencias.map(a => ({ id: a.id, estado: a.estado })));
      
      // Formatear los datos para el frontend (usando la misma lógica que obtenerAsistenciasHoy)
      const asistenciasFormateadas: AsistenciaFormateada[] = [];
      
      for (const asistencia of asistencias) {
        const estudiante = asistencia.estudiantes;
        const usuario = estudiante;
        const grado = estudiante?.grados;
        const seccion = estudiante?.secciones;

        // Determinar el estado_asistencia basado en los campos de la base de datos
        let estado_asistencia: 'Presente' | 'Tarde' | 'Ausente' | 'Justificado' = 'Presente';
        let es_tardanza = false;

        // Usar el estado de la BD directamente (campo 'estado' contiene: 'Presente', 'Tarde', 'Ausente', 'Justificado')
        console.log('🔍 Historial Completo - Asistencia ID:', asistencia.id, 'Estado BD:', asistencia.estado);
        
        if (asistencia.estado === 'Tarde') {
          estado_asistencia = 'Tarde';
          es_tardanza = true;
        } else if (asistencia.estado === 'Ausente') {
          estado_asistencia = 'Ausente';
        } else if (asistencia.estado === 'Justificado') {
          estado_asistencia = 'Justificado';
          console.log('🔍 ✅ Estado Justificado detectado en historial completo para ID:', asistencia.id);
        } else {
          estado_asistencia = 'Presente';
        }
        
        console.log('🔍 Historial Completo - Estado procesado:', estado_asistencia, 'para ID:', asistencia.id);

        const estudianteInfo = {
          id: estudiante?.id || 0,
          codigo_estudiante: estudiante?.codigo_estudiante || '',
          nombres: usuario?.nombres || '',
          apellidos: usuario?.apellidos || '',
          grado: grado?.nombre || '',
          seccion: seccion?.nombre || '',
          turno: estudiante?.turno || ''
        };

        // Si tiene tanto entrada como salida, crear dos registros separados
        if (asistencia.hora_entrada && asistencia.hora_salida) {
          // Registro de entrada
          asistenciasFormateadas.push({
            id: `${asistencia.id}_entrada`,
            fecha: asistencia.fecha.toLocaleDateString('es-PE', {
              timeZone: 'America/Lima',
              year: 'numeric',
              month: '2-digit',
              day: '2-digit'
            }).split('/').reverse().join('-'),
            hora: asistencia.hora_entrada.toLocaleTimeString('es-PE', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            }),
            estado: 'entrada',
            estado_asistencia,
            es_tardanza,
            estudiante: estudianteInfo
          });

          // Registro de salida
          asistenciasFormateadas.push({
            id: `${asistencia.id}_salida`,
            fecha: asistencia.fecha.toLocaleDateString('es-PE', {
              timeZone: 'America/Lima',
              year: 'numeric',
              month: '2-digit',
              day: '2-digit'
            }).split('/').reverse().join('-'),
            hora: asistencia.hora_salida.toLocaleTimeString('es-PE', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            }),
            estado: 'salida',
            estado_asistencia: 'Presente', // La salida siempre es presente
            es_tardanza: false, // La salida no puede ser tardanza
            estudiante: estudianteInfo
          });
        } else {
          // Solo tiene entrada o solo salida, crear un registro
          const tieneEntrada = !!asistencia.hora_entrada;
          const hora = tieneEntrada ? asistencia.hora_entrada! : asistencia.hora_salida!;
          const estado = tieneEntrada ? 'entrada' : 'salida';

          asistenciasFormateadas.push({
            id: asistencia.id,
            fecha: asistencia.fecha.toLocaleDateString('es-PE', {
              timeZone: 'America/Lima',
              year: 'numeric',
              month: '2-digit',
              day: '2-digit'
            }).split('/').reverse().join('-'),
            hora: hora.toLocaleTimeString('es-PE', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            }),
            estado,
            estado_asistencia,
            es_tardanza,
            estudiante: estudianteInfo
          });
        }
      }

      console.log('🔍 Asistencias formateadas para fecha', fecha, ':', asistenciasFormateadas.length);
      return asistenciasFormateadas;
    } catch (error) {
      console.error('Error al obtener asistencias por fecha:', error);
      throw error;
    }
  }

  /**
   * Marca automáticamente como "falta" a los estudiantes que no registraron asistencia durante el día
   * Se ejecuta a las 8 PM para marcar ausencias del día actual
   */
  static async marcarAusenciasAutomaticas(): Promise<{ estudiantesProcesados: number; ausenciasMarcadas: number; estudiantesConAsistencia: number; mensaje: string }> {
    try {
      console.log('🔄 Iniciando marcado automático de ausencias...');
      
      // Obtener la fecha actual en Perú
      const fechaActualPeru = getFechaActualPeru();
      const fechaActualPeruDate = new Date(fechaActualPeru);
      
      console.log('📅 Marcando ausencias para la fecha:', fechaActualPeru);

      // Obtener todos los estudiantes activos
      const todosLosEstudiantes = await prisma.estudiantes.findMany({
        where: {
          estado: 'Activo'
        },
        include: {
          grados: {
            select: {
              nombre: true
            }
          },
          secciones: {
            select: {
              nombre: true
            }
          }
        }
      });

      console.log(`👥 Total de estudiantes activos: ${todosLosEstudiantes.length}`);

      // Obtener estudiantes que ya tienen registro de asistencia hoy
      const estudiantesConAsistencia = await prisma.asistencia_general.findMany({
        where: {
          fecha: fechaActualPeruDate
        },
        select: {
          estudiante_id: true
        }
      });

      const idsConAsistencia = new Set(estudiantesConAsistencia.map(a => a.estudiante_id));
      console.log(`✅ Estudiantes con registro de asistencia hoy: ${idsConAsistencia.size}`);

      // Filtrar estudiantes sin registro de asistencia
      const estudiantesSinAsistencia = todosLosEstudiantes.filter(
        estudiante => !idsConAsistencia.has(estudiante.id)
      );

      console.log(`❌ Estudiantes sin registro de asistencia: ${estudiantesSinAsistencia.length}`);

      if (estudiantesSinAsistencia.length === 0) {
        return {
          estudiantesProcesados: todosLosEstudiantes.length,
          ausenciasMarcadas: 0,
          estudiantesConAsistencia: todosLosEstudiantes.length,
          mensaje: 'No hay estudiantes sin registro de asistencia para marcar como ausentes'
        };
      }

      // Crear registros de ausencia para estudiantes sin asistencia
      const horaActualPeru = getFechaHoraActualPeru();
      const registrosAusencia = estudiantesSinAsistencia.map(estudiante => ({
        estudiante_id: estudiante.id,
        usuario_portero_id: 1, // ID del sistema automático
        fecha: fechaActualPeruDate,
        hora_entrada: null,
        hora_salida: null,
        estado: 'Ausente' as const,
        observaciones: 'Ausencia marcada automáticamente por el sistema a las 8:00 PM',
        created_at: horaActualPeru,
        updated_at: horaActualPeru
      }));

      // Insertar todos los registros de ausencia en una sola operación
      await prisma.asistencia_general.createMany({
        data: registrosAusencia
      });

      console.log(`✅ Se marcaron ${estudiantesSinAsistencia.length} estudiantes como ausentes automáticamente`);

      // Log de estudiantes marcados como ausentes
      estudiantesSinAsistencia.forEach(estudiante => {
        console.log(`   - ${estudiante.nombres} ${estudiante.apellidos} (${estudiante.codigo_estudiante}) - ${estudiante.grados?.nombre} ${estudiante.secciones?.nombre}`);
      });

      return {
        estudiantesProcesados: todosLosEstudiantes.length,
        ausenciasMarcadas: estudiantesSinAsistencia.length,
        estudiantesConAsistencia: todosLosEstudiantes.length - estudiantesSinAsistencia.length,
        mensaje: `Se marcaron ${estudiantesSinAsistencia.length} estudiantes como ausentes automáticamente`
      };

    } catch (error) {
      console.error('❌ Error al marcar ausencias automáticas:', error);
      throw error;
    }
  }
}