import { Context } from 'hono';
import { PrismaClient } from '../../generated/prisma/index.js';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { AsistenciaService, DatosQREstudiante } from '../services/asistenciaService.js';
import NotificacionService from '../services/notificacionService.js';

const prisma = new PrismaClient();

export class PorteroController {
  // Marcar asistencia como justificada automáticamente por permiso activo
  private static async marcarAsistenciaJustificadaAutomaticamente(estudianteId: number, permiso: any) {
    const { getFechaActualPeru, getInicioDiaPeru, getFinDiaPeru } = await import('../utils/dateUtils.js');
    const fechaHoyPeru = getFechaActualPeru();
    const inicioDiaPeru = getInicioDiaPeru();
    const finDiaPeru = getFinDiaPeru();

    // Verificar si ya existe asistencia para hoy
    const asistenciaExistente = await prisma.asistencia_general.findFirst({
      where: {
        estudiante_id: estudianteId,
        fecha: {
          gte: inicioDiaPeru,
          lte: finDiaPeru
        }
      }
    });

    if (asistenciaExistente) {
      // Si ya existe, actualizar como justificado
      return await prisma.asistencia_general.update({
        where: { id: asistenciaExistente.id },
        data: {
          estado: 'Justificado',
          observaciones: `Justificado automáticamente por permiso activo: ${permiso.motivo}`
        }
      });
    } else {
      // Si no existe, crear nueva asistencia como justificado
      return await prisma.asistencia_general.create({
        data: {
          estudiante_id: estudianteId,
          usuario_portero_id: 1, // ID del sistema para registros automáticos
          fecha: fechaHoyPeru,
          estado: 'Justificado',
          observaciones: `Justificado automáticamente por permiso activo: ${permiso.motivo}`,
          hora_entrada: null,
          hora_salida: null
        }
      });
    }
  }
  // Obtener perfil del portero
  static async obtenerPerfil(c: Context) {
    try {
      const user = c.get('user');
      
      if (!user || user.rol_id !== 3) { // rol_id 3 es para porteros
        return c.json({ message: 'Acceso denegado. Solo porteros pueden acceder.' }, 403);
      }

      const portero: any = await prisma.usuarios.findFirst({
        where: {
          id: user.id,
          rol_id: 3,
          activo: true
        },
        include: {
          roles: true
        }
      });

      if (!portero) {
        return c.json({ message: 'Portero no encontrado' }, 404);
      }

      // Remover password_hash de la respuesta
      const { password_hash, ...porteroSinPassword } = portero;

      return c.json({
        success: true,
        portero: porteroSinPassword
      });
    } catch (error) {
      console.error('Error al obtener perfil del portero:', error);
      return c.json({ message: 'Error interno del servidor' }, 500);
    }
  }

  // Actualizar perfil del portero
  static async actualizarPerfil(c: Context) {
    try {
      const user = c.get('user');
      
      if (!user || user.rol_id !== 3) {
        return c.json({ message: 'Acceso denegado. Solo porteros pueden acceder.' }, 403);
      }

      const {
        nombres,
        apellidos,
        email,
        telefono,
        direccion,
        fecha_nacimiento,
        genero
      } = await c.req.json();

      // Validaciones básicas
      if (!nombres || !apellidos) {
        return c.json({ message: 'Nombres y apellidos son requeridos' }, 400);
      }

      // Verificar si el email ya existe en otro usuario
      if (email) {
        const emailExistente = await prisma.usuarios.findFirst({
          where: {
            email: email,
            id: { not: user.id }
          }
        });

        if (emailExistente) {
          return c.json({ message: 'El email ya está en uso por otro usuario' }, 400);
        }
      }

      const portero: any = await prisma.usuarios.update({
        where: {
          id: user.id
        },
        data: {
          nombres,
          apellidos,
          email,
          telefono,
          direccion,
          fecha_nacimiento: fecha_nacimiento ? new Date(fecha_nacimiento) : null,
          genero,
          updated_at: new Date()
        },
        include: {
          roles: true
        }
      });

      // Remover password_hash de la respuesta
      const { password_hash, ...porteroSinPassword } = portero;

      return c.json({
        success: true,
        message: 'Perfil actualizado exitosamente',
        portero: porteroSinPassword
      });
    } catch (error) {
      console.error('Error al actualizar perfil del portero:', error);
      return c.json({ message: 'Error interno del servidor' }, 500);
    }
  }

  // Obtener estadísticas del dashboard
  static async obtenerDashboard(c: Context) {
    try {
      const user = c.get('user');
      
      if (!user || user.rol_id !== 3) {
        return c.json({ message: 'Acceso denegado. Solo porteros pueden acceder.' }, 403);
      }

      const { getFechaActualPeru, getInicioDiaPeru, getFinDiaPeru } = await import('../utils/dateUtils.js');
      const fechaHoyPeru = getFechaActualPeru();
      const inicioDiaPeru = getInicioDiaPeru();
      const finDiaPeru = getFinDiaPeru();

      // Obtener asistencias de hoy para estadísticas
      const asistenciasHoy = await AsistenciaService.obtenerAsistenciasHoy();
      
      console.log('🔍 Dashboard - Total asistencias recibidas:', asistenciasHoy.length);
      console.log('🔍 Dashboard - Estados de asistencias:', asistenciasHoy.map(a => ({ id: a.id, estado_asistencia: a.estado_asistencia })));
      
      // Contar estudiantes activos
      const totalEstudiantes = await prisma.estudiantes.count({
        where: { estado: 'Activo' }
      });

      // Contar asistencias de hoy
      const asistenciasHoyCount = await prisma.asistencia_general.count({
        where: {
          fecha: {
            gte: inicioDiaPeru,
            lte: finDiaPeru
          }
        }
      });

      // Contar tardanzas de hoy
      const tardanzasHoy = await prisma.asistencia_general.count({
        where: {
          fecha: {
            gte: inicioDiaPeru,
            lte: finDiaPeru
          },
          estado: 'Tarde'
        }
      });

      // Contar ausencias de hoy
      const ausenciasHoy = await prisma.asistencia_general.count({
        where: {
          fecha: {
            gte: inicioDiaPeru,
            lte: finDiaPeru
          },
          estado: 'Ausente'
        }
      });

      // Contar justificados de hoy
      const justificadosHoy = await prisma.asistencia_general.count({
        where: {
          fecha: {
            gte: inicioDiaPeru,
            lte: finDiaPeru
          },
          estado: 'Justificado'
        }
      });

      // Contar presentes de hoy
      const presentesHoy = await prisma.asistencia_general.count({
        where: {
          fecha: {
            gte: inicioDiaPeru,
            lte: finDiaPeru
          },
          estado: 'Presente'
        }
      });

      // Calcular porcentaje de asistencia
      const totalRegistrados = asistenciasHoyCount;
      const porcentajeAsistencia = totalRegistrados > 0 ? Math.round((presentesHoy / totalRegistrados) * 100) : 0;

      // Obtener estadísticas de ayer para comparación
      const ayer = new Date(fechaHoyPeru);
      ayer.setDate(ayer.getDate() - 1);
      const inicioAyer = new Date(ayer);
      inicioAyer.setHours(0, 0, 0, 0);
      const finAyer = new Date(ayer);
      finAyer.setHours(23, 59, 59, 999);

      const asistenciasAyer = await prisma.asistencia_general.count({
        where: {
          fecha: {
            gte: inicioAyer,
            lte: finAyer
          }
        }
      });

      const presentesAyer = await prisma.asistencia_general.count({
        where: {
          fecha: {
            gte: inicioAyer,
            lte: finAyer
          },
          estado: 'Presente'
        }
      });

      // Calcular tendencia
      const tendencia = asistenciasAyer > 0 ? 
        Math.round(((asistenciasHoyCount - asistenciasAyer) / asistenciasAyer) * 100) : 0;

      // Obtener estudiantes con permisos activos
      const estudiantesConPermisos = await prisma.estudiantes.count({
        where: {
          estado: 'Activo',
          solicitudes_permisos: {
            some: {
              estado: 'Aprobado',
              fecha_permiso_inicio: {
                lte: new Date()
              },
              OR: [
                {
                  fecha_permiso_fin: {
                    gte: new Date()
                  }
                },
                {
                  fecha_permiso_fin: null
                }
              ]
            }
          }
        }
      });

      // Obtener hora promedio de llegada
      const asistenciasConHora = await prisma.asistencia_general.findMany({
        where: {
          fecha: {
            gte: inicioDiaPeru,
            lte: finDiaPeru
          },
          hora_entrada: {
            not: null
          }
        },
        select: {
          hora_entrada: true
        }
      });

      let horaPromedio = 'N/A';
      if (asistenciasConHora.length > 0) {
        const totalMinutos = asistenciasConHora.reduce((acc, asistencia) => {
          if (asistencia.hora_entrada) {
            const horaString = String(asistencia.hora_entrada);
            const partes = horaString.split(':');
            if (partes.length >= 2) {
              const hora = parseInt(partes[0]) || 0;
              const minuto = parseInt(partes[1]) || 0;
              return acc + (hora * 60 + minuto);
            }
          }
          return acc;
        }, 0);
        
        if (totalMinutos > 0) {
          const promedioMinutos = Math.round(totalMinutos / asistenciasConHora.length);
          const horas = Math.floor(promedioMinutos / 60);
          const minutos = promedioMinutos % 60;
          horaPromedio = `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
        }
      }
      
      const estadisticas = {
        // Métricas básicas
        estudiantesHoy: totalEstudiantes,
        asistenciasHoy: asistenciasHoyCount,
        tardanzasHoy: tardanzasHoy,
        ausenciasHoy: ausenciasHoy,
        justificadosHoy: justificadosHoy,
        presentesHoy: presentesHoy,
        
        // Métricas avanzadas
        porcentajeAsistencia: porcentajeAsistencia,
        tendencia: tendencia,
        estudiantesConPermisos: estudiantesConPermisos,
        horaPromedioLlegada: horaPromedio,
        
        // Comparación con ayer
        asistenciasAyer: asistenciasAyer,
        presentesAyer: presentesAyer
      };
      
      console.log('🔍 Dashboard - Estadísticas calculadas:', estadisticas);
      console.log('🔍 Dashboard - Debug datos:');
      console.log('  - Total estudiantes:', totalEstudiantes);
      console.log('  - Asistencias hoy:', asistenciasHoyCount);
      console.log('  - Presentes hoy:', presentesHoy);
      console.log('  - Porcentaje:', porcentajeAsistencia);
      console.log('  - Tendencia:', tendencia);
      console.log('  - Hora promedio:', horaPromedio);
      console.log('  - Asistencias con hora:', asistenciasConHora.length);

      return c.json({
        success: true,
        estadisticas,
        asistencias: asistenciasHoy
      });
    } catch (error) {
      console.error('Error al obtener estadísticas del dashboard:', error);
      return c.json({ message: 'Error interno del servidor' }, 500);
    }
  }

  // Procesar escaneo de QR para registro de asistencia
  static async procesarEscaneoQR(c: Context) {
    try {
      const user = c.get('user');
      
      if (!user || user.rol_id !== 3) {
        return c.json({ message: 'Acceso denegado. Solo porteros pueden acceder.' }, 403);
      }

      const datosQR: DatosQREstudiante = await c.req.json();

      // Validar datos del QR
      if (!datosQR.codigo_estudiante || !datosQR.nombre || !datosQR.apellido || 
          !datosQR.grado || !datosQR.seccion || !datosQR.turno) {
        return c.json({ 
          success: false,
          message: 'Datos del QR incompletos' 
        }, 400);
      }

      // Procesar el escaneo
      const resultado = await AsistenciaService.procesarEscaneoQR(datosQR, user.id);

      return c.json(resultado, resultado.success ? 200 : 400);
    } catch (error) {
      console.error('Error al procesar escaneo QR:', error);
      return c.json({ 
        success: false,
        message: 'Error interno del servidor' 
      }, 500);
    }
  }

  // Obtener asistencias del día actual
  static async obtenerAsistenciasHoy(c: Context) {
    try {
      const user = c.get('user');
      
      if (!user || user.rol_id !== 3) {
        return c.json({ message: 'Acceso denegado. Solo porteros pueden acceder.' }, 403);
      }

      const asistencias = await AsistenciaService.obtenerAsistenciasHoy();

      return c.json({
        success: true,
        asistencias
      });
    } catch (error) {
      console.error('Error al obtener asistencias de hoy:', error);
      return c.json({ message: 'Error interno del servidor' }, 500);
    }
  }

  // Obtener asistencias de una fecha específica
  static async obtenerAsistenciasPorFecha(c: Context) {
    try {
      const user = c.get('user');
      
      if (!user || user.rol_id !== 3) {
        return c.json({ message: 'Acceso denegado. Solo porteros pueden acceder.' }, 403);
      }

      const fecha = c.req.query('fecha');
      
      if (!fecha) {
        return c.json({ message: 'Parámetro fecha es requerido (formato: YYYY-MM-DD)' }, 400);
      }

      // Validar formato de fecha
      const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!fechaRegex.test(fecha)) {
        return c.json({ message: 'Formato de fecha inválido. Use YYYY-MM-DD' }, 400);
      }

      const asistencias = await AsistenciaService.obtenerAsistenciasPorFecha(fecha);

      return c.json({
        success: true,
        fecha,
        asistencias
      });
    } catch (error) {
      console.error('Error al obtener asistencias por fecha:', error);
      return c.json({ message: 'Error interno del servidor' }, 500);
    }
  }

  // Obtener historial de asistencia de un estudiante
  static async obtenerHistorialEstudiante(c: Context) {
    try {
      const user = c.get('user');
      
      if (!user || user.rol_id !== 3) {
        return c.json({ message: 'Acceso denegado. Solo porteros pueden acceder.' }, 403);
      }

      const estudianteId = parseInt(c.req.param('estudianteId'));
      const fechaInicio = c.req.query('fechaInicio') ? new Date(c.req.query('fechaInicio')!) : undefined;
      const fechaFin = c.req.query('fechaFin') ? new Date(c.req.query('fechaFin')!) : undefined;

      console.log('🔍 Obteniendo historial para estudiante ID:', estudianteId);
      console.log('🔍 Fecha inicio:', fechaInicio);
      console.log('🔍 Fecha fin:', fechaFin);

      if (!estudianteId || isNaN(estudianteId)) {
        return c.json({ 
          success: false,
          message: 'ID de estudiante inválido' 
        }, 400);
      }

      console.log('🔍 Llamando a AsistenciaService.obtenerHistorialAsistencia...');
      const historial = await AsistenciaService.obtenerHistorialAsistencia(
        estudianteId, 
        fechaInicio, 
        fechaFin
      );

      console.log('🔍 Historial encontrado:', historial.length, 'registros');
      console.log('🔍 Primer registro:', historial[0] || 'No hay registros');
      console.log('🔍 Todos los registros:', historial);

      return c.json({
        success: true,
        historial
      });
    } catch (error) {
      console.error('Error al obtener historial de estudiante:', error);
      return c.json({ message: 'Error interno del servidor' }, 500);
    }
  }

  // Obtener historial completo de asistencia de un estudiante (incluye días ausentes)
  static async obtenerHistorialCompletoEstudiante(c: Context) {
    try {
      const user = c.get('user');
      
      if (!user || user.rol_id !== 3) {
        return c.json({ message: 'Acceso denegado. Solo porteros pueden acceder.' }, 403);
      }

      const estudianteId = parseInt(c.req.param('estudianteId'));
      const fechaInicio = c.req.query('fechaInicio') ? new Date(c.req.query('fechaInicio')!) : undefined;
      const fechaFin = c.req.query('fechaFin') ? new Date(c.req.query('fechaFin')!) : undefined;

      if (!estudianteId || isNaN(estudianteId)) {
        return c.json({ 
          success: false,
          message: 'ID de estudiante inválido' 
        }, 400);
      }

      const historial = await AsistenciaService.obtenerHistorialCompletoAsistencia(
        estudianteId, 
        fechaInicio, 
        fechaFin
      );

      return c.json({
        success: true,
        historial
      });
    } catch (error) {
      console.error('Error al obtener historial completo de estudiante:', error);
      return c.json({ message: 'Error interno del servidor' }, 500);
    }
  }

  // Buscar estudiante por código para verificación
  static async buscarEstudiantePorCodigo(c: Context) {
    try {
      const user = c.get('user');
      
      if (!user || user.rol_id !== 3) {
        return c.json({ message: 'Acceso denegado. Solo porteros pueden acceder.' }, 403);
      }

      const codigo = c.req.param('codigo');

      if (!codigo) {
        return c.json({ 
          success: false,
          message: 'Código de estudiante requerido' 
        }, 400);
      }

      const estudiante = await prisma.estudiantes.findFirst({
        where: {
          codigo_estudiante: codigo
        },
        include: {
          grados: true,
          secciones: true,
          solicitudes_permisos: {
            where: {
              estado: 'Aprobado',
              fecha_permiso_inicio: {
                lte: new Date()
              },
              OR: [
                {
                  fecha_permiso_fin: {
                    gte: new Date()
                  }
                },
                {
                  fecha_permiso_fin: null
                }
              ]
            }
          }
        }
      });

      if (!estudiante) {
        return c.json({ 
          success: false,
          message: 'Estudiante no encontrado' 
        }, 404);
      }

      return c.json({
        success: true,
        estudiante: {
          id: estudiante.id,
          codigo_estudiante: estudiante.codigo_estudiante,
          nombre: estudiante.nombres,
          apellido: estudiante.apellidos,
          grado: estudiante.grados.nombre,
          seccion: estudiante.secciones.nombre,
          turno: estudiante.turno
        }
      });
    } catch (error) {
      console.error('Error al buscar estudiante por código:', error);
      return c.json({ message: 'Error interno del servidor' }, 500);
    }
  }

  // Buscar estudiantes por nombre (búsqueda global)
  static async buscarEstudiantesPorNombre(c: Context) {
    try {
      const user = c.get('user');
      
      if (!user || user.rol_id !== 3) {
        return c.json({ message: 'Acceso denegado. Solo porteros pueden acceder.' }, 403);
      }

      const termino = c.req.query('q');

      if (!termino || termino.trim().length === 0) {
        return c.json({ 
          success: false,
          message: 'Término de búsqueda requerido' 
        }, 400);
      }

      const terminoLimpio = termino.trim();
      
      console.log('🔍 Buscando estudiantes con término:', terminoLimpio);

      // Buscar estudiantes con coincidencia parcial en nombres y apellidos
      const estudiantes = await prisma.estudiantes.findMany({
        where: {
          OR: [
            {
              nombres: {
                contains: terminoLimpio,
                mode: 'insensitive'
              }
            },
            {
              apellidos: {
                contains: terminoLimpio,
                mode: 'insensitive'
              }
            },
            // Búsqueda por nombre completo (nombre + apellido)
            {
              AND: [
                {
                  nombres: {
                    contains: terminoLimpio.split(' ')[0] || '',
                    mode: 'insensitive'
                  }
                },
                {
                  apellidos: {
                    contains: terminoLimpio.split(' ')[1] || '',
                    mode: 'insensitive'
                  }
                }
              ]
            }
          ]
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
          },
          solicitudes_permisos: {
            where: {
              estado: 'Aprobado',
              fecha_permiso_inicio: {
                lte: new Date()
              },
              OR: [
                {
                  fecha_permiso_fin: {
                    gte: new Date()
                  }
                },
                {
                  fecha_permiso_fin: null
                }
              ]
            }
          }
        },
        orderBy: [
          { apellidos: 'asc' },
          { nombres: 'asc' }
        ],
        take: 20 // Limitar a 20 resultados para evitar sobrecarga
      });

      console.log('🔍 Estudiantes encontrados en BD:', estudiantes.length);
      console.log('🔍 Primeros estudiantes:', estudiantes.slice(0, 3).map(e => ({
        id: e.id,
        nombre: e.nombres,
        apellido: e.apellidos
      })));

      const estudiantesFormateados = await Promise.all(estudiantes.map(async (estudiante) => {
        const tienePermisoActivo = estudiante.solicitudes_permisos.length > 0;
        let asistenciaHoy = null;

        // Si tiene permiso activo, verificar si ya está marcado como justificado
        if (tienePermisoActivo) {
          const { getInicioDiaPeru, getFinDiaPeru } = await import('../utils/dateUtils.js');
          const inicioDiaPeru = getInicioDiaPeru();
          const finDiaPeru = getFinDiaPeru();

          asistenciaHoy = await prisma.asistencia_general.findFirst({
            where: {
              estudiante_id: estudiante.id,
              fecha: {
                gte: inicioDiaPeru,
                lte: finDiaPeru
              }
            }
          });

          // Si no tiene asistencia registrada, marcarla automáticamente como justificado
          if (!asistenciaHoy) {
            asistenciaHoy = await this.marcarAsistenciaJustificadaAutomaticamente(
              estudiante.id, 
              estudiante.solicitudes_permisos[0]
            );
          }
        }

        return {
          id: estudiante.id,
          codigo_estudiante: estudiante.codigo_estudiante,
          nombre: estudiante.nombres,
          apellido: estudiante.apellidos,
          nombreCompleto: `${estudiante.nombres} ${estudiante.apellidos}`,
          grado: estudiante.grados.nombre,
          seccion: estudiante.secciones.nombre,
          turno: estudiante.turno,
          tienePermisoActivo: tienePermisoActivo,
          asistenciaHoy: asistenciaHoy,
          permisos: estudiante.solicitudes_permisos.map(p => ({
            id: p.id,
            motivo: p.motivo,
            fecha_inicio: p.fecha_permiso_inicio,
            fecha_fin: p.fecha_permiso_fin
          }))
        };
      }));

      return c.json({
        success: true,
        estudiantes: estudiantesFormateados,
        total: estudiantesFormateados.length
      });
    } catch (error) {
      console.error('Error al buscar estudiantes por nombre:', error);
      return c.json({ message: 'Error interno del servidor' }, 500);
    }
  }

  // Registrar asistencia manual
  static async registrarAsistenciaManual(c: Context) {
    try {
      const user = c.get('user');
      
      if (!user || user.rol_id !== 3) { // rol_id 3 es para porteros
        return c.json({ message: 'Acceso denegado. Solo porteros pueden registrar asistencia.' }, 403);
      }

      const { estudianteId, tipoAsistencia = 'entrada' } = await c.req.json();

      if (!estudianteId) {
        return c.json({ message: 'ID del estudiante es requerido' }, 400);
      }

      // Verificar que el estudiante existe y obtener permisos activos
      const estudiante = await prisma.estudiantes.findUnique({
        where: { id: parseInt(estudianteId) },
        include: {
          solicitudes_permisos: {
            where: {
              estado: 'Aprobado',
              fecha_permiso_inicio: {
                lte: new Date()
              },
              OR: [
                {
                  fecha_permiso_fin: {
                    gte: new Date()
                  }
                },
                {
                  fecha_permiso_fin: null
                }
              ]
            }
          }
        }
      });

      if (!estudiante) {
        return c.json({ message: 'Estudiante no encontrado' }, 404);
      }

      // Verificar si tiene permiso activo para hoy
      const tienePermisoActivo = estudiante.solicitudes_permisos.length > 0;
      
      if (tienePermisoActivo) {
        // Si tiene permiso activo, marcar automáticamente como justificado
        if (tipoAsistencia === 'entrada' || tipoAsistencia === 'tardanza') {
          // Crear o actualizar asistencia como justificado automáticamente
          const asistenciaJustificada = await this.marcarAsistenciaJustificadaAutomaticamente(
            parseInt(estudianteId), 
            estudiante.solicitudes_permisos[0]
          );
          
          return c.json({
            success: true,
            message: 'Asistencia marcada automáticamente como justificado por permiso activo',
            asistencia: asistenciaJustificada,
            tienePermisoActivo: true,
            permisos: estudiante.solicitudes_permisos
          });
        }
      }

      // Verificar si ya tiene asistencia registrada hoy (usando zona horaria de Perú)
      const { getFechaActualPeru, getInicioDiaPeru, getFinDiaPeru } = await import('../utils/dateUtils.js');
      const fechaHoyPeru = getFechaActualPeru();
      const inicioDiaPeru = getInicioDiaPeru();
      const finDiaPeru = getFinDiaPeru();
      
      console.log('🔍 Registrando asistencia para fecha (Perú):', fechaHoyPeru);

      const asistenciaExistente = await prisma.asistencia_general.findFirst({
        where: {
          estudiante_id: parseInt(estudianteId),
          fecha: {
            gte: inicioDiaPeru,
            lte: finDiaPeru
          }
        }
      });

      const { getFechaHoraActualPeru, getHoraActualPeruParaBD } = await import('../utils/dateUtils.js');
      const ahora = getFechaHoraActualPeru();
      const horaActualPeru = getHoraActualPeruParaBD();
      let asistencia;

      if (asistenciaExistente) {
        // Si ya existe una asistencia
        if (tipoAsistencia === 'entrada') {
          // Si ya tiene entrada registrada
          if (asistenciaExistente.hora_entrada) {
            return c.json({ 
              message: 'El estudiante ya tiene entrada registrada hoy',
              asistencia: asistenciaExistente
            }, 400);
          }
          // Si no tiene entrada, actualizar con la entrada
          asistencia = await prisma.asistencia_general.update({
            where: { id: asistenciaExistente.id },
            data: {
              hora_entrada: horaActualPeru,
              estado: 'Presente',
              observaciones: asistenciaExistente.observaciones + ' - Entrada manual por portero'
            }
          });
        } else if (tipoAsistencia === 'tardanza') {
          // Si ya tiene entrada registrada
          if (asistenciaExistente.hora_entrada) {
            return c.json({ 
              message: 'El estudiante ya tiene entrada registrada hoy',
              asistencia: asistenciaExistente
            }, 400);
          }
          // Si no tiene entrada, actualizar con tardanza
          asistencia = await prisma.asistencia_general.update({
            where: { id: asistenciaExistente.id },
            data: {
              hora_entrada: horaActualPeru,
              estado: 'Tarde',
              observaciones: asistenciaExistente.observaciones + ' - Tardanza registrada por portero'
            }
          });
        } else if (tipoAsistencia === 'justificado') {
          // Justificar ausencia
          console.log('🔍 Registrando asistencia como Justificado para estudiante ID:', estudianteId);
          asistencia = await prisma.asistencia_general.update({
            where: { id: asistenciaExistente.id },
            data: {
              estado: 'Justificado',
              observaciones: asistenciaExistente.observaciones + ' - Ausencia justificada por portero'
            }
          });
          console.log('🔍 ✅ Asistencia actualizada como Justificado:', asistencia);
        } else {
          // Si es salida
          if (asistenciaExistente.hora_salida) {
            return c.json({ 
              message: 'El estudiante ya tiene salida registrada hoy',
              asistencia: asistenciaExistente
            }, 400);
          }
          // Si no tiene salida, actualizar con la salida
          asistencia = await prisma.asistencia_general.update({
            where: { id: asistenciaExistente.id },
            data: {
              hora_salida: ahora,
              estado: 'Salida', // Cambiar estado a "Salida"
              observaciones: asistenciaExistente.observaciones + ' - Salida manual por portero'
            }
          });
        }
      } else {
        // Si no existe asistencia, crear nueva
        let estado = 'Presente';
        let hora_entrada = null;
        let hora_salida = null;
        
        if (tipoAsistencia === 'entrada') {
          hora_entrada = horaActualPeru;
          estado = 'Presente';
        } else if (tipoAsistencia === 'tardanza') {
          hora_entrada = horaActualPeru;
          estado = 'Tarde';
        } else if (tipoAsistencia === 'justificado') {
          estado = 'Justificado';
        } else if (tipoAsistencia === 'salida') {
          hora_salida = horaActualPeru;
          estado = 'Salida'; // Cambiar estado a "Salida"
        }
        
        asistencia = await prisma.asistencia_general.create({
          data: {
            estudiante_id: parseInt(estudianteId),
            usuario_portero_id: user.id,
            fecha: new Date(fechaHoyPeru),
            hora_entrada: hora_entrada,
            hora_salida: hora_salida,
            estado: estado,
            observaciones: `Registro manual de ${tipoAsistencia} por portero`
          }
        });
      }

      let tipoMensaje = '';
      if (tipoAsistencia === 'entrada') {
        tipoMensaje = 'Entrada';
      } else if (tipoAsistencia === 'tardanza') {
        tipoMensaje = 'Tardanza';
      } else if (tipoAsistencia === 'justificado') {
        tipoMensaje = 'Justificación';
      } else {
        tipoMensaje = 'Salida';
      }

      // 🔔 CREAR NOTIFICACIÓN AUTOMÁTICA AL APODERADO
      try {
        // Obtener el apoderado del estudiante
        const estudianteConApoderado = await prisma.estudiantes.findUnique({
          where: { id: parseInt(estudianteId) },
          include: {
            apoderados: {
              select: {
                usuario_id: true,
              },
            },
          },
        });

        if (estudianteConApoderado?.apoderados?.usuario_id) {
          const horaFormateada = horaActualPeru?.toLocaleTimeString('es-PE', { 
            hour: '2-digit', 
            minute: '2-digit',
            timeZone: 'America/Lima'
          }) || 'hora no disponible';
          
          await NotificacionService.crearNotificacionAsistencia(
            parseInt(estudianteId),
            estudianteConApoderado.apoderados.usuario_id,
            {
              hora: horaFormateada,
              estado: asistencia.estado || 'Presente',
              observaciones: asistencia.observaciones || '',
            }
          );

          console.log(`🔔 Notificación enviada al apoderado del estudiante ${estudiante.nombres} ${estudiante.apellidos}`);
        }
      } catch (notificacionError) {
        // No fallar el registro de asistencia si falla la notificación
        console.error('Error al enviar notificación:', notificacionError);
      }

      return c.json({
        success: true,
        message: `${tipoMensaje} registrada exitosamente para ${estudiante.nombres} ${estudiante.apellidos}`,
        asistencia: asistencia
      });

    } catch (error) {
      console.error('Error al registrar asistencia manual:', error);
      return c.json({ message: 'Error interno del servidor' }, 500);
    }
  }

  /**
   * Ejecuta manualmente el marcado de ausencias automáticas
   * Este endpoint es para pruebas y permite ejecutar la funcionalidad sin esperar a las 8 PM
   */
  static async marcarAusenciasManual(c: Context) {
    try {
      const user = c.get('user');
      
      if (!user || user.rol_id !== 3) { // rol_id 3 es para porteros
        return c.json({ 
          success: false,
          message: 'Acceso denegado. Solo porteros pueden ejecutar esta acción.' 
        }, 403);
      }

      console.log('🔧 Ejecutando marcado manual de ausencias por solicitud del portero...');
      
      // Ejecutar el marcado automático de ausencias
      const resultado = await AsistenciaService.marcarAusenciasAutomaticas();

      return c.json({
        success: true,
        message: 'Marcado de ausencias ejecutado correctamente',
        data: {
          ausenciasMarcadas: resultado.ausenciasMarcadas,
          estudiantesProcesados: resultado.estudiantesProcesados,
          estudiantesConAsistencia: resultado.estudiantesConAsistencia,
          detalle: resultado.mensaje
        }
      });

    } catch (error) {
      console.error('Error al ejecutar marcado manual de ausencias:', error);
      return c.json({ 
        success: false,
        message: 'Error interno del servidor al marcar ausencias' 
      }, 500);
    }
  }
}
