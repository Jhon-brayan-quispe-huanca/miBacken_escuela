import { Context } from 'hono';
import { PrismaClient } from '../../generated/prisma';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export class DirectorController {
  // Obtener perfil del director
  static async obtenerPerfil(c: Context) {
    try {
      const user = c.get('user');
      
      if (!user || user.rol_id !== 1) {
        return c.json({ message: 'Acceso denegado. Solo directores pueden acceder.' }, 403);
      }

      const director: any = await prisma.usuarios.findFirst({
        where: {
          id: user.id,
          rol_id: 1,
          activo: true
        },
        include: {
          roles: true
        }
      });

      if (!director) {
        return c.json({ message: 'Director no encontrado' }, 404);
      }

      // Remover password_hash de la respuesta
      const { password_hash, ...directorSinPassword } = director;

      return c.json({
        success: true,
        director: directorSinPassword
      });
    } catch (error) {
      console.error('Error al obtener perfil del director:', error);
      return c.json({ message: 'Error interno del servidor' }, 500);
    }
  }

  // Actualizar perfil del director (excepto DNI)
  static async actualizarPerfil(c: Context) {
    try {
      const user = c.get('user');
      
      if (!user || user.rol_id !== 1) {
        return c.json({ message: 'Acceso denegado. Solo directores pueden acceder.' }, 403);
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

      const director: any = await prisma.usuarios.update({
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
      const { password_hash, ...directorSinPassword } = director;

      return c.json({
        success: true,
        message: 'Perfil actualizado correctamente',
        director: directorSinPassword
      });
    } catch (error) {
      console.error('Error al actualizar perfil del director:', error);
      return c.json({ message: 'Error interno del servidor' }, 500);
    }
  }

  // Obtener estadísticas del dashboard
  static async obtenerEstadisticasDashboard(c: Context) {
    try {
      const user = c.get('user');
      
      if (!user || user.rol_id !== 1) {
        return c.json({ message: 'Acceso denegado. Solo directores pueden acceder.' }, 403);
      }

      // Obtener estadísticas generales
      const [
        totalEstudiantes,
        totalProfesores,
        totalApoderados,
        totalGrados,
        totalSecciones,
        estudiantesActivos,
        profesoresActivos
      ] = await Promise.all([
        prisma.estudiantes.count(),
        prisma.profesores.count(),
        prisma.apoderados.count(),
        prisma.grados.count(),
        prisma.secciones.count(),
        prisma.estudiantes.count({
          where: {
            estado: 'activo'
          }
        }),
        prisma.profesores.count({
          where: {
            usuarios: {
              activo: true
            }
          }
        })
      ]);

      // Obtener asistencia de hoy
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      const asistenciaHoy = await prisma.asistencia_general.count({
        where: {
          fecha: hoy,
          estado: 'Presente'
        }
      });

      // Obtener estudiantes por grado
      const estudiantesPorGrado = await prisma.grados.findMany({
        include: {
          estudiantes: {
            where: {
              estado: 'activo'
            }
          }
        }
      });

      const estadisticasGrados = estudiantesPorGrado.map(grado => ({
        grado: grado.nombre,
        nivel: grado.nivel,
        cantidad: grado.estudiantes.length
      }));

      // Obtener asistencia de la última semana
      const hace7Dias = new Date();
      hace7Dias.setDate(hace7Dias.getDate() - 7);

      const asistenciaSemana = await prisma.asistencia_general.groupBy({
        by: ['fecha'],
        where: {
          fecha: {
            gte: hace7Dias
          }
        },
        _count: {
          id: true
        },
        orderBy: {
          fecha: 'asc'
        }
      });

      const estadisticas = {
        resumen: {
          totalEstudiantes,
          totalProfesores,
          totalApoderados,
          totalGrados,
          totalSecciones,
          estudiantesActivos,
          profesoresActivos,
          asistenciaHoy
        },
        estudiantesPorGrado: estadisticasGrados,
        asistenciaSemana: asistenciaSemana.map(item => ({
          fecha: item.fecha,
          cantidad: item._count.id
        }))
      };

      return c.json({
        success: true,
        estadisticas
      });
    } catch (error) {
      console.error('Error al obtener estadísticas del dashboard:', error);
      return c.json({ message: 'Error interno del servidor' }, 500);
    }
  }

  // Cambiar contraseña
  static async cambiarContrasena(c: Context) {
    try {
      const user = c.get('user');
      
      if (!user || user.rol_id !== 1) {
        return c.json({ message: 'Acceso denegado. Solo directores pueden acceder.' }, 403);
      }

      const { contrasena_actual, nueva_contrasena } = await c.req.json();

      if (!contrasena_actual || !nueva_contrasena) {
        return c.json({ message: 'Contraseña actual y nueva contraseña son requeridas' }, 400);
      }

      if (nueva_contrasena.length < 6) {
        return c.json({ message: 'La nueva contraseña debe tener al menos 6 caracteres' }, 400);
      }

      // Obtener usuario actual
      const director: any = await prisma.usuarios.findFirst({
        where: {
          id: user.id
        }
      });

      if (!director) {
        return c.json({ message: 'Director no encontrado' }, 404);
      }

      // Verificar contraseña actual
      const contrasenaValida = await bcrypt.compare(contrasena_actual, director.password_hash);
      if (!contrasenaValida) {
        return c.json({ message: 'Contraseña actual incorrecta' }, 400);
      }

      // Encriptar nueva contraseña
      const saltRounds = 10;
      const nuevaContrasenaHash = await bcrypt.hash(nueva_contrasena, saltRounds);

      // Actualizar contraseña
      await prisma.usuarios.update({
        where: {
          id: user.id
        },
        data: {
          password_hash: nuevaContrasenaHash,
          updated_at: new Date()
        }
      });

      return c.json({
        success: true,
        message: 'Contraseña cambiada correctamente'
      });
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      return c.json({ message: 'Error interno del servidor' }, 500);
    }
  }

  // Obtener todas las asignaciones
  static async obtenerAsignaciones(c: Context) {
    try {
      const user = c.get('user');
      
      if (!user || user.rol_id !== 1) {
        return c.json({ message: 'Acceso denegado. Solo directores pueden acceder.' }, 403);
      }

      const asignaciones = await prisma.profesor_grado_seccion.findMany({
        include: {
          profesores: {
            include: {
              usuarios: {
                select: {
                  nombres: true,
                  apellidos: true,
                  email: true
                }
              }
            }
          },
          grados: {
            select: {
              id: true,
              nombre: true,
              nivel: true
            }
          },
          secciones: {
            select: {
              id: true,
              nombre: true
            }
          }
        },
        orderBy: [
          { grados: { nombre: 'asc' } },
          { secciones: { nombre: 'asc' } }
        ]
      });

      return c.json({
        success: true,
        asignaciones
      });
    } catch (error) {
      console.error('Error al obtener asignaciones:', error);
      return c.json({ message: 'Error interno del servidor' }, 500);
    }
  }

  // Crear nueva asignación
  static async crearAsignacion(c: Context) {
    try {
      console.log('🔍 DirectorController.crearAsignacion - Iniciando...');
      
      const user = c.get('user');
      console.log('🔍 DirectorController.crearAsignacion - User:', user);
      
      if (!user || user.rol_id !== 1) {
        return c.json({ message: 'Acceso denegado. Solo directores pueden acceder.' }, 403);
      }

      const body = await c.req.json();
      console.log('🔍 DirectorController.crearAsignacion - Body recibido:', body);
      
      const { profesor_id, grado_id, seccion_id, es_tutor, anio_escolar } = body;

      // Validar datos requeridos
      console.log('🔍 DirectorController.crearAsignacion - Validando datos:', {
        profesor_id, grado_id, seccion_id, es_tutor, anio_escolar
      });
      
      if (!profesor_id || !grado_id || !seccion_id || !anio_escolar) {
        console.log('❌ DirectorController.crearAsignacion - Faltan datos requeridos');
        return c.json({ message: 'Faltan datos requeridos' }, 400);
      }

      // Verificar que el profesor existe
      console.log('🔍 DirectorController.crearAsignacion - Buscando profesor con ID:', profesor_id);
      const profesor = await prisma.profesores.findFirst({
        where: { id: profesor_id }
      });
      console.log('🔍 DirectorController.crearAsignacion - Profesor encontrado:', profesor);

      if (!profesor) {
        return c.json({ message: 'Profesor no encontrado' }, 404);
      }

      // Obtener tipo de profesor
      const tipoProfesor = profesor.tipo_profesor || 'aula';

      // Validar límites de asignación según tipo de profesor
      const asignacionesExistentes = await prisma.profesor_grado_seccion.count({
        where: {
          profesor_id: profesor_id,
          anio_escolar: anio_escolar,
          activo: true
        }
      });

      // Definir límites según tipo de profesor
      let limiteAsignaciones: number;
      if (tipoProfesor === 'aula') {
        // Profesores de aula solo pueden tener 1 asignación
        limiteAsignaciones = 1;
      } else {
        // Profesores especiales (computación, educación física, inglés) pueden tener múltiples
        limiteAsignaciones = 15;
      }

      if (asignacionesExistentes >= limiteAsignaciones) {
        const tipoTexto = tipoProfesor === 'aula' ? 'de aula' : 'especiales';
        return c.json({ 
          message: `Los profesores ${tipoTexto} pueden tener máximo ${limiteAsignaciones} asignación${limiteAsignaciones > 1 ? 'es' : ''}` 
        }, 400);
      }

      // Verificar que no exista una asignación duplicada para el mismo profesor
      const asignacionExistente = await prisma.profesor_grado_seccion.findFirst({
        where: {
          profesor_id,
          grado_id,
          seccion_id,
          anio_escolar
        }
      });

      if (asignacionExistente) {
        return c.json({ message: 'Ya existe una asignación para este profesor en este grado y sección' }, 400);
      }

      // NUEVA VALIDACIÓN: Solo bloquear si se intenta asignar dos profesores de tipo "aula"
      if (tipoProfesor === 'aula') {
        const profesorAulaExistente = await prisma.profesor_grado_seccion.findFirst({
          where: {
            grado_id,
            seccion_id,
            anio_escolar,
            activo: true,
            profesores: {
              tipo_profesor: 'aula'
            }
          }
        });

        if (profesorAulaExistente) {
          return c.json({ 
            message: 'Ya existe un profesor de aula asignado a este grado y sección' 
          }, 400);
        }
      }

      // Crear la asignación
      const nuevaAsignacion = await prisma.profesor_grado_seccion.create({
        data: {
          profesor_id,
          grado_id,
          seccion_id,
          es_tutor: es_tutor || false,
          anio_escolar
        },
        include: {
          profesores: {
            include: {
              usuarios: {
                select: {
                  nombres: true,
                  apellidos: true,
                  email: true
                }
              }
            }
          },
          grados: {
            select: {
              id: true,
              nombre: true,
              nivel: true
            }
          },
          secciones: {
            select: {
              id: true,
              nombre: true
            }
          }
        }
      });

      return c.json({
        success: true,
        message: 'Asignación creada correctamente',
        asignacion: nuevaAsignacion
      }, 201);
    } catch (error) {
      console.error('❌ DirectorController.crearAsignacion - Error completo:', error);
      console.error('❌ DirectorController.crearAsignacion - Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('❌ DirectorController.crearAsignacion - Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      return c.json({ 
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : 'No details available'
      }, 500);
    }
  }

  // Actualizar asignación
  static async actualizarAsignacion(c: Context) {
    try {
      const user = c.get('user');
      
      if (!user || user.rol_id !== 1) {
        return c.json({ message: 'Acceso denegado. Solo directores pueden acceder.' }, 403);
      }

      const id = parseInt(c.req.param('id'));
      const { profesor_id, grado_id, seccion_id, es_tutor, anio_escolar } = await c.req.json();

      // Verificar que la asignación existe
      const asignacionExistente = await prisma.profesor_grado_seccion.findUnique({
        where: { id }
      });

      if (!asignacionExistente) {
        return c.json({ message: 'Asignación no encontrada' }, 404);
      }

      // Actualizar la asignación
      const asignacionActualizada = await prisma.profesor_grado_seccion.update({
        where: { id },
        data: {
          profesor_id,
          grado_id,
          seccion_id,
          es_tutor: es_tutor || false,
          anio_escolar
        },
        include: {
          profesores: {
            include: {
              usuarios: {
                select: {
                  nombres: true,
                  apellidos: true,
                  email: true
                }
              }
            }
          },
          grados: {
            select: {
              id: true,
              nombre: true,
              nivel: true
            }
          },
          secciones: {
            select: {
              id: true,
              nombre: true
            }
          }
        }
      });

      return c.json({
        success: true,
        message: 'Asignación actualizada correctamente',
        asignacion: asignacionActualizada
      });
    } catch (error) {
      console.error('Error al actualizar asignación:', error);
      return c.json({ message: 'Error interno del servidor' }, 500);
    }
  }

  // Eliminar asignación
  static async eliminarAsignacion(c: Context) {
    try {
      const user = c.get('user');
      
      if (!user || user.rol_id !== 1) {
        return c.json({ message: 'Acceso denegado. Solo directores pueden acceder.' }, 403);
      }

      const id = parseInt(c.req.param('id'));

      // Verificar que la asignación existe
      const asignacionExistente = await prisma.profesor_grado_seccion.findUnique({
        where: { id }
      });

      if (!asignacionExistente) {
        return c.json({ message: 'Asignación no encontrada' }, 404);
      }

      // Eliminar la asignación
      await prisma.profesor_grado_seccion.delete({
        where: { id }
      });

      return c.json({
        success: true,
        message: 'Asignación eliminada correctamente'
      });
    } catch (error) {
      console.error('Error al eliminar asignación:', error);
      return c.json({ message: 'Error interno del servidor' }, 500);
    }
  }

  // Obtener grados
  static async obtenerGrados(c: Context) {
    try {
      const user = c.get('user');
      
      if (!user || user.rol_id !== 1) {
        return c.json({ message: 'Acceso denegado. Solo directores pueden acceder.' }, 403);
      }

      const grados = await prisma.grados.findMany({
        where: {
          nivel: 'Primaria' // Solo grados de primaria
        },
        select: {
          id: true,
          nombre: true,
          nivel: true
        },
        orderBy: {
          nombre: 'asc'
        }
      });

      return c.json({
        success: true,
        grados
      });
    } catch (error) {
      console.error('Error al obtener grados:', error);
      return c.json({ message: 'Error interno del servidor' }, 500);
    }
  }

  // Obtener secciones
  static async obtenerSecciones(c: Context) {
    try {
      const user = c.get('user');
      
      if (!user || user.rol_id !== 1) {
        return c.json({ message: 'Acceso denegado. Solo directores pueden acceder.' }, 403);
      }

      const secciones = await prisma.secciones.findMany({
        select: {
          id: true,
          nombre: true
        },
        orderBy: {
          nombre: 'asc'
        }
      });

      return c.json({
        success: true,
        secciones
      });
    } catch (error) {
      console.error('Error al obtener secciones:', error);
      return c.json({ message: 'Error interno del servidor' }, 500);
    }
  }

  // Obtener materias
  static async obtenerMaterias(c: Context) {
    try {
      const user = c.get('user');
      
      if (!user || user.rol_id !== 1) {
        return c.json({ message: 'Acceso denegado. Solo directores pueden acceder.' }, 403);
      }


      return c.json({
        success: true,
        materias: [] // materias comentado temporalmente
      });
    } catch (error) {
      console.error('Error al obtener materias:', error);
      return c.json({ message: 'Error interno del servidor' }, 500);
    }
  }

  // Obtener profesores
  static async obtenerProfesores(c: Context) {
    try {
      const user = c.get('user');
      
      if (!user || user.rol_id !== 1) {
        return c.json({ message: 'Acceso denegado. Solo directores pueden acceder.' }, 403);
      }

      const profesores = await prisma.profesores.findMany({
        include: {
          usuarios: {
            select: {
              id: true,
              nombres: true,
              apellidos: true,
              email: true,
              activo: true
            }
          }
        },
        where: {
          usuarios: {
            activo: true
          }
        },
        orderBy: {
          usuarios: {
            nombres: 'asc'
          }
        }
      });

      return c.json({
        success: true,
        profesores
      });
    } catch (error) {
      console.error('Error al obtener profesores:', error);
      return c.json({ message: 'Error interno del servidor' }, 500);
    }
  }

  // Obtener asistencia por salón con filtros
  static async obtenerAsistenciaPorSalon(c: Context) {
    try {
      const user = c.get('user');
      
      if (!user || user.rol_id !== 1) {
        return c.json({ message: 'Acceso denegado. Solo directores pueden acceder.' }, 403);
      }

      const { grado_id, seccion_id, fecha, profesor_id } = c.req.query();

      console.log('🔍 DirectorController: Obteniendo asistencia por salón:', { grado_id, seccion_id, fecha, profesor_id });

      // Validar parámetros requeridos
      if (!grado_id || !seccion_id || !fecha) {
        return c.json({ 
          message: 'Los parámetros grado_id, seccion_id y fecha son requeridos' 
        }, 400);
      }

      // Convertir fecha a objeto Date en UTC para evitar problemas de zona horaria
      const fechaConsulta = new Date(fecha as string + 'T00:00:00.000Z');

      // Obtener todos los estudiantes del grado y sección especificados
      const estudiantes = await prisma.estudiantes.findMany({
        where: {
          grado_id: parseInt(grado_id as string),
          seccion_id: parseInt(seccion_id as string),
          estado: 'activo'
        },
        include: {
          grados: {
            select: {
              nombre: true,
              nivel: true
            }
          },
          secciones: {
            select: {
              nombre: true
            }
          }
        },
        orderBy: {
          apellidos: 'asc'
        }
      });

      // Obtener las asistencias de esos estudiantes para la fecha especificada
      const asistencias = await prisma.asistencia_salon.findMany({
        where: {
          estudiante_id: {
            in: estudiantes.map(e => e.id)
          },
          fecha: fechaConsulta
        },
        include: {
          profesores: {
            include: {
              usuarios: {
                select: {
                  nombres: true,
                  apellidos: true
                }
              }
            }
          }
        }
      });

      // Crear un mapa de asistencias por estudiante_id para acceso rápido
      const asistenciasMap = new Map();
      asistencias.forEach(asistencia => {
        asistenciasMap.set(asistencia.estudiante_id, asistencia);
      });

      // Combinar datos de estudiantes con sus asistencias
      const resultado = estudiantes.map(estudiante => {
        const asistencia = asistenciasMap.get(estudiante.id);
        
        return {
          estudiante_id: estudiante.id,
          codigo_estudiante: estudiante.codigo_estudiante,
          nombre_completo: `${estudiante.nombres} ${estudiante.apellidos}`,
          nombres: estudiante.nombres,
          apellidos: estudiante.apellidos,
          dni: estudiante.dni,
          grado: estudiante.grados.nombre,
          nivel: estudiante.grados.nivel,
          seccion: estudiante.secciones.nombre,
          estado_asistencia: asistencia?.estado || 'Sin registrar',
          profesor_registro: asistencia ? 
            `${asistencia.profesores.nombres} ${asistencia.profesores.apellidos}` : 
            null,
          fecha_registro: asistencia?.created_at || null,
          observaciones: asistencia?.observaciones || null
        };
      });

      // Obtener estadísticas de asistencia
      const estadisticas = {
        total_estudiantes: estudiantes.length,
        presentes: resultado.filter(r => r.estado_asistencia === 'Presente').length,
        ausentes: resultado.filter(r => r.estado_asistencia === 'Ausente').length,
        tardanzas: resultado.filter(r => r.estado_asistencia === 'Tardanza').length,
        justificados: resultado.filter(r => r.estado_asistencia === 'Justificado').length,
        sin_registrar: resultado.filter(r => r.estado_asistencia === 'Sin registrar').length
      };

      return c.json({
        success: true,
        data: {
          fecha: fechaConsulta,
          grado_id: parseInt(grado_id as string),
          seccion_id: parseInt(seccion_id as string),
          estudiantes: resultado,
          estadisticas
        }
      });
    } catch (error) {
      console.error('Error al obtener asistencia por salón:', error);
      return c.json({ message: 'Error interno del servidor' }, 500);
    }
  }

  // Obtener estadísticas del dashboard
  static async obtenerEstadisticas(c: Context) {
    try {
      const user = c.get('user');
      
      if (!user || user.rol_id !== 1) {
        return c.json({ message: 'Acceso denegado. Solo directores pueden acceder.' }, 403);
      }

      // Conteo de estudiantes activos
      const totalEstudiantes = await prisma.estudiantes.count({
        where: { estado: 'Activo' }
      });

      // Conteo de profesores activos
      const totalProfesores = await prisma.profesores.count({
        where: { 
          usuarios: {
            activo: true
          }
        }
      });

      // Conteo de grados
      const totalGrados = await prisma.grados.count();

      // Conteo de secciones
      const totalSecciones = await prisma.secciones.count();

      // Conteo de usuarios activos
      const totalUsuariosActivos = await prisma.usuarios.count({
        where: { activo: true }
      });

      // Conteo de permisos pendientes
      const totalPermisosPendientes = await prisma.solicitudes_permisos.count({
        where: { estado: 'Pendiente' }
      });

      // Calcular asistencia promedio (simplificado)
      const asistenciaHoy = await prisma.asistencia_general.count({
        where: {
          fecha: {
            gte: new Date(new Date().setDate(new Date().getDate() - 30)) // Últimos 30 días
          },
          estado: 'Presente'
        }
      });

      const totalAsistencias = await prisma.asistencia_general.count({
        where: {
          fecha: {
            gte: new Date(new Date().setDate(new Date().getDate() - 30)) // Últimos 30 días
          }
        }
      });

      const asistenciaPromedio = totalAsistencias > 0 ? Math.round((asistenciaHoy / totalAsistencias) * 100) : 0;

      return c.json({
        success: true,
        data: {
          estudiantes: totalEstudiantes,
          profesores: totalProfesores,
          grados: totalGrados,
          secciones: totalSecciones,
          usuariosActivos: totalUsuariosActivos,
          permisosPendientes: totalPermisosPendientes,
          asistenciaPromedio: Math.round(asistenciaPromedio)
        }
      });
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      return c.json({
        success: false,
        message: 'Error interno del servidor'
      }, 500);
    }
  }
}
