import { Context } from 'hono';
import { PrismaClient } from '../../generated/prisma/index.js';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export class UsuariosController {
  // Obtener todos los usuarios con paginación
  static async obtenerUsuarios(c: Context) {
    try {
      const user = c.get('user');
      
      if (!user || user.rol_id !== 1) {
        return c.json({ 
          success: false, 
          message: 'Acceso denegado. Solo directores pueden acceder.' 
        }, 403);
      }

      const page = parseInt(c.req.query('page') || '1');
      const limit = parseInt(c.req.query('limit') || '10');
      const search = c.req.query('search') || '';
      const rolId = c.req.query('rol_id');
      const activo = c.req.query('activo');

      const skip = (page - 1) * limit;

      // Construir filtros
      const where: any = {};
      
      if (search) {
        where.OR = [
          { nombres: { contains: search, mode: 'insensitive' } },
          { apellidos: { contains: search, mode: 'insensitive' } },
          { dni: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ];
      }

      if (rolId) {
        where.rol_id = parseInt(rolId);
      }

      if (activo !== undefined && activo !== '') {
        where.activo = activo === 'true';
      }

      const [usuarios, total] = await Promise.all([
        prisma.usuarios.findMany({
          where,
          skip,
          take: limit,
          include: {
            roles: {
              select: {
                id: true,
                nombre: true,
                descripcion: true,
                requiere_dni: true,
                puede_login_email: true
              }
            }
          },
          orderBy: {
            created_at: 'desc'
          }
        }),
        prisma.usuarios.count({ where })
      ]);

      // Omitir password_hash en la respuesta
      const usuariosLimpios = usuarios.map(usuario => {
        const { password_hash, ...usuarioSinPassword } = usuario;
        return usuarioSinPassword;
      });

      const totalPaginas = Math.ceil(total / limit);

      return c.json({
        success: true,
        data: {
          usuarios: usuariosLimpios,
          total,
          pagina: page,
          limite: limit,
          totalPaginas
        }
      });

    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      return c.json({ 
        success: false, 
        message: 'Error interno del servidor' 
      }, 500);
    }
  }

  // Obtener usuario por ID
  static async obtenerUsuarioPorId(c: Context) {
    try {
      const user = c.get('user');
      
      if (!user || user.rol_id !== 1) {
        return c.json({ 
          success: false, 
          message: 'Acceso denegado. Solo directores pueden acceder.' 
        }, 403);
      }

      const id = parseInt(c.req.param('id'));

      if (isNaN(id)) {
        return c.json({ 
          success: false, 
          message: 'ID de usuario inválido' 
        }, 400);
      }

      const usuario = await prisma.usuarios.findUnique({
        where: { id },
        include: {
          roles: {
            select: {
              id: true,
              nombre: true,
              descripcion: true,
              requiere_dni: true,
              puede_login_email: true
            }
          },
          apoderados: {
            include: {
              usuarios: {
                select: {
                  id: true,
                  dni: true,
                  nombres: true,
                  apellidos: true,
                  email: true,
                  telefono: true,
                  direccion: true
                }
              }
            }
          },
          profesores: {
            select: {
              id: true,
              tipo_profesor: true,
              especialidad: true
            }
          }
        }
      });

      if (!usuario) {
        return c.json({ 
          success: false, 
          message: 'Usuario no encontrado' 
        }, 404);
      }

      // Omitir password_hash en la respuesta
      const { password_hash, ...usuarioSinPassword } = usuario;

      // Transformar datos de apoderados para que coincidan con el modelo del frontend
      console.log('🔍 DEBUG - Verificando si hay apoderados...');
      console.log('🔍 DEBUG - apoderados existe:', !!(usuarioSinPassword as any).apoderados);
      console.log('🔍 DEBUG - apoderados length:', (usuarioSinPassword as any).apoderados?.length);
      
      if ((usuarioSinPassword as any).apoderados && (usuarioSinPassword as any).apoderados.length > 0) {
        console.log('🔍 DEBUG - Transformando datos de apoderados...');
        console.log('🔍 DEBUG - Datos originales del apoderado:', (usuarioSinPassword as any).apoderados[0]);
        
        (usuarioSinPassword as any).apoderados = (usuarioSinPassword as any).apoderados.map((apoderado: any) => {
          const apoderadoTransformado = {
            id: apoderado.id,
            dni: usuarioSinPassword.dni,
            nombres: usuarioSinPassword.nombres,
            apellidos: usuarioSinPassword.apellidos,
            email: usuarioSinPassword.email,
            telefono: usuarioSinPassword.telefono,
            direccion: apoderado.direccion || '',
            activo: usuarioSinPassword.activo
          };
          
          console.log('🔍 DEBUG - Apoderado transformado:', apoderadoTransformado);
          return apoderadoTransformado;
        });
      } else {
        console.log('🔍 DEBUG - No hay datos de apoderado para transformar');
        console.log('🔍 DEBUG - Usuario sin apoderados:', {
          id: usuarioSinPassword.id,
          nombres: usuarioSinPassword.nombres,
          apellidos: usuarioSinPassword.apellidos,
          rol_id: usuarioSinPassword.rol_id
        });
      }

      // Debug: Verificar datos del usuario
      console.log('🔍 DEBUG - Usuario encontrado:', {
        id: usuarioSinPassword.id,
        nombres: usuarioSinPassword.nombres,
        apellidos: usuarioSinPassword.apellidos,
        rol_id: usuarioSinPassword.rol_id,
        apoderados: (usuarioSinPassword as any).apoderados
      });

      // Debug específico para apoderados
      if ((usuarioSinPassword as any).apoderados && (usuarioSinPassword as any).apoderados.length > 0) {
        console.log('🔍 DEBUG - Datos del apoderado que se enviarán al frontend:');
        (usuarioSinPassword as any).apoderados.forEach((apoderado: any, index: number) => {
          console.log(`  Apoderado ${index + 1}:`, {
            id: apoderado.id,
            dni: apoderado.dni,
            nombres: apoderado.nombres,
            apellidos: apoderado.apellidos,
            email: apoderado.email,
            telefono: apoderado.telefono,
            direccion: apoderado.direccion,
            ocupacion: apoderado.ocupacion,
            telefono_emergencia: apoderado.telefono_emergencia,
            activo: apoderado.activo
          });
        });
      } else {
        console.log('🔍 DEBUG - No hay datos de apoderado para enviar al frontend');
        console.log('🔍 DEBUG - Verificando si el usuario tiene rol apoderado...');
        console.log('🔍 DEBUG - Rol del usuario:', (usuarioSinPassword as any).roles?.nombre);
        console.log('🔍 DEBUG - Usuario completo:', JSON.stringify(usuarioSinPassword, null, 2));
      }


      return c.json({
        success: true,
        data: usuarioSinPassword
      });

    } catch (error) {
      console.error('Error al obtener usuario:', error);
      return c.json({ 
        success: false, 
        message: 'Error interno del servidor' 
      }, 500);
    }
  }

  // Crear nuevo usuario
  static async crearUsuario(c: Context) {
    try {
      const user = c.get('user');
      
      if (!user || user.rol_id !== 1) {
        return c.json({ 
          success: false, 
          message: 'Acceso denegado. Solo directores pueden acceder.' 
        }, 403);
      }

      const body = await c.req.json();
      console.log('🔍 Datos recibidos para crear usuario:', JSON.stringify(body, null, 2));
      
      const { 
        dni, 
        nombres, 
        apellidos, 
        email, 
        telefono, 
        direccion, 
        fecha_nacimiento, 
        genero, 
        rol_id, 
        password,
        activo = true,
        turno,
        apoderado, // Datos del apoderado para crear
        // Campos adicionales para profesores
        tipo_profesor,
        especialidad,
        codigo_profesor,
        fecha_ingreso
      } = body;

      // Verificar que el rol_id es válido (1-4)
      if (rol_id < 1 || rol_id > 4) {
        return c.json({ 
          success: false, 
          message: 'El rol_id debe ser entre 1 y 4 (1=Director, 2=Profesor, 3=Portero, 4=Apoderado)' 
        }, 400);
      }

      // Verificar que el rol existe
      const rol = await prisma.roles.findUnique({
        where: { id: rol_id }
      });

      if (!rol) {
        return c.json({ 
          success: false, 
          message: 'El rol especificado no existe. Ejecute el seed para crear los roles fijos.' 
        }, 400);
      }

      // Validaciones básicas
      console.log('🔍 Validando campos obligatorios:');
      console.log('  - dni:', dni);
      console.log('  - nombres:', nombres);
      console.log('  - apellidos:', apellidos);
      console.log('  - rol_id:', rol_id);
      console.log('  - password:', password ? '***' : 'undefined');
      
      if (!dni || !nombres || !apellidos || !rol_id || !password) {
        console.log('❌ Faltan campos obligatorios');
        return c.json({ 
          success: false, 
          message: 'Faltan campos obligatorios: dni, nombres, apellidos, rol_id, password' 
        }, 400);
      }

      
      // Para todos los roles, el email es obligatorio si puede_login_email = true
      console.log('🔍 Validando email:');
      console.log('  - rol.puede_login_email:', rol.puede_login_email);
      console.log('  - email:', email);
      
      if (rol.puede_login_email && !email) {
        console.log('❌ Email es obligatorio para este rol');
        return c.json({ 
          success: false, 
          message: 'El email es obligatorio para este tipo de usuario' 
        }, 400);
      }

      // Verificar si el DNI ya existe
      const usuarioExistenteDni = await prisma.usuarios.findUnique({
        where: { dni }
      });

      if (usuarioExistenteDni) {
        return c.json({ 
          success: false, 
          message: 'Ya existe un usuario con este DNI' 
        }, 400);
      }

      // Verificar si el email ya existe (solo si se proporciona email)
      if (email) {
        const usuarioExistenteEmail = await prisma.usuarios.findUnique({
          where: { email }
        });

        if (usuarioExistenteEmail) {
          return c.json({ 
            success: false, 
            message: 'Ya existe un usuario con este email' 
          }, 400);
        }
      }

      // Encriptar contraseña
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Limpiar datos de caracteres nulos
      const limpiarString = (str: string | undefined | null): string | null => {
        if (!str) return null;
        return str.replace(/\0/g, '').trim() || null;
      };

      // Usar transacción para crear usuario
      const resultado = await prisma.$transaction(async (tx) => {
        // Crear usuario
        const nuevoUsuario = await tx.usuarios.create({
          data: {
            dni: limpiarString(dni) || dni,
            nombres: limpiarString(nombres) || nombres,
            apellidos: limpiarString(apellidos) || apellidos,
            email: limpiarString(email) || null,
            telefono: limpiarString(telefono),
            direccion: limpiarString(direccion),
            fecha_nacimiento: fecha_nacimiento && fecha_nacimiento.trim() !== '' ? new Date(fecha_nacimiento) : null,
            genero,
            rol_id,
            password_hash: hashedPassword,
            activo
          },
          include: {
            roles: {
              select: {
                id: true,
                nombre: true,
                descripcion: true,
                requiere_dni: true,
                puede_login_email: true
              }
            }
          }
        });


        // Si es profesor, crear también el registro en la tabla profesores
        if (rol.nombre?.toLowerCase() === 'profesor') {
          console.log('🔍 DEBUG - Creando profesor:');
          console.log('  - tipo_profesor recibido:', tipo_profesor);
          console.log('  - tipo_profesor es null/undefined:', tipo_profesor == null);
          console.log('  - tipo_profesor es string vacío:', tipo_profesor === '');
          console.log('  - tipo_profesor final:', tipo_profesor);
          
          // SOLO usar 'aula' si NO se proporcionó tipo_profesor
          const tipoProfesorFinal = (tipo_profesor && tipo_profesor.trim() !== '') ? tipo_profesor : 'aula';
          console.log('  - tipo_profesor final después de validación:', tipoProfesorFinal);
          
          await tx.profesores.create({
            data: {
              usuario_id: nuevoUsuario.id,
              especialidad: limpiarString(especialidad) || 'Educación General',
              fecha_ingreso: fecha_ingreso ? new Date(fecha_ingreso) : new Date(),
              codigo_profesor: limpiarString(codigo_profesor) || `PROF${nuevoUsuario.id.toString().padStart(4, '0')}`,
              tipo_profesor: limpiarString(tipoProfesorFinal) || 'aula'
            }
          });
          
          console.log('✅ DEBUG - Profesor creado con tipo_profesor:', tipoProfesorFinal);
        }

        // Si es apoderado, crear también el registro en la tabla apoderados
        if (rol.nombre?.toLowerCase() === 'apoderado') {
          await tx.apoderados.create({
            data: {
              usuario_id: nuevoUsuario.id,
              direccion: limpiarString(direccion) || null
            }
          });
        }

        return nuevoUsuario;
      });

      // Omitir password_hash en la respuesta
      const { password_hash, ...usuarioSinPassword } = resultado;

      return c.json({
        success: true,
        message: 'Usuario creado exitosamente',
        usuario: usuarioSinPassword
      }, 201);

    } catch (error) {
      console.error('Error al crear usuario:', error);
      return c.json({ 
        success: false, 
        message: 'Error interno del servidor' 
      }, 500);
    }
  }

  // Actualizar usuario
  static async actualizarUsuario(c: Context) {
    try {
      const user = c.get('user');
      
      if (!user || user.rol_id !== 1) {
        return c.json({ 
          success: false, 
          message: 'Acceso denegado. Solo directores pueden acceder.' 
        }, 403);
      }

      const id = parseInt(c.req.param('id'));
      const body = await c.req.json();

      if (isNaN(id)) {
        return c.json({ 
          success: false, 
          message: 'ID de usuario inválido' 
        }, 400);
      }

      // Verificar que el usuario existe
      const usuarioExistente = await prisma.usuarios.findUnique({
        where: { id }
      });

      if (!usuarioExistente) {
        return c.json({ 
          success: false, 
          message: 'Usuario no encontrado' 
        }, 404);
      }

      const { 
        dni, 
        nombres, 
        apellidos, 
        email, 
        telefono, 
        direccion, 
        fecha_nacimiento, 
        genero, 
        rol_id,
        activo,
        turno,
        // Campos adicionales para apoderados
        telefono_emergencia,
        ocupacion,
        // Campos adicionales para profesores
        tipo_profesor,
        especialidad
      } = body;

      // Verificar DNI único (si se está cambiando)
      if (dni && dni !== usuarioExistente.dni) {
        const usuarioConDni = await prisma.usuarios.findUnique({
          where: { dni }
        });

        if (usuarioConDni) {
          return c.json({ 
            success: false, 
            message: 'Ya existe un usuario con este DNI' 
          }, 400);
        }
      }

      // Verificar email único (si se está cambiando)
      if (email && email !== usuarioExistente.email) {
        const usuarioConEmail = await prisma.usuarios.findUnique({
          where: { email }
        });

        if (usuarioConEmail) {
          return c.json({ 
            success: false, 
            message: 'Ya existe un usuario con este email' 
          }, 400);
        }
      }

      // Verificar que el rol_id es válido (1-4) si se está cambiando
      if (rol_id && rol_id !== usuarioExistente.rol_id) {
        if (rol_id < 1 || rol_id > 4) {
          return c.json({ 
            success: false, 
            message: 'El rol_id debe ser entre 1 y 4 (1=Director, 2=Profesor, 3=Portero, 4=Apoderado)' 
          }, 400);
        }

        const rol = await prisma.roles.findUnique({
          where: { id: rol_id }
        });

        if (!rol) {
          return c.json({ 
            success: false, 
            message: 'El rol especificado no existe. Ejecute el seed para crear los roles fijos.' 
          }, 400);
        }
      }

      // Usar transacción para actualizar usuario y datos de estudiante si aplica
      const usuarioActualizado = await prisma.$transaction(async (tx) => {
        // Actualizar usuario
        const usuario = await tx.usuarios.update({
          where: { id },
          data: {
            ...(dni && { dni }),
            ...(nombres && { nombres }),
            ...(apellidos && { apellidos }),
            ...(email && { email }),
            ...(telefono !== undefined && { telefono }),
            ...(direccion !== undefined && { direccion }),
            ...(fecha_nacimiento && { fecha_nacimiento: new Date(fecha_nacimiento) }),
            ...(genero && { genero }),
            ...(rol_id && { rol_id }),
            ...(activo !== undefined && { activo }),
            updated_at: new Date()
          },
          include: {
            roles: {
              select: {
                id: true,
                nombre: true,
                descripcion: true,
                requiere_dni: true,
                puede_login_email: true
              }
            }
          }
        });


        // Si es profesor, actualizar también los datos del profesor
        const esProfesor = usuario.roles.nombre?.toLowerCase() === 'profesor';
        
        if (esProfesor) {
          console.log('🔍 DEBUG - Actualizando profesor:');
          console.log('  - tipo_profesor recibido:', tipo_profesor);
          console.log('  - tipo_profesor es null/undefined:', tipo_profesor == null);
          console.log('  - tipo_profesor es string vacío:', tipo_profesor === '');
          console.log('  - especialidad recibida:', especialidad);
          
          const profesor = await tx.profesores.findFirst({
            where: { usuario_id: id }
          });

          if (profesor) {
            console.log('🔍 DEBUG - Profesor encontrado, actualizando...');
            
            // Preparar datos de actualización
            const datosActualizacion: any = {};
            
            // Solo actualizar tipo_profesor si se proporcionó un valor válido
            if (tipo_profesor !== null && tipo_profesor !== undefined && tipo_profesor.trim() !== '') {
              datosActualizacion.tipo_profesor = tipo_profesor;
              console.log('  - Actualizando tipo_profesor a:', tipo_profesor);
            } else {
              console.log('  - No se actualiza tipo_profesor (valor vacío o null)');
            }
            
            // Solo actualizar especialidad si se proporcionó un valor válido
            if (especialidad && especialidad.trim() !== '') {
              datosActualizacion.especialidad = especialidad;
              console.log('  - Actualizando especialidad a:', especialidad);
            } else {
              console.log('  - No se actualiza especialidad (valor vacío o null)');
            }
            
            // Solo actualizar si hay datos que cambiar
            if (Object.keys(datosActualizacion).length > 0) {
              await tx.profesores.update({
                where: { id: profesor.id },
                data: datosActualizacion
              });
              console.log('✅ DEBUG - Profesor actualizado correctamente con:', datosActualizacion);
            } else {
              console.log('⚠️ DEBUG - No hay datos para actualizar en el profesor');
            }
          } else {
            console.log('❌ DEBUG - No se encontró el profesor para actualizar');
          }
        }

        // Si es apoderado, actualizar también los datos del apoderado
        const esApoderado = usuario.roles.nombre?.toLowerCase() === 'apoderado';
        
        if (esApoderado) {
          const apoderado = await tx.apoderados.findFirst({
            where: { usuario_id: id }
          });

          if (apoderado) {
            await tx.apoderados.update({
              where: { id: apoderado.id },
              data: {
                ...(direccion !== undefined && { direccion })
              }
            });
          }
        }

        return usuario;
      });

      // Omitir password_hash en la respuesta
      const { password_hash, ...usuarioSinPassword } = usuarioActualizado;

      return c.json({
        success: true,
        message: 'Usuario actualizado exitosamente',
        usuario: usuarioSinPassword
      });

    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      return c.json({ 
        success: false, 
        message: 'Error interno del servidor' 
      }, 500);
    }
  }

  // Cambiar contraseña
  static async cambiarContrasena(c: Context) {
    try {
      const user = c.get('user');
      
      if (!user || user.rol_id !== 1) {
        return c.json({ 
          success: false, 
          message: 'Acceso denegado. Solo directores pueden acceder.' 
        }, 403);
      }

      const id = parseInt(c.req.param('id'));
      const body = await c.req.json();
      const { password } = body;

      if (isNaN(id)) {
        return c.json({ 
          success: false, 
          message: 'ID de usuario inválido' 
        }, 400);
      }

      if (!password) {
        return c.json({ 
          success: false, 
          message: 'La nueva contraseña es requerida' 
        }, 400);
      }

      if (password.length < 6) {
        return c.json({ 
          success: false, 
          message: 'La contraseña debe tener al menos 6 caracteres' 
        }, 400);
      }

      // Verificar que el usuario existe
      const usuarioExistente = await prisma.usuarios.findUnique({
        where: { id }
      });

      if (!usuarioExistente) {
        return c.json({ 
          success: false, 
          message: 'Usuario no encontrado' 
        }, 404);
      }

      // Encriptar nueva contraseña
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Actualizar contraseña
      await prisma.usuarios.update({
        where: { id },
        data: {
          password_hash: hashedPassword,
          updated_at: new Date()
        }
      });

      return c.json({
        success: true,
        message: 'Contraseña actualizada exitosamente'
      });

    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      return c.json({ 
        success: false, 
        message: 'Error interno del servidor' 
      }, 500);
    }
  }

  // Cambiar estado del usuario (activar/desactivar)
  static async cambiarEstadoUsuario(c: Context) {
    try {
      const user = c.get('user');
      
      if (!user || user.rol_id !== 1) {
        return c.json({ 
          success: false, 
          message: 'Acceso denegado. Solo directores pueden acceder.' 
        }, 403);
      }

      const id = parseInt(c.req.param('id'));
      const body = await c.req.json();
      const { activo } = body;

      if (isNaN(id)) {
        return c.json({ 
          success: false, 
          message: 'ID de usuario inválido' 
        }, 400);
      }

      if (typeof activo !== 'boolean') {
        return c.json({ 
          success: false, 
          message: 'El estado activo debe ser un valor booleano' 
        }, 400);
      }

      // Verificar que el usuario existe
      const usuarioExistente = await prisma.usuarios.findUnique({
        where: { id }
      });

      if (!usuarioExistente) {
        return c.json({ 
          success: false, 
          message: 'Usuario no encontrado' 
        }, 404);
      }

      // No permitir desactivar al propio usuario
      if (id === user.id && !activo) {
        return c.json({ 
          success: false, 
          message: 'No puedes desactivar tu propia cuenta' 
        }, 400);
      }

      // Actualizar estado
      const usuarioActualizado = await prisma.usuarios.update({
        where: { id },
        data: {
          activo,
          updated_at: new Date()
        },
        include: {
          roles: {
            select: {
              id: true,
              nombre: true,
              descripcion: true,
              requiere_dni: true,
              puede_login_email: true
            }
          }
        }
      });

      // Omitir password_hash en la respuesta
      const { password_hash, ...usuarioSinPassword } = usuarioActualizado;

      return c.json({
        success: true,
        message: `Usuario ${activo ? 'activado' : 'desactivado'} exitosamente`,
        data: usuarioSinPassword
      });

    } catch (error) {
      console.error('Error al cambiar estado del usuario:', error);
      return c.json({ 
        success: false, 
        message: 'Error interno del servidor' 
      }, 500);
    }
  }

  // Eliminar usuario
  static async eliminarUsuario(c: Context) {
    try {
      const user = c.get('user');
      
      if (!user || user.rol_id !== 1) {
        return c.json({ 
          success: false, 
          message: 'Acceso denegado. Solo directores pueden acceder.' 
        }, 403);
      }

      const id = parseInt(c.req.param('id'));

      if (isNaN(id)) {
        return c.json({ 
          success: false, 
          message: 'ID de usuario inválido' 
        }, 400);
      }

      // Verificar que el usuario existe
      const usuarioExistente = await prisma.usuarios.findUnique({
        where: { id }
      });

      if (!usuarioExistente) {
        return c.json({ 
          success: false, 
          message: 'Usuario no encontrado' 
        }, 404);
      }

      // No permitir eliminar al propio usuario
      if (id === user.id) {
        return c.json({ 
          success: false, 
          message: 'No puedes eliminar tu propia cuenta' 
        }, 400);
      }

      // Verificar si el usuario tiene registros relacionados
      const [profesor, apoderado] = await Promise.all([
        prisma.profesores.findFirst({ where: { usuario_id: id } }),
        prisma.apoderados.findFirst({ where: { usuario_id: id } })
      ]);

      // Verificar si tiene asistencias
      const tieneAsistencias = await prisma.asistencia_salon.count({
        where: {
          profesor_id: { in: profesor ? [profesor.id] : [] }
        }
      });

      if (tieneAsistencias > 0) {
        return c.json({ 
          success: false, 
          message: 'No se puede eliminar el usuario porque tiene asistencias registradas. Considere desactivarlo en su lugar.' 
        }, 400);
      }

      // Eliminar registros relacionados (solo si no hay asistencias)

      if (profesor) {
        await prisma.profesor_grado_seccion.deleteMany({
          where: { profesor_id: profesor.id }
        });
        await prisma.profesores.delete({
          where: { id: profesor.id }
        });
      }

      if (apoderado) {
        await prisma.apoderados.delete({
          where: { id: apoderado.id }
        });
      }

      // Eliminar usuario
      await prisma.usuarios.delete({
        where: { id }
      });

      return c.json({
        success: true,
        message: 'Usuario eliminado exitosamente'
      });

    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      return c.json({ 
        success: false, 
        message: 'Error interno del servidor' 
      }, 500);
    }
  }

  // Obtener roles disponibles
  static async obtenerRoles(c: Context) {
    try {
      const user = c.get('user');
      
      if (!user || user.rol_id !== 1) {
        return c.json({ 
          success: false, 
          message: 'Acceso denegado. Solo directores pueden acceder.' 
        }, 403);
      }

      const roles = await prisma.roles.findMany({
        select: {
          id: true,
          nombre: true,
          descripcion: true,
          requiere_dni: true,
          puede_login_email: true
        },
        orderBy: {
          nombre: 'asc'
        }
      });

      return c.json({
        success: true,
        data: roles
      });

    } catch (error) {
      console.error('Error al obtener roles:', error);
      return c.json({ 
        success: false, 
        message: 'Error interno del servidor' 
      }, 500);
    }
  }
}