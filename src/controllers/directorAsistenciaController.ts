import { Context } from 'hono';
import { PrismaClient } from '../../generated/prisma';
import * as XLSX from 'xlsx';
import { DirectorReporte } from './directorReporte.js';

const prisma = new PrismaClient();

export class DirectorAsistenciaController {
  // Obtener asistencias generales (del portero) con lógica de ausentes automáticos
  static async obtenerAsistenciasGenerales(c: Context) {
    try {
      const fecha = c.req.query('fecha');
      const estado = c.req.query('estado'); // 'Presente', 'Tarde', 'Ausente', 'Justificado'
      const turno = c.req.query('turno'); // 'Mañana', 'Tarde'
      const busqueda = c.req.query('busqueda'); // Búsqueda por nombre
      const user = c.get('user');
      
      console.log('🔍 DirectorAsistencia: Usuario autenticado:', user);
      console.log('🔍 DirectorAsistencia: Filtros solicitados:', { fecha, estado, turno, busqueda });
      
      if (!fecha) {
        console.log('❌ DirectorAsistencia: Fecha no proporcionada');
        return c.json({ 
          success: false, 
          message: 'La fecha es requerida' 
        }, 400);
      }

      console.log('🔍 DirectorAsistencia: Obteniendo asistencias generales para fecha:', fecha);

      // Validar formato de fecha
      const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!fechaRegex.test(fecha)) {
        return c.json({ 
          success: false, 
          message: 'Formato de fecha inválido. Use YYYY-MM-DD' 
        }, 400);
      }

      // Crear rango de fechas para el día completo
      const fechaInicio = new Date(fecha + 'T00:00:00.000Z');
      const fechaFin = new Date(fecha + 'T23:59:59.999Z');

      console.log('🔍 DirectorAsistencia: Rango de fechas:', {
        inicio: fechaInicio,
        fin: fechaFin
      });

      // Obtener asistencias generales (del portero)
      const asistenciasGenerales = await prisma.asistencia_general.findMany({
        where: {
          fecha: {
            gte: fechaInicio,
            lte: fechaFin
          }
        },
        include: {
          estudiantes: {
            include: {
              grados: {
                select: {
                  id: true,
                  nombre: true
                }
              },
              secciones: {
                select: {
                  nombre: true
                }
              }
            }
          },
          usuarios: {
            select: {
              nombres: true,
              apellidos: true
            }
          }
        },
        orderBy: {
          created_at: 'desc'
        }
      });

      console.log('🔍 DirectorAsistencia: Asistencias generales encontradas:', asistenciasGenerales.length);
      
      // Obtener todos los estudiantes activos para calcular ausentes automáticos
      const whereEstudiantes: any = {
        estado: 'activo'
      };

      // Aplicar filtro de turno si se especifica
      if (turno) {
        const gradosPorTurno = turno === 'Mañana' ? [1, 3, 6] : [2, 4, 5];
        whereEstudiantes.grado_id = { in: gradosPorTurno };
      }

      // Aplicar filtro de búsqueda si se especifica
      if (busqueda) {
        console.log('🔍 DirectorAsistencia: Aplicando filtro de búsqueda:', busqueda);
        whereEstudiantes.OR = [
          { nombres: { contains: busqueda, mode: 'insensitive' } },
          { apellidos: { contains: busqueda, mode: 'insensitive' } }
        ];
        console.log('🔍 DirectorAsistencia: whereEstudiantes con búsqueda:', JSON.stringify(whereEstudiantes, null, 2));
      }

      const todosEstudiantes = await prisma.estudiantes.findMany({
        where: whereEstudiantes,
        include: {
          grados: {
            select: {
              nombre: true,
              id: true
            }
          },
          secciones: {
            select: {
              nombre: true
            }
          }
        }
      });

      console.log('🔍 DirectorAsistencia: Estudiantes encontrados con filtro:', todosEstudiantes.length);
      if (busqueda) {
        console.log('🔍 DirectorAsistencia: Estudiantes que coinciden con búsqueda:');
        todosEstudiantes.forEach((estudiante, index) => {
          console.log(`${index + 1}. ${estudiante.nombres} ${estudiante.apellidos}`);
        });
      }

      // Verificar horarios para ausentes automáticos por turno
      const ahora = new Date();
      const horaActual = ahora.getHours();
      const esDiaHabil = ahora.getDay() >= 1 && ahora.getDay() <= 5; // Lunes a Viernes
      
      // Horarios para ausentes automáticos
      const esDespuesDe2PM = horaActual >= 14; // 2 PM para turno Mañana
      const esDespuesDe8PM = horaActual >= 20; // 8 PM para turno Tarde

      console.log('🔍 DirectorAsistencia: Hora actual:', horaActual, 'Es día hábil:', esDiaHabil);
      console.log('🔍 DirectorAsistencia: Después de 2 PM:', esDespuesDe2PM, 'Después de 8 PM:', esDespuesDe8PM);

      // Crear mapa de estudiantes que ya tienen asistencia registrada
      const estudiantesConAsistencia = new Set();
      asistenciasGenerales.forEach(asistencia => {
        estudiantesConAsistencia.add(asistencia.estudiante_id);
      });

      console.log('🔍 DirectorAsistencia: Estudiantes con asistencia registrada:', estudiantesConAsistencia.size);

      // Aplicar ausentes automáticos por turno si es día hábil
      if (esDiaHabil) {
        console.log('🔍 DirectorAsistencia: Aplicando lógica de ausentes automáticos por turno');
        
        for (const estudiante of todosEstudiantes) {
          if (!estudiantesConAsistencia.has(estudiante.id)) {
            // Determinar turno del estudiante por grado
            const gradoId = estudiante.grados?.id;
            const esTurnoManana = [1, 3, 6].includes(gradoId);
            const esTurnoTarde = [2, 4, 5].includes(gradoId);
            
            // Aplicar ausentes automáticos según turno y horario
            const debeSerAusente = (esTurnoManana && esDespuesDe2PM) || (esTurnoTarde && esDespuesDe8PM);
            
            if (debeSerAusente) {
              const turnoEstudiante = esTurnoManana ? 'Mañana' : 'Tarde';
              const horarioLimite = esTurnoManana ? '2:00 PM' : '8:00 PM';
              
              // Crear registro de ausente automático
              const ausenteAutomatico = {
                id: `ausente_${estudiante.id}`,
                estudiante_id: estudiante.id,
                fecha: fechaInicio,
                estado: 'Ausente',
                hora_entrada: null,
                hora_salida: null,
                observaciones: `Ausente automático - Turno ${turnoEstudiante} (después de ${horarioLimite})`,
                created_at: new Date(),
                estudiantes: {
                  id: estudiante.id,
                  codigo_estudiante: estudiante.codigo_estudiante,
                  turno: estudiante.turno,
                  estado: estudiante.estado,
                  nombres: estudiante.nombres,
                  apellidos: estudiante.apellidos,
                  dni: estudiante.dni,
                  grados: estudiante.grados,
                  secciones: estudiante.secciones
                },
                usuarios: {
                  nombres: 'Sistema',
                  apellidos: 'Automático'
                }
              };
              
              asistenciasGenerales.push(ausenteAutomatico as any);
            }
          }
        }
      }

      // Formatear datos para el frontend
      let asistenciasFormateadas = asistenciasGenerales.map(asistencia => ({
        id: asistencia.id,
        estudiante: {
          id: asistencia.estudiantes?.id,
          codigo: asistencia.estudiantes?.codigo_estudiante,
          nombres: asistencia.estudiantes?.nombres,
          apellidos: asistencia.estudiantes?.apellidos,
          dni: asistencia.estudiantes?.dni,
          grado: asistencia.estudiantes?.grados?.nombre,
          seccion: asistencia.estudiantes?.secciones?.nombre,
          turno: asistencia.estudiantes?.turno,
          gradoId: asistencia.estudiantes?.grados?.id
        },
        portero: {
          nombres: asistencia.usuarios?.nombres,
          apellidos: asistencia.usuarios?.apellidos
        },
        estado: asistencia.estado,
        fecha: asistencia.fecha.toISOString().split('T')[0],
        hora_entrada: asistencia.hora_entrada,
        hora_salida: asistencia.hora_salida,
        hora: asistencia.created_at?.toLocaleTimeString('es-PE', {
          timeZone: 'America/Lima',
          hour: '2-digit',
          minute: '2-digit'
        }),
        observaciones: asistencia.observaciones
      }));

      // Aplicar filtro por estado si se especifica
      if (estado && estado !== 'Todos') {
        if (estado === 'Salida') {
          // Para "Salida", filtrar por registros que tienen hora_salida
          asistenciasFormateadas = asistenciasFormateadas.filter(asistencia => 
            asistencia.hora_salida !== null
          );
        } else {
          // Para otros estados, usar el estado normal
          asistenciasFormateadas = asistenciasFormateadas.filter(asistencia => 
            asistencia.estado === estado
          );
        }
      }

      // Aplicar filtro por turno si se especifica (filtro adicional en frontend)
      if (turno && turno !== 'Todos') {
        const gradosPorTurno = turno === 'Mañana' ? [1, 3, 6] : [2, 4, 5];
        asistenciasFormateadas = asistenciasFormateadas.filter(asistencia => 
          gradosPorTurno.includes(asistencia.estudiante.gradoId)
        );
      }

      console.log('🔍 DirectorAsistencia: Total asistencias formateadas:', asistenciasFormateadas.length);

      return c.json({
        success: true,
        data: {
          fecha: fecha,
          asistencias: asistenciasFormateadas
        }
      });

    } catch (error) {
      console.error('❌ Error al obtener asistencias generales:', error);
      return c.json({ 
        success: false, 
        message: 'Error interno del servidor' 
      }, 500);
    }
  }

  // Obtener todas las asistencias de una fecha específica
  static async obtenerAsistenciasPorFecha(c: Context) {
    try {
      const fecha = c.req.query('fecha');
      const gradoId = c.req.query('grado_id');
      const seccionId = c.req.query('seccion_id');
      const profesorId = c.req.query('profesor_id');
      const user = c.get('user');
      
      console.log('🔍 DirectorAsistencia: Usuario autenticado:', user);
      console.log('🔍 DirectorAsistencia: Filtros solicitados:', { fecha, gradoId, seccionId, profesorId });
      
      if (!fecha) {
        console.log('❌ DirectorAsistencia: Fecha no proporcionada');
        return c.json({ 
          success: false, 
          message: 'La fecha es requerida' 
        }, 400);
      }

      console.log('🔍 DirectorAsistencia: Obteniendo asistencias para fecha:', fecha);

      // Validar formato de fecha
      const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!fechaRegex.test(fecha)) {
        return c.json({ 
          success: false, 
          message: 'Formato de fecha inválido. Use YYYY-MM-DD' 
        }, 400);
      }

      // Crear rango de fechas para el día completo
      const fechaInicio = new Date(fecha + 'T00:00:00.000Z');
      const fechaFin = new Date(fecha + 'T23:59:59.999Z');

      console.log('🔍 DirectorAsistencia: Rango de fechas:', {
        inicio: fechaInicio,
        fin: fechaFin
      });

      // Construir filtros dinámicos
      const whereClause: any = {
        fecha: {
          gte: fechaInicio,
          lte: fechaFin
        }
      };

      // Agregar filtros si se proporcionan
      if (gradoId) {
        whereClause.estudiantes = {
          ...whereClause.estudiantes,
          grado_id: parseInt(gradoId)
        };
      }

      if (seccionId) {
        whereClause.estudiantes = {
          ...whereClause.estudiantes,
          seccion_id: parseInt(seccionId)
        };
      }

      if (profesorId) {
        whereClause.profesor_id = parseInt(profesorId);
      }

      console.log('🔍 DirectorAsistencia: Filtros aplicados:', whereClause);
      console.log('🔍 DirectorAsistencia: Profesor ID recibido:', profesorId);
      console.log('🔍 DirectorAsistencia: Profesor ID parseado:', profesorId ? parseInt(profesorId) : 'null');

      // Obtener asistencias de salón con datos del estudiante y profesor
      const asistencias = await prisma.asistencia_salon.findMany({
        where: whereClause,
        include: {
          estudiantes: {
            select: {
              id: true,
              codigo_estudiante: true,
              turno: true,
              estado: true,
              nombres: true,
              apellidos: true,
              dni: true,
              grados: {
                select: {
                  id: true,
                  nombre: true
                }
              },
              secciones: {
                select: {
                  id: true,
                  nombre: true
                }
              }
            }
          },
          profesores: {
            select: {
              id: true,
              tipo_profesor: true,
              usuarios: {
                select: {
                  id: true,
                  nombres: true,
                  apellidos: true
                }
              }
            }
          }
        },
        orderBy: [
          { created_at: 'asc' }
        ]
      });

      console.log('🔍 DirectorAsistencia: Asistencias encontradas:', asistencias.length);
      
      if (asistencias.length > 0) {
        console.log('🔍 DirectorAsistencia: Primera asistencia:', {
          id: asistencias[0].id,
          estudiante: asistencias[0].estudiantes?.nombres,
          estado: asistencias[0].estado
        });
      }

      // Formatear datos para la respuesta
      const asistenciasFormateadas = asistencias.map(asistencia => ({
        id: asistencia.id,
        estudiante: {
          id: asistencia.estudiantes.id,
          nombre: `${asistencia.estudiantes.nombres} ${asistencia.estudiantes.apellidos}`,
          grado: asistencia.estudiantes.grados.nombre,
          seccion: asistencia.estudiantes.secciones.nombre,
          dni: asistencia.estudiantes.dni,
          codigo: asistencia.estudiantes.codigo_estudiante
        },
        estado: asistencia.estado,
        observaciones: asistencia.observaciones,
        fecha: asistencia.fecha,
        profesor: asistencia.profesores ? {
          id: asistencia.profesores.id,
          nombre: `${asistencia.profesores.usuarios.nombres} ${asistencia.profesores.usuarios.apellidos}`,
          tipo_profesor: asistencia.profesores.tipo_profesor
        } : null,
        created_at: asistencia.created_at,
        updated_at: asistencia.updated_at
      }));

      console.log('🔍 DirectorAsistencia: Asistencias formateadas:', asistenciasFormateadas.length);
      console.log('🔍 DirectorAsistencia: Primera asistencia formateada:', asistenciasFormateadas[0] || 'No hay asistencias');

      return c.json({
        success: true,
        data: {
          fecha: fecha,
          total: asistenciasFormateadas.length,
          asistencias: asistenciasFormateadas
        }
      });

    } catch (error) {
      console.error('❌ Error al obtener asistencias por fecha:', error);
      return c.json({ 
        success: false, 
        message: 'Error interno del servidor' 
      }, 500);
    }
  }

  // Justificar una asistencia
  static async justificarAsistencia(c: Context) {
    try {
      const asistenciaId = c.req.param('id');
      const { observaciones } = await c.req.json();

      if (!asistenciaId) {
        return c.json({ 
          success: false, 
          message: 'ID de asistencia requerido' 
        }, 400);
      }

      console.log('🔍 DirectorAsistencia: Justificando asistencia ID:', asistenciaId);

      // Verificar que la asistencia existe
      const asistenciaExistente = await prisma.asistencia_general.findUnique({
        where: { id: parseInt(asistenciaId) },
        include: {
          estudiantes: {
            select: {
              id: true,
              codigo_estudiante: true,
              nombres: true,
              apellidos: true
            }
          }
        }
      });

      if (!asistenciaExistente) {
        return c.json({ 
          success: false, 
          message: 'Asistencia no encontrada' 
        }, 404);
      }

      console.log('🔍 DirectorAsistencia: Asistencia encontrada:', {
        id: asistenciaExistente.id,
        estudiante: `${asistenciaExistente.estudiantes.nombres} ${asistenciaExistente.estudiantes.apellidos}`,
        estado_actual: asistenciaExistente.estado
      });

      // Actualizar la asistencia a "Justificado"
      const asistenciaActualizada = await prisma.asistencia_general.update({
        where: { id: parseInt(asistenciaId) },
        data: {
          estado: 'Justificado',
          observaciones: observaciones ? 
            `${asistenciaExistente.observaciones || ''} - Justificado por Director: ${observaciones}`.trim() :
            `${asistenciaExistente.observaciones || ''} - Justificado por Director`.trim(),
          updated_at: new Date()
        },
        include: {
          estudiantes: {
            select: {
              id: true,
              codigo_estudiante: true,
              nombres: true,
              apellidos: true,
              grados: {
                select: {
                  id: true,
                  nombre: true
                }
              },
              secciones: {
                select: {
                  nombre: true
                }
              }
            }
          }
        }
      });

      console.log('✅ DirectorAsistencia: Asistencia justificada exitosamente');

      return c.json({
        success: true,
        message: 'Asistencia justificada correctamente',
        data: {
          id: asistenciaActualizada.id,
          estudiante: `${asistenciaActualizada.estudiantes.nombres} ${asistenciaActualizada.estudiantes.apellidos}`,
          estado: asistenciaActualizada.estado,
          observaciones: asistenciaActualizada.observaciones,
          updated_at: asistenciaActualizada.updated_at
        }
      });

    } catch (error) {
      console.error('❌ Error al justificar asistencia:', error);
      return c.json({ 
        success: false, 
        message: 'Error interno del servidor' 
      }, 500);
    }
  }

  // Obtener estadísticas de asistencias por fecha
  static async obtenerEstadisticasAsistencias(c: Context) {
    try {
      const fecha = c.req.query('fecha');
      
      if (!fecha) {
        return c.json({ 
          success: false, 
          message: 'La fecha es requerida' 
        }, 400);
      }

      console.log('🔍 DirectorAsistencia: Obteniendo estadísticas para fecha:', fecha);

      // Crear rango de fechas para el día completo
      const fechaInicio = new Date(fecha + 'T00:00:00.000Z');
      const fechaFin = new Date(fecha + 'T23:59:59.999Z');

      // Obtener todas las asistencias del día
      const asistencias = await prisma.asistencia_general.findMany({
        where: {
          fecha: {
            gte: fechaInicio,
            lte: fechaFin
          }
        }
      });

      // Calcular estadísticas
      const estadisticas = {
        total: asistencias.length,
        presentes: asistencias.filter(a => a.estado === 'Presente').length,
        tardes: asistencias.filter(a => a.estado === 'Tarde').length,
        ausentes: asistencias.filter(a => a.estado === 'Ausente').length,
        justificados: asistencias.filter(a => a.estado === 'Justificado').length,
        salidas: asistencias.filter(a => a.hora_salida !== null).length // Contar por hora_salida, no por estado
      };

      console.log('🔍 DirectorAsistencia: Estadísticas calculadas:', estadisticas);

      return c.json({
        success: true,
        data: {
          fecha: fecha,
          estadisticas: estadisticas
        }
      });

    } catch (error) {
      console.error('❌ Error al obtener estadísticas:', error);
      return c.json({ 
        success: false, 
        message: 'Error interno del servidor' 
      }, 500);
    }
  }

  // Obtener profesores que registraron asistencia en una fecha específica
  static async obtenerProfesoresConAsistencia(c: Context) {
    try {
      const fecha = c.req.query('fecha');
      const gradoId = c.req.query('grado_id');
      const seccionId = c.req.query('seccion_id');
      const user = c.get('user');
      
      console.log('🔍 DirectorAsistencia: Obteniendo profesores con asistencia:', { fecha, gradoId, seccionId });
      
      if (!fecha) {
        return c.json({ 
          success: false, 
          message: 'La fecha es requerida' 
        }, 400);
      }

      // Crear rango de fechas para el día completo
      const fechaInicio = new Date(fecha + 'T00:00:00.000Z');
      const fechaFin = new Date(fecha + 'T23:59:59.999Z');

      // Construir filtros dinámicos
      const whereClause: any = {
        fecha: {
          gte: fechaInicio,
          lte: fechaFin
        }
      };

      // Agregar filtros si se proporcionan
      if (gradoId) {
        whereClause.estudiantes = {
          ...whereClause.estudiantes,
          grado_id: parseInt(gradoId)
        };
      }

      if (seccionId) {
        whereClause.estudiantes = {
          ...whereClause.estudiantes,
          seccion_id: parseInt(seccionId)
        };
      }

      // Obtener profesores únicos que registraron asistencia
      const profesoresConAsistencia = await prisma.asistencia_salon.findMany({
        where: whereClause,
        select: {
          profesores: {
            select: {
              id: true,
              tipo_profesor: true,
              usuarios: {
                select: {
                  id: true,
                  nombres: true,
                  apellidos: true
                }
              }
            }
          }
        },
        distinct: ['profesor_id']
      });

      // Formatear datos
      const profesoresFormateados = profesoresConAsistencia.map(item => ({
        id: item.profesores.id,
        nombre: `${item.profesores.usuarios.nombres} ${item.profesores.usuarios.apellidos}`,
        tipo_profesor: item.profesores.tipo_profesor
      }));

      console.log('🔍 DirectorAsistencia: Profesores encontrados:', profesoresFormateados.length);
      console.log('🔍 DirectorAsistencia: Lista de profesores:', profesoresFormateados);

      return c.json({
        success: true,
        data: profesoresFormateados
      });

    } catch (error) {
      console.error('❌ Error al obtener profesores con asistencia:', error);
      return c.json({ 
        success: false, 
        message: 'Error interno del servidor' 
      }, 500);
    }
  }

  // Obtener asistencias por salón con filtros
  static async obtenerAsistenciasPorSalon(c: Context) {
    console.log('🚀 DirectorAsistencia: MÉTODO obtenerAsistenciasPorSalon INICIADO');
    try {
      const gradoId = c.req.query('grado_id');
      const seccionId = c.req.query('seccion_id');
      const fecha = c.req.query('fecha');
      const profesorId = c.req.query('profesor_id');
      const user = c.get('user');
      
      console.log('🔍 DirectorAsistencia: Obteniendo asistencias por salón:', { gradoId, seccionId, fecha, profesorId });
      console.log('🔍 DirectorAsistencia: Profesor ID recibido:', profesorId);
      console.log('🔍 DirectorAsistencia: Profesor ID parseado:', profesorId ? parseInt(profesorId) : 'null');
      
      if (!gradoId || !seccionId || !fecha) {
        return c.json({ 
          success: false, 
          message: 'Grado, sección y fecha son requeridos' 
        }, 400);
      }

      // Crear rango de fechas para el día completo
      const fechaInicio = new Date(fecha + 'T00:00:00.000Z');
      const fechaFin = new Date(fecha + 'T23:59:59.999Z');

      // Construir filtros dinámicos
      const whereClause: any = {
        fecha: {
          gte: fechaInicio,
          lte: fechaFin
        },
        estudiantes: {
          grado_id: parseInt(gradoId),
          seccion_id: parseInt(seccionId)
        }
      };

      // Agregar filtro por profesor si se proporciona
      if (profesorId && profesorId !== 'null' && profesorId !== '' && profesorId !== 'undefined') {
        const profesorIdInt = parseInt(profesorId);
        whereClause.profesor_id = profesorIdInt;
        console.log('🔍 DirectorAsistencia: Aplicando filtro por profesor_id:', profesorIdInt);
        console.log('🔍 DirectorAsistencia: whereClause.profesor_id =', whereClause.profesor_id);
        console.log('🔍 DirectorAsistencia: Tipo de whereClause.profesor_id:', typeof whereClause.profesor_id);
      } else {
        console.log('🔍 DirectorAsistencia: No se aplica filtro por profesor');
        console.log('🔍 DirectorAsistencia: profesorId recibido:', profesorId);
      }

      console.log('🔍 DirectorAsistencia: Filtros aplicados:', whereClause);

      // Obtener asistencias de salón
      console.log('🔍 DirectorAsistencia: Ejecutando consulta Prisma...');
      console.log('🔍 DirectorAsistencia: whereClause completo:', JSON.stringify(whereClause, null, 2));
      
      // PRUEBA: Verificar si hay registros con ese profesor_id
      if (whereClause.profesor_id) {
        const countTotal = await prisma.asistencia_salon.count({
          where: {
            fecha: whereClause.fecha,
            estudiantes: whereClause.estudiantes
          }
        });
        const countConProfesor = await prisma.asistencia_salon.count({
          where: whereClause
        });
        console.log(`🔍 DirectorAsistencia: Total registros sin filtro profesor: ${countTotal}`);
        console.log(`🔍 DirectorAsistencia: Total registros CON filtro profesor ${whereClause.profesor_id}: ${countConProfesor}`);
      }
      
      // FORZAR EL FILTRO POR PROFESOR SI SE PROPORCIONA
      let asistencias;
      if (whereClause.profesor_id) {
        console.log('🔍 DirectorAsistencia: Aplicando filtro ESTRICTO por profesor_id:', whereClause.profesor_id);
        asistencias = await prisma.asistencia_salon.findMany({
          where: {
            AND: [
              { fecha: whereClause.fecha },
              { estudiantes: whereClause.estudiantes },
              { profesor_id: whereClause.profesor_id }
            ]
          },
          include: {
            estudiantes: {
              select: {
                id: true,
                codigo_estudiante: true,
                turno: true,
                estado: true,
                nombres: true,
                apellidos: true,
                dni: true,
                grados: {
                  select: {
                    id: true,
                    nombre: true
                  }
                },
                secciones: {
                  select: {
                    id: true,
                    nombre: true
                  }
                }
              }
            },
            profesores: {
              select: {
                id: true,
                tipo_profesor: true,
                usuarios: {
                  select: {
                    id: true,
                    nombres: true,
                    apellidos: true
                  }
                }
              }
            }
          },
          orderBy: [
            { created_at: 'asc' }
          ]
        });
      } else {
        console.log('🔍 DirectorAsistencia: Sin filtro de profesor, obteniendo todos los registros');
        asistencias = await prisma.asistencia_salon.findMany({
          where: whereClause,
          include: {
            estudiantes: {
              select: {
                id: true,
                codigo_estudiante: true,
                turno: true,
                estado: true,
                nombres: true,
                apellidos: true,
                dni: true,
                grados: {
                  select: {
                    id: true,
                    nombre: true
                  }
                },
                secciones: {
                  select: {
                    id: true,
                    nombre: true
                  }
                }
              }
            },
            profesores: {
              select: {
                id: true,
                tipo_profesor: true,
                usuarios: {
                  select: {
                    id: true,
                    nombres: true,
                    apellidos: true
                  }
                }
              }
            }
          },
          orderBy: [
            { created_at: 'asc' }
          ]
        });
      }

      console.log('🔍 DirectorAsistencia: Asistencias encontradas:', asistencias.length);
      console.log('🔍 DirectorAsistencia: Filtro solicitado - Profesor ID:', profesorId ? parseInt(profesorId) : 'null');
      
      // Mostrar todos los registros encontrados
      asistencias.forEach((asist, index) => {
        console.log(`📋 Registro ${index + 1}:`);
        console.log(`   - ID: ${asist.id}`);
        console.log(`   - Profesor ID en BD: ${asist.profesor_id}`);
        console.log(`   - Estudiante: ${asist.estudiantes.nombres} ${asist.estudiantes.apellidos}`);
        console.log(`   - Profesor: ${asist.profesores?.usuarios.nombres} ${asist.profesores?.usuarios.apellidos}`);
        console.log(`   - Estado: ${asist.estado}`);
        
        // Verificar si el filtro se aplicó correctamente
        if (profesorId && asist.profesor_id !== parseInt(profesorId)) {
          console.log(`❌ ERROR: Este registro NO debería aparecer con el filtro profesor_id=${profesorId}`);
        } else if (profesorId) {
          console.log(`✅ CORRECTO: Este registro coincide con el filtro profesor_id=${profesorId}`);
        }
      });
      
      if (asistencias.length > 0) {
        console.log('🔍 DirectorAsistencia: Primera asistencia - Profesor ID:', asistencias[0].profesor_id);
        console.log('🔍 DirectorAsistencia: Primera asistencia - Profesor nombre:', asistencias[0].profesores?.usuarios.nombres, asistencias[0].profesores?.usuarios.apellidos);
        console.log('🔍 DirectorAsistencia: Filtro solicitado - Profesor ID:', profesorId ? parseInt(profesorId) : 'null');
        
        // Verificar si el filtro se aplicó correctamente
        if (profesorId && asistencias[0].profesor_id !== parseInt(profesorId)) {
          console.log('❌ DirectorAsistencia: ERROR - El filtro por profesor no se aplicó correctamente');
          console.log('   - Profesor solicitado ID:', parseInt(profesorId));
          console.log('   - Profesor devuelto ID:', asistencias[0].profesor_id);
        } else if (profesorId) {
          console.log('✅ DirectorAsistencia: Filtro por profesor aplicado correctamente');
        } else {
          console.log('✅ DirectorAsistencia: Mostrando TODOS los registros (sin filtro de profesor)');
        }
      }

      // Formatear datos para el modelo AsistenciaSalonModel
      const asistenciasFormateadas = asistencias.map(asistencia => ({
        estudiante_id: asistencia.estudiantes.id,
        codigo_estudiante: asistencia.estudiantes.codigo_estudiante,
        nombre_completo: `${asistencia.estudiantes.nombres} ${asistencia.estudiantes.apellidos}`,
        nombres: asistencia.estudiantes.nombres,
        apellidos: asistencia.estudiantes.apellidos,
        dni: asistencia.estudiantes.dni,
        grado: asistencia.estudiantes.grados.nombre,
        nivel: asistencia.estudiantes.grados.nombre.split('°')[0] + '°',
        seccion: asistencia.estudiantes.secciones.nombre,
        estado_asistencia: asistencia.estado,
        profesor_registro: asistencia.profesores ? `${asistencia.profesores.usuarios.nombres} ${asistencia.profesores.usuarios.apellidos}` : null,
        fecha_registro: asistencia.created_at,
        observaciones: asistencia.observaciones,
      }));

      // Calcular estadísticas
      const total = asistenciasFormateadas.length;
      const presentes = asistenciasFormateadas.filter((a: any) => a.estado_asistencia === 'Presente').length;
      const ausentes = asistenciasFormateadas.filter((a: any) => a.estado_asistencia === 'Ausente').length;
      const tardanzas = asistenciasFormateadas.filter((a: any) => a.estado_asistencia === 'Tardanza').length;
      const justificados = asistenciasFormateadas.filter((a: any) => a.estado_asistencia === 'Justificado').length;
      const sinRegistrar = asistenciasFormateadas.filter((a: any) => a.estado_asistencia === 'Sin registrar').length;

      const estadisticas = {
        total,
        presentes,
        ausentes,
        tardanzas,
        justificados,
        sinRegistrar
      };

      console.log('🔍 DirectorAsistencia: Estadísticas:', estadisticas);

      return c.json({
        success: true,
        data: {
          fecha: fecha,
          grado_id: parseInt(gradoId),
          seccion_id: parseInt(seccionId),
          estudiantes: asistenciasFormateadas,
          estadisticas: estadisticas
        }
      });

    } catch (error) {
      console.error('❌ Error al obtener asistencias por salón:', error);
      return c.json({ 
        success: false, 
        message: 'Error interno del servidor' 
      }, 500);
    }
  }

  // Exportar asistencias por salón a Excel (diario o mensual)
  static async exportarAsistenciaExcel(c: Context) {
    try {
      const gradoId = c.req.query('grado_id');
      const seccionId = c.req.query('seccion_id');
      const fecha = c.req.query('fecha');
      const mes = c.req.query('mes');
      const año = c.req.query('año') || c.req.query('anio');
      const tipo = c.req.query('tipo') || 'diario';
      const profesorId = c.req.query('profesor_id');
      
      console.log('🔍 DirectorAsistencia: Exportando a Excel:', { 
        gradoId, seccionId, fecha, mes, año, tipo, profesorId 
      });
      
      // Validar parámetros según el tipo
      if (tipo === 'mensual') {
        if (!gradoId || !seccionId || !mes || !año) {
          return c.json({ 
            success: false, 
            message: 'Grado, sección, mes y año son requeridos para reporte mensual' 
          }, 400);
        }
      } else {
        if (!gradoId || !seccionId || !fecha) {
          return c.json({ 
            success: false, 
            message: 'Grado, sección y fecha son requeridos para reporte diario' 
          }, 400);
        }
      }

      console.log('🔍 DirectorAsistencia: Parámetros recibidos:', {
        gradoId: typeof gradoId, 
        seccionId: typeof seccionId, 
        fecha: typeof fecha, 
        mes: typeof mes,
        año: typeof año,
        tipo: typeof tipo,
        profesorId: typeof profesorId
      });

      // Crear rango de fechas según el tipo
      let fechaInicio: Date;
      let fechaFin: Date;
      
      if (tipo === 'mensual') {
        // Para reporte mensual, obtener todo el mes
        const mesInt = parseInt(mes!);
        const añoInt = parseInt(año!);
        fechaInicio = new Date(añoInt, mesInt - 1, 1); // Primer día del mes
        fechaFin = new Date(añoInt, mesInt, 0, 23, 59, 59, 999); // Último día del mes
        console.log('🔍 DirectorAsistencia: Rango mensual:', { fechaInicio, fechaFin });
      } else {
        // Para reporte diario, solo el día específico
        fechaInicio = new Date(fecha! + 'T00:00:00.000Z');
        fechaFin = new Date(fecha! + 'T23:59:59.999Z');
        console.log('🔍 DirectorAsistencia: Rango diario:', { fechaInicio, fechaFin });
      }

      // Construir filtros dinámicos
      const whereClause: any = {
        fecha: {
          gte: fechaInicio,
          lte: fechaFin
        },
        estudiantes: {
          grado_id: parseInt(gradoId),
          seccion_id: parseInt(seccionId)
        }
      };

      // Agregar filtro por profesor si se proporciona
      if (profesorId && profesorId !== 'null' && profesorId !== '' && profesorId !== 'undefined') {
        whereClause.profesor_id = parseInt(profesorId);
      }

      // Obtener datos de asistencias
      console.log('🔍 DirectorAsistencia: Ejecutando consulta con filtros:', whereClause);
      
      const asistencias = await prisma.asistencia_salon.findMany({
        where: whereClause,
        include: {
          estudiantes: {
            select: {
              id: true,
              codigo_estudiante: true,
              nombres: true,
              apellidos: true,
              dni: true,
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
          },
          profesores: {
            select: {
              usuarios: {
                select: {
                  nombres: true,
                  apellidos: true
                }
              }
            }
          }
        },
        orderBy: [
          { created_at: 'asc' }
        ]
      });

      console.log('🔍 DirectorAsistencia: Asistencias encontradas:', asistencias.length);
      if (asistencias.length > 0) {
        console.log('🔍 DirectorAsistencia: Primera asistencia:', {
          estudiante: `${asistencias[0].estudiantes.nombres} ${asistencias[0].estudiantes.apellidos}`,
          estado: asistencias[0].estado,
          profesor: asistencias[0].profesores ? `${asistencias[0].profesores.usuarios.nombres} ${asistencias[0].profesores.usuarios.apellidos}` : 'Sin profesor'
        });
      }

      // Obtener información del grado y sección
      const grado = await prisma.grados.findUnique({
        where: { id: parseInt(gradoId) },
        select: { nombre: true }
      });

      const seccion = await prisma.secciones.findUnique({
        where: { id: parseInt(seccionId) },
        select: { nombre: true }
      });

      // Preparar datos para Excel según el tipo
      let datosExcel: any[];
      
              if (tipo === 'mensual') {
                // Para reporte mensual, usar ExcelJS para logo real
                const profesorIdParam = profesorId ? parseInt(profesorId) : undefined;
                const excelBuffer = await DirectorReporte.generarReporteConExcelJS(
                  parseInt(gradoId), 
                  parseInt(seccionId), 
                  parseInt(mes!), 
                  parseInt(año!), 
                  profesorIdParam
                );
                
                // Devolver directamente el buffer de ExcelJS
                return new Response(excelBuffer as any, {
                  status: 200,
                  headers: {
                    'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'Content-Disposition': `attachment; filename="Control_Mensual_${grado?.nombre}_${seccion?.nombre}_${mes}_${año}.xlsx"`,
                    'Content-Length': excelBuffer.length.toString()
                  }
                });
      } else {
        // Para reporte diario, formato actual
        datosExcel = asistencias.map((asistencia, index) => ({
          'N°': index + 1,
          'Código': asistencia.estudiantes.codigo_estudiante,
          'Nombres': asistencia.estudiantes.nombres,
          'Apellidos': asistencia.estudiantes.apellidos,
          'DNI': asistencia.estudiantes.dni,
          'Grado': asistencia.estudiantes.grados.nombre,
          'Sección': asistencia.estudiantes.secciones.nombre,
          'Estado': asistencia.estado,
          'Profesor': asistencia.profesores ? 
            `${asistencia.profesores.usuarios.nombres} ${asistencia.profesores.usuarios.apellidos}` : 
            'No asignado',
          'Fecha Registro': asistencia.created_at?.toLocaleDateString('es-PE') || 'N/A',
          'Hora Registro': asistencia.created_at?.toLocaleTimeString('es-PE') || 'N/A',
          'Observaciones': asistencia.observaciones || ''
        }));
      }

      // Calcular estadísticas
      const total = asistencias.length;
      const presentes = asistencias.filter(a => a.estado === 'Presente').length;
      const ausentes = asistencias.filter(a => a.estado === 'Ausente').length;
      const tardanzas = asistencias.filter(a => a.estado === 'Tardanza').length;
      const justificados = asistencias.filter(a => a.estado === 'Justificado').length;

      // Crear libro de Excel
      const workbook = XLSX.utils.book_new();

      // Hoja 1: Resumen
      const resumenData = [
        ['REPORTE DE ASISTENCIAS POR SALÓN'],
        [''],
        ['Información del Reporte:'],
        ['Fecha:', fecha],
        ['Grado:', grado?.nombre || 'N/A'],
        ['Sección:', seccion?.nombre || 'N/A'],
        ['Profesor:', profesorId ? 
          (asistencias[0]?.profesores ? 
            `${asistencias[0].profesores.usuarios.nombres} ${asistencias[0].profesores.usuarios.apellidos}` : 
            'No asignado') : 
          'Todos los profesores'
        ],
        [''],
        ['Estadísticas:'],
        ['Total Estudiantes:', total],
        ['Presentes:', presentes],
        ['Ausentes:', ausentes],
        ['Tardanzas:', tardanzas],
        ['Justificados:', justificados],
        [''],
        ['Porcentajes:'],
        ['% Presentes:', total > 0 ? ((presentes / total) * 100).toFixed(2) + '%' : '0%'],
        ['% Ausentes:', total > 0 ? ((ausentes / total) * 100).toFixed(2) + '%' : '0%'],
        ['% Tardanzas:', total > 0 ? ((tardanzas / total) * 100).toFixed(2) + '%' : '0%'],
        ['% Justificados:', total > 0 ? ((justificados / total) * 100).toFixed(2) + '%' : '0%']
      ];

      const resumenSheet = XLSX.utils.aoa_to_sheet(resumenData);
      XLSX.utils.book_append_sheet(workbook, resumenSheet, 'Resumen');

      // Hoja 2: Lista detallada
      if (tipo === 'mensual') {
        // Para reporte mensual, crear formato tradicional
        const profesorIdParam = profesorId ? parseInt(profesorId) : undefined;
        const datosMensualesAOA = await DirectorReporte.generarReporteMensual(
          parseInt(gradoId), 
          parseInt(seccionId), 
          parseInt(mes!), 
          parseInt(año!), 
          profesorIdParam
        );
        const detalleSheet = XLSX.utils.aoa_to_sheet(datosMensualesAOA);
        XLSX.utils.book_append_sheet(workbook, detalleSheet, 'Control Mensual');
        
        // Aplicar estilos al Excel
        DirectorReporte.aplicarEstilosExcel(workbook, detalleSheet);
        
        // Incluir logo en el Excel
        await DirectorReporte.incluirLogoEnExcel(workbook, detalleSheet);
      } else {
        // Para reporte diario, formato normal
        const detalleSheet = XLSX.utils.json_to_sheet(datosExcel);
        XLSX.utils.book_append_sheet(workbook, detalleSheet, 'Asistencias');
      }

      // Generar archivo Excel
      const excelBuffer = XLSX.write(workbook, { 
        type: 'array', 
        bookType: 'xlsx' 
      });

      // Configurar headers para descarga con nombre más descriptivo
      let nombreArchivo = `Asistencias_${grado?.nombre}_${seccion?.nombre}_${fecha}`;
      
      // Agregar nombre del profesor si está filtrado por profesor
      if (profesorId && asistencias.length > 0 && asistencias[0].profesores) {
        const profesor = asistencias[0].profesores;
        const nombreProfesor = `${profesor.usuarios.nombres}_${profesor.usuarios.apellidos}`.replace(/\s+/g, '_');
        nombreArchivo += `_${nombreProfesor}`;
      }
      
      nombreArchivo += '.xlsx';
      
      console.log('✅ DirectorAsistencia: Excel generado exitosamente:', nombreArchivo);
      console.log('🔍 DirectorAsistencia: Datos en Excel:', datosExcel.length, 'registros');
      console.log('🔍 DirectorAsistencia: Estadísticas:', { total, presentes, ausentes, tardanzas, justificados });

      // Convertir array a Buffer
      const buffer = Buffer.from(excelBuffer);
      
      // Devolver el archivo Excel directamente
      return new Response(buffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${nombreArchivo}"`,
          'Content-Length': buffer.length.toString()
        }
      });

    } catch (error) {
      console.error('❌ Error al exportar a Excel:', error);
      return c.json({ 
        success: false, 
        message: 'Error interno del servidor' 
      }, 500);
    }
  }


  // Generar las semanas de un mes
  private static _generarSemanasDelMes(mes: number, año: number) {
    const semanas: any[] = [];
    const primerDia = new Date(año, mes - 1, 1);
    const ultimoDia = new Date(año, mes, 0);
    
    let fechaActual = new Date(primerDia);
    
    // Ajustar al lunes de la primera semana
    const diaSemana = fechaActual.getDay();
    const diasHastaLunes = diaSemana === 0 ? -6 : 1 - diaSemana;
    fechaActual.setDate(fechaActual.getDate() + diasHastaLunes);
    
    while (fechaActual <= ultimoDia) {
      const semana = {
        inicio: new Date(fechaActual),
        dias: [] as Date[]
      };
      
      // Generar los 5 días de la semana (L-V)
      for (let i = 0; i < 5; i++) {
        const dia = new Date(fechaActual);
        dia.setDate(dia.getDate() + i);
        semana.dias.push(dia);
      }
      
      semanas.push(semana);
      fechaActual.setDate(fechaActual.getDate() + 7); // Siguiente semana
    }
    
    return semanas;
  }
}
