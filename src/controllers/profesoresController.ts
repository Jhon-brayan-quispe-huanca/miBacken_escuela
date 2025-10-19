import { Context } from 'hono';
import { PrismaClient } from '../../generated/prisma/index.js';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export class ProfesoresController {
  // Obtener todos los profesores con paginación
  static async obtenerProfesores(c: Context) {
    try {
      const user = c.get('user');
      
      console.log('🔍 ProfesoresController.obtenerProfesores - Usuario recibido:', user);
      console.log('🔍 Verificación: user existe?', !!user);
      console.log('🔍 Verificación: user.rol_id =', user?.rol_id);
      console.log('🔍 Verificación: user.rol_id !== 1 =', user?.rol_id !== 1);
      
      if (!user || user.rol_id !== 1) {
        console.log('❌ Acceso denegado - Usuario:', user);
        return c.json({ message: 'Acceso denegado. Solo directores pueden acceder.' }, 403);
      }

      const page = parseInt(c.req.query('page') || '1');
      const limit = parseInt(c.req.query('limit') || '10');
      const search = c.req.query('search') || '';
      const activo = c.req.query('activo') || '';
      const tipo_profesor = c.req.query('tipo_profesor') || '';

      const skip = (page - 1) * limit;

      // Construir filtros
      const where: any = {};
      
      if (search) {
        where.OR = [
          { usuarios: { nombres: { contains: search, mode: 'insensitive' } } },
          { usuarios: { apellidos: { contains: search, mode: 'insensitive' } } },
          { codigo_profesor: { contains: search, mode: 'insensitive' } },
          { especialidad: { contains: search, mode: 'insensitive' } }
        ];
      }

      if (activo !== '') {
        where.usuarios = {
          activo: activo === 'true'
        };
      }

      if (tipo_profesor !== '') {
        where.tipo_profesor = tipo_profesor;
      }

      const [profesores, total] = await Promise.all([
        prisma.profesores.findMany({
          where,
          skip,
          take: limit,
          include: {
            usuarios: {
              select: {
                id: true,
                dni: true,
                nombres: true,
                apellidos: true,
                email: true,
                telefono: true,
                direccion: true,
                fecha_nacimiento: true,
                genero: true,
                activo: true
              }
            },
            profesor_grado_seccion: {
              where: {
                activo: true,
                anio_escolar: new Date().getFullYear()
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
              }
            }
          },
          orderBy: [
            { usuarios: { apellidos: 'asc' } },
            { usuarios: { nombres: 'asc' } }
          ]
        }),
        prisma.profesores.count({ where })
      ]);

      return c.json({
        success: true,
        data: profesores,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error al obtener profesores:', error);
      return c.json({ message: 'Error interno del servidor' }, 500);
    }
  }

  // Obtener un profesor por ID
  static async obtenerProfesorPorId(c: Context) {
    try {
      const user = c.get('user');
      
      if (!user || user.rol_id !== 1) {
        return c.json({ message: 'Acceso denegado. Solo directores pueden acceder.' }, 403);
      }

      const id = parseInt(c.req.param('id'));

      const profesor = await prisma.profesores.findUnique({
        where: { id },
        include: {
          usuarios: {
            select: {
              id: true,
              dni: true,
              nombres: true,
              apellidos: true,
              email: true,
              telefono: true,
              direccion: true,
              fecha_nacimiento: true,
              genero: true,
              activo: true
            }
          },
          profesor_grado_seccion: {
            include: {
              grados: true,
              secciones: true
            }
          }
        }
      });

      if (!profesor) {
        return c.json({ message: 'Profesor no encontrado' }, 404);
      }

      return c.json({
        success: true,
        data: profesor
      });
    } catch (error) {
      console.error('Error al obtener profesor:', error);
      return c.json({ message: 'Error interno del servidor' }, 500);
    }
  }

  // Crear nuevo profesor
  static async crearProfesor(c: Context) {
    try {
      const user = c.get('user');
      
      if (!user || user.rol_id !== 1) {
        return c.json({ message: 'Acceso denegado. Solo directores pueden acceder.' }, 403);
      }

      const body = await c.req.json();
      const {
        dni,
        nombres,
        apellidos,
        email,
        telefono,
        direccion,
        fecha_nacimiento,
        genero,
        especialidad,
        fecha_ingreso,
        codigo_profesor,
        tipo_profesor
      } = body;

      // Validaciones básicas
      if (!nombres || !apellidos || !especialidad) {
        return c.json({ 
          message: 'Campos requeridos: nombres, apellidos, especialidad' 
        }, 400);
      }

      // Validar tipo_profesor
      if (tipo_profesor && !['aula', 'especial'].includes(tipo_profesor)) {
        return c.json({ 
          message: 'El tipo de profesor debe ser "aula" o "especial"' 
        }, 400);
      }

      // Verificar que el código de profesor no exista
      if (codigo_profesor) {
        const existeCodigo = await prisma.profesores.findUnique({
          where: { codigo_profesor }
        });
        if (existeCodigo) {
          return c.json({ message: 'El código de profesor ya existe' }, 400);
        }
      }

      // Verificar que el DNI no exista si se proporciona
      if (dni) {
        const existeDni = await prisma.usuarios.findFirst({
          where: { dni }
        });
        if (existeDni) {
          return c.json({ message: 'El DNI ya está registrado' }, 400);
        }
      }

      // Verificar que el email no exista si se proporciona
      if (email) {
        const existeEmail = await prisma.usuarios.findFirst({
          where: { email }
        });
        if (existeEmail) {
          return c.json({ message: 'El email ya está registrado' }, 400);
        }
      }

      // Generar contraseña temporal
      const passwordTemporal = `prof${dni || Math.random().toString(36).substring(2, 8)}`;
      const passwordHash = await bcrypt.hash(passwordTemporal, 10);

      // Crear usuario y profesor en una transacción
      const resultado = await prisma.$transaction(async (tx) => {
        // Crear usuario
        const nuevoUsuario = await tx.usuarios.create({
          data: {
            dni,
            nombres,
            apellidos,
            email,
            telefono,
            direccion,
            fecha_nacimiento: fecha_nacimiento ? new Date(fecha_nacimiento) : null,
            genero,
            rol_id: 2, // Rol de profesor
            password_hash: passwordHash,
            activo: true
          }
        });

        // Crear profesor
        const nuevoProfesor = await tx.profesores.create({
          data: {
            usuario_id: nuevoUsuario.id,
            especialidad,
            fecha_ingreso: fecha_ingreso ? new Date(fecha_ingreso) : new Date(),
            codigo_profesor: codigo_profesor || `PROF${nuevoUsuario.id.toString().padStart(4, '0')}`,
            tipo_profesor: tipo_profesor || 'aula'
          },
          include: {
            usuarios: {
              select: {
                id: true,
                dni: true,
                nombres: true,
                apellidos: true,
                email: true,
                telefono: true,
                direccion: true,
                fecha_nacimiento: true,
                genero: true,
                activo: true
              }
            }
          }
        });

        return nuevoProfesor;
      });

      return c.json({
        success: true,
        message: 'Profesor creado exitosamente',
        data: resultado,
        password_temporal: passwordTemporal
      }, 201);
    } catch (error) {
      console.error('Error al crear profesor:', error);
      return c.json({ message: 'Error interno del servidor' }, 500);
    }
  }

  // Actualizar profesor
  static async actualizarProfesor(c: Context) {
    try {
      const user = c.get('user');
      
      if (!user || user.rol_id !== 1) {
        return c.json({ message: 'Acceso denegado. Solo directores pueden acceder.' }, 403);
      }

      const id = parseInt(c.req.param('id'));
      const body = await c.req.json();
      const {
        nombres,
        apellidos,
        email,
        telefono,
        direccion,
        fecha_nacimiento,
        genero,
        especialidad,
        fecha_ingreso,
        codigo_profesor,
        tipo_profesor
      } = body;

      // Verificar que el profesor existe
      const profesorExistente = await prisma.profesores.findUnique({
        where: { id },
        include: { usuarios: true }
      });

      if (!profesorExistente) {
        return c.json({ message: 'Profesor no encontrado' }, 404);
      }

      // Verificar código único si se está actualizando
      if (codigo_profesor && codigo_profesor !== profesorExistente.codigo_profesor) {
        const existeCodigo = await prisma.profesores.findUnique({
          where: { codigo_profesor }
        });
        if (existeCodigo) {
          return c.json({ message: 'El código de profesor ya existe' }, 400);
        }
      }

      // Verificar email único si se está actualizando
      if (email && email !== profesorExistente.usuarios.email) {
        const existeEmail = await prisma.usuarios.findFirst({
          where: { 
            email,
            id: { not: profesorExistente.usuario_id }
          }
        });
        if (existeEmail) {
          return c.json({ message: 'El email ya está registrado' }, 400);
        }
      }

      // Validar tipo_profesor
      if (tipo_profesor && !['aula', 'especial'].includes(tipo_profesor)) {
        return c.json({ 
          message: 'El tipo de profesor debe ser "aula" o "especial"' 
        }, 400);
      }

      // Actualizar en transacción
      const profesorActualizado = await prisma.$transaction(async (tx) => {
        // Actualizar usuario
        await tx.usuarios.update({
          where: { id: profesorExistente.usuario_id },
          data: {
            nombres,
            apellidos,
            email,
            telefono,
            direccion,
            fecha_nacimiento: fecha_nacimiento ? new Date(fecha_nacimiento) : null,
            genero
          }
        });

        // Actualizar profesor
        return await tx.profesores.update({
          where: { id },
          data: {
            especialidad,
            fecha_ingreso: fecha_ingreso ? new Date(fecha_ingreso) : null,
            codigo_profesor,
            ...(tipo_profesor && { tipo_profesor })
          },
          include: {
            usuarios: {
              select: {
                id: true,
                dni: true,
                nombres: true,
                apellidos: true,
                email: true,
                telefono: true,
                direccion: true,
                fecha_nacimiento: true,
                genero: true,
                activo: true
              }
            }
          }
        });
      });

      return c.json({
        success: true,
        message: 'Profesor actualizado exitosamente',
        data: profesorActualizado
      });
    } catch (error) {
      console.error('Error al actualizar profesor:', error);
      return c.json({ message: 'Error interno del servidor' }, 500);
    }
  }

  // Cambiar estado del profesor (activar/desactivar)
  static async cambiarEstadoProfesor(c: Context) {
    try {
      const user = c.get('user');
      
      if (!user || user.rol_id !== 1) {
        return c.json({ message: 'Acceso denegado. Solo directores pueden acceder.' }, 403);
      }

      const id = parseInt(c.req.param('id'));
      const { activo } = await c.req.json();

      const profesorActualizado = await prisma.$transaction(async (tx) => {
        const profesor = await tx.profesores.findUnique({
          where: { id },
          include: { usuarios: true }
        });

        if (!profesor) {
          throw new Error('Profesor no encontrado');
        }

        // Actualizar estado del usuario
        await tx.usuarios.update({
          where: { id: profesor.usuario_id },
          data: { activo }
        });

        return await tx.profesores.findUnique({
          where: { id },
          include: {
            usuarios: {
              select: {
                id: true,
                dni: true,
                nombres: true,
                apellidos: true,
                email: true,
                telefono: true,
                direccion: true,
                fecha_nacimiento: true,
                genero: true,
                activo: true
              }
            }
          }
        });
      });

      return c.json({
        success: true,
        message: `Profesor ${activo ? 'activado' : 'desactivado'} exitosamente`,
        data: profesorActualizado
      });
    } catch (error) {
      console.error('Error al cambiar estado del profesor:', error);
      return c.json({ message: 'Error interno del servidor' }, 500);
    }
  }

  // Eliminar profesor (soft delete)
  static async eliminarProfesor(c: Context) {
    try {
      const user = c.get('user');
      
      if (!user || user.rol_id !== 1) {
        return c.json({ message: 'Acceso denegado. Solo directores pueden acceder.' }, 403);
      }

      const id = parseInt(c.req.param('id'));

      const profesor = await prisma.profesores.findUnique({
        where: { id },
        include: { usuarios: true }
      });

      if (!profesor) {
        return c.json({ message: 'Profesor no encontrado' }, 404);
      }

      // Soft delete: desactivar usuario
      await prisma.usuarios.update({
        where: { id: profesor.usuario_id },
        data: { activo: false }
      });

      return c.json({
        success: true,
        message: 'Profesor eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error al eliminar profesor:', error);
      return c.json({ message: 'Error interno del servidor' }, 500);
    }
  }

  // Asignar profesor a grado/sección/materia
  static async asignarProfesorGradoSeccion(c: Context) {
    try {
      const user = c.get('user');
      
      if (!user || user.rol_id !== 1) {
        return c.json({ message: 'Acceso denegado. Solo directores pueden acceder.' }, 403);
      }

      const profesorId = parseInt(c.req.param('id'));
      const body = await c.req.json();
      const {
        grado_id,
        seccion_id,
        es_tutor,
        anio_escolar
      } = body;

      // Validaciones básicas
      if (!grado_id || !seccion_id || !anio_escolar) {
        return c.json({ 
          message: 'Campos requeridos: grado_id, seccion_id, anio_escolar' 
        }, 400);
      }

      // Verificar que el profesor existe
      const profesor = await prisma.profesores.findUnique({
        where: { id: profesorId }
      });

      if (!profesor) {
        return c.json({ message: 'Profesor no encontrado' }, 404);
      }

      // Validar límites de asignación según tipo de profesor
      const tipoProfesor = profesor.tipo_profesor || 'aula';
      const asignacionesExistentes = await prisma.profesor_grado_seccion.count({
        where: {
          profesor_id: profesorId,
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

      // NUEVA VALIDACIÓN: Solo bloquear si se intenta asignar dos profesores de tipo "aula"
      if (tipoProfesor === 'aula') {
        const profesorAulaExistente = await prisma.profesor_grado_seccion.findFirst({
          where: {
            grado_id,
            seccion_id,
            anio_escolar,
            activo: true,
            profesor_id: { not: profesorId }, // Excluir el mismo profesor si es edición
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

      // Si es tutor, verificar que no haya otro tutor para esa sección en el mismo año
      if (es_tutor) {
        const tutorExistente = await prisma.profesor_grado_seccion.findFirst({
          where: {
            grado_id,
            seccion_id,
            anio_escolar,
            es_tutor: true,
            activo: true,
            profesor_id: { not: profesorId }
          }
        });

        if (tutorExistente) {
          return c.json({ 
            message: 'Ya existe un tutor asignado para esta sección en el año escolar especificado' 
          }, 400);
        }
      }

      const asignacion = await prisma.profesor_grado_seccion.create({
        data: {
          profesor_id: profesorId,
          grado_id,
          seccion_id,
          es_tutor: es_tutor || false,
          anio_escolar,
          activo: true
        },
        include: {
          grados: true,
          secciones: true,
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

      return c.json({
        success: true,
        message: 'Asignación creada exitosamente',
        data: asignacion
      }, 201);
    } catch (error) {
      console.error('Error al asignar profesor:', error);
      return c.json({ message: 'Error interno del servidor' }, 500);
    }
  }

  // Obtener materias para formularios
  static async obtenerMaterias(c: Context) {
    try {
      const user = c.get('user');
      
      if (!user || user.rol_id !== 1) {
        return c.json({ message: 'Acceso denegado. Solo directores pueden acceder.' }, 403);
      }

      // const materias = await prisma.materias.findMany({
      //   orderBy: { nombre: 'asc' }
      // });

      return c.json({
        success: true,
        data: [] // materias comentado temporalmente
      });
    } catch (error) {
      console.error('Error al obtener materias:', error);
      return c.json({ message: 'Error interno del servidor' }, 500);
    }
  }

  // Obtener asignaciones de un profesor
  static async obtenerAsignacionesProfesor(c: Context) {
    try {
      const user = c.get('user');
      
      if (!user || user.rol_id !== 1) {
        return c.json({ message: 'Acceso denegado. Solo directores pueden acceder.' }, 403);
      }

      const page = parseInt(c.req.query('page') || '1');
      const limit = parseInt(c.req.query('limit') || '10');
      const search = c.req.query('search') || '';
      const activo = c.req.query('activo') || '';

      const skip = (page - 1) * limit;

      // Construir filtros
      const where: any = {};
      
      if (search) {
        where.OR = [
          { usuarios: { nombres: { contains: search, mode: 'insensitive' } } },
          { usuarios: { apellidos: { contains: search, mode: 'insensitive' } } },
          { codigo_profesor: { contains: search, mode: 'insensitive' } },
          { especialidad: { contains: search, mode: 'insensitive' } }
        ];
      }

      if (activo !== '') {
        where.usuarios = {
          activo: activo === 'true'
        };
      }

      const [profesores, total] = await Promise.all([
        prisma.profesores.findMany({
          where,
          skip,
          take: limit,
          include: {
            usuarios: {
              select: {
                id: true,
                dni: true,
                nombres: true,
                apellidos: true,
                email: true,
                telefono: true,
                direccion: true,
                fecha_nacimiento: true,
                genero: true,
                activo: true
              }
            },
            profesor_grado_seccion: {
              where: {
                activo: true,
                anio_escolar: new Date().getFullYear()
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
              }
            }
          },
          orderBy: [
            { usuarios: { apellidos: 'asc' } },
            { usuarios: { nombres: 'asc' } }
          ]
        }),
        prisma.profesores.count({ where })
      ]);

      return c.json({
        success: true,
        data: profesores,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error al obtener profesores:', error);
      return c.json({ message: 'Error interno del servidor' }, 500);
    }
  }

  // Eliminar asignación de profesor
  static async eliminarAsignacionProfesor(c: Context) {
    try {
      const user = c.get('user');
      
      if (!user || user.rol_id !== 1) {
        return c.json({ message: 'Acceso denegado. Solo directores pueden acceder.' }, 403);
      }

      const id = parseInt(c.req.param('id'));

      const profesor = await prisma.profesores.findUnique({
        where: { id },
        include: { usuarios: true }
      });

      if (!profesor) {
        return c.json({ message: 'Profesor no encontrado' }, 404);
      }

      // Soft delete: desactivar usuario
      await prisma.usuarios.update({
        where: { id: profesor.usuario_id },
        data: { activo: false }
      });

      return c.json({
        success: true,
        message: 'Profesor eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error al eliminar profesor:', error);
      return c.json({ message: 'Error interno del servidor' }, 500);
    }
  }
}