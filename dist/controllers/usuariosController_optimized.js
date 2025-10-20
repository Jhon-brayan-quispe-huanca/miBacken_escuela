import { PrismaClient } from '../../generated/prisma/index.js';
import * as bcrypt from 'bcryptjs';
const prisma = new PrismaClient();
export class UsuariosController {
    // Obtener todos los usuarios con paginación OPTIMIZADO
    static async obtenerUsuarios(c) {
        const startTime = Date.now();
        console.log('🚀 [USUARIOS] Iniciando consulta optimizada...');
        try {
            const user = c.get('user');
            if (!user || user.rol_id !== 1) {
                return c.json({
                    success: false,
                    message: 'Acceso denegado. Solo directores pueden acceder.'
                }, 403);
            }
            const page = parseInt(c.req.query('page') || '1');
            const limit = Math.min(parseInt(c.req.query('limit') || '10'), 15); // Máximo 15 por página
            const search = c.req.query('search') || '';
            const rolId = c.req.query('rol_id');
            const activo = c.req.query('activo');
            console.log('🔍 [USUARIOS] Parámetros:', { page, limit, search, rolId, activo });
            const skip = (page - 1) * limit;
            // Construir filtros optimizados
            const where = {};
            if (search) {
                // Búsqueda optimizada - solo en campos principales
                where.OR = [
                    { nombres: { contains: search, mode: 'insensitive' } },
                    { apellidos: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } }
                ];
            }
            if (rolId) {
                where.rol_id = parseInt(rolId);
            }
            if (activo !== undefined && activo !== '') {
                where.activo = activo === 'true';
            }
            console.log('🔍 [USUARIOS] Filtros aplicados:', where);
            // Consulta optimizada con timeout de 8 segundos
            const [usuarios, total] = await Promise.race([
                Promise.all([
                    prisma.usuarios.findMany({
                        where,
                        skip,
                        take: limit,
                        select: {
                            id: true,
                            dni: true,
                            nombres: true,
                            apellidos: true,
                            email: true,
                            telefono: true,
                            rol_id: true,
                            activo: true,
                            created_at: true,
                            roles: {
                                select: {
                                    id: true,
                                    nombre: true,
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
                ]),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout: Consulta tardó demasiado')), 8000))
            ]);
            const queryTime = Date.now() - startTime;
            console.log(`✅ [USUARIOS] Consulta completada en ${queryTime}ms`);
            console.log(`📊 [USUARIOS] Resultados: ${usuarios.length} usuarios de ${total} total`);
            const totalPaginas = Math.ceil(total / limit);
            return c.json({
                success: true,
                data: {
                    usuarios,
                    total,
                    pagina: page,
                    limite: limit,
                    totalPaginas
                }
            });
        }
        catch (error) {
            const errorTime = Date.now() - startTime;
            console.error(`❌ [USUARIOS] Error después de ${errorTime}ms:`, error);
            // Detectar tipo de error para mejor mensaje
            if (error instanceof Error) {
                if (error.message.includes('Timeout')) {
                    return c.json({
                        success: false,
                        message: 'La consulta tardó demasiado. Intente con menos datos.'
                    }, 408);
                }
                if (error.message.includes('connection') || error.message.includes('timeout')) {
                    return c.json({
                        success: false,
                        message: 'Error de conexión a la base de datos. Intente nuevamente.'
                    }, 503);
                }
            }
            return c.json({
                success: false,
                message: 'Error interno del servidor'
            }, 500);
        }
    }
    // Obtener usuario por ID OPTIMIZADO
    static async obtenerUsuarioPorId(c) {
        const startTime = Date.now();
        console.log('🔍 [USUARIO] Iniciando consulta por ID...');
        try {
            const user = c.get('user');
            if (!user || user.rol_id !== 1) {
                return c.json({
                    success: false,
                    message: 'Acceso denegado. Solo directores pueden acceder.'
                }, 403);
            }
            const usuarioId = parseInt(c.req.param('id'));
            if (isNaN(usuarioId)) {
                return c.json({
                    success: false,
                    message: 'ID de usuario inválido'
                }, 400);
            }
            // Consulta optimizada con timeout de 5 segundos
            const usuario = await Promise.race([
                prisma.usuarios.findUnique({
                    where: { id: usuarioId },
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
                        rol_id: true,
                        activo: true,
                        created_at: true,
                        updated_at: true,
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
                            select: {
                                id: true,
                                direccion: true,
                                created_at: true,
                                updated_at: true
                            }
                        },
                        profesores: {
                            select: {
                                id: true,
                                especialidad: true,
                                created_at: true,
                                updated_at: true
                            }
                        }
                    }
                }),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout: Consulta tardó demasiado')), 5000))
            ]);
            if (!usuario) {
                return c.json({
                    success: false,
                    message: 'Usuario no encontrado'
                }, 404);
            }
            const queryTime = Date.now() - startTime;
            console.log(`✅ [USUARIO] Consulta completada en ${queryTime}ms`);
            return c.json({
                success: true,
                data: usuario
            });
        }
        catch (error) {
            const errorTime = Date.now() - startTime;
            console.error(`❌ [USUARIO] Error después de ${errorTime}ms:`, error);
            if (error instanceof Error) {
                if (error.message.includes('Timeout')) {
                    return c.json({
                        success: false,
                        message: 'La consulta tardó demasiado.'
                    }, 408);
                }
            }
            return c.json({
                success: false,
                message: 'Error interno del servidor'
            }, 500);
        }
    }
    // Crear usuario OPTIMIZADO
    static async crearUsuario(c) {
        const startTime = Date.now();
        console.log('🔍 [CREAR] Iniciando creación de usuario...');
        try {
            const user = c.get('user');
            if (!user || user.rol_id !== 1) {
                return c.json({
                    success: false,
                    message: 'Acceso denegado. Solo directores pueden acceder.'
                }, 403);
            }
            const body = await c.req.json();
            const { dni, nombres, apellidos, email, password, telefono, direccion, fecha_nacimiento, genero, rol_id } = body;
            // Validaciones básicas
            if (!dni || !nombres || !apellidos || !email || !password || !rol_id) {
                return c.json({
                    success: false,
                    message: 'Faltan campos obligatorios'
                }, 400);
            }
            // Verificar si el usuario ya existe
            const usuarioExistente = await Promise.race([
                prisma.usuarios.findFirst({
                    where: {
                        OR: [
                            { email: email },
                            { dni: dni }
                        ]
                    }
                }),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout: Verificación tardó demasiado')), 5000))
            ]);
            if (usuarioExistente) {
                return c.json({
                    success: false,
                    message: 'Ya existe un usuario con este email o DNI'
                }, 409);
            }
            // Hash de la contraseña
            const hashedPassword = await bcrypt.hash(password, 10);
            // Crear usuario con timeout
            const nuevoUsuario = await Promise.race([
                prisma.usuarios.create({
                    data: {
                        dni,
                        nombres,
                        apellidos,
                        email,
                        password: hashedPassword,
                        telefono,
                        direccion,
                        fecha_nacimiento: fecha_nacimiento ? new Date(fecha_nacimiento) : null,
                        genero,
                        rol_id: parseInt(rol_id),
                        activo: true
                    },
                    select: {
                        id: true,
                        dni: true,
                        nombres: true,
                        apellidos: true,
                        email: true,
                        telefono: true,
                        rol_id: true,
                        activo: true,
                        created_at: true
                    }
                }),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout: Creación tardó demasiado')), 8000))
            ]);
            const queryTime = Date.now() - startTime;
            console.log(`✅ [CREAR] Usuario creado en ${queryTime}ms`);
            return c.json({
                success: true,
                message: 'Usuario creado exitosamente',
                data: nuevoUsuario
            });
        }
        catch (error) {
            const errorTime = Date.now() - startTime;
            console.error(`❌ [CREAR] Error después de ${errorTime}ms:`, error);
            if (error instanceof Error) {
                if (error.message.includes('Timeout')) {
                    return c.json({
                        success: false,
                        message: 'La operación tardó demasiado.'
                    }, 408);
                }
                if (error.message.includes('Unique constraint')) {
                    return c.json({
                        success: false,
                        message: 'Ya existe un usuario con este email o DNI'
                    }, 409);
                }
            }
            return c.json({
                success: false,
                message: 'Error interno del servidor'
            }, 500);
        }
    }
    // Actualizar usuario OPTIMIZADO
    static async actualizarUsuario(c) {
        const startTime = Date.now();
        console.log('🔍 [ACTUALIZAR] Iniciando actualización...');
        try {
            const user = c.get('user');
            if (!user || user.rol_id !== 1) {
                return c.json({
                    success: false,
                    message: 'Acceso denegado. Solo directores pueden acceder.'
                }, 403);
            }
            const usuarioId = parseInt(c.req.param('id'));
            const body = await c.req.json();
            if (isNaN(usuarioId)) {
                return c.json({
                    success: false,
                    message: 'ID de usuario inválido'
                }, 400);
            }
            // Actualizar usuario con timeout
            const usuarioActualizado = await Promise.race([
                prisma.usuarios.update({
                    where: { id: usuarioId },
                    data: {
                        ...body,
                        updated_at: new Date()
                    },
                    select: {
                        id: true,
                        dni: true,
                        nombres: true,
                        apellidos: true,
                        email: true,
                        telefono: true,
                        rol_id: true,
                        activo: true,
                        updated_at: true
                    }
                }),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout: Actualización tardó demasiado')), 8000))
            ]);
            const queryTime = Date.now() - startTime;
            console.log(`✅ [ACTUALIZAR] Usuario actualizado en ${queryTime}ms`);
            return c.json({
                success: true,
                message: 'Usuario actualizado exitosamente',
                data: usuarioActualizado
            });
        }
        catch (error) {
            const errorTime = Date.now() - startTime;
            console.error(`❌ [ACTUALIZAR] Error después de ${errorTime}ms:`, error);
            if (error instanceof Error) {
                if (error.message.includes('Timeout')) {
                    return c.json({
                        success: false,
                        message: 'La operación tardó demasiado.'
                    }, 408);
                }
                if (error.message.includes('Record to update not found')) {
                    return c.json({
                        success: false,
                        message: 'Usuario no encontrado'
                    }, 404);
                }
            }
            return c.json({
                success: false,
                message: 'Error interno del servidor'
            }, 500);
        }
    }
    // Eliminar usuario OPTIMIZADO
    static async eliminarUsuario(c) {
        const startTime = Date.now();
        console.log('🔍 [ELIMINAR] Iniciando eliminación...');
        try {
            const user = c.get('user');
            if (!user || user.rol_id !== 1) {
                return c.json({
                    success: false,
                    message: 'Acceso denegado. Solo directores pueden acceder.'
                }, 403);
            }
            const usuarioId = parseInt(c.req.param('id'));
            if (isNaN(usuarioId)) {
                return c.json({
                    success: false,
                    message: 'ID de usuario inválido'
                }, 400);
            }
            // Eliminar usuario con timeout
            await Promise.race([
                prisma.usuarios.delete({
                    where: { id: usuarioId }
                }),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout: Eliminación tardó demasiado')), 8000))
            ]);
            const queryTime = Date.now() - startTime;
            console.log(`✅ [ELIMINAR] Usuario eliminado en ${queryTime}ms`);
            return c.json({
                success: true,
                message: 'Usuario eliminado exitosamente'
            });
        }
        catch (error) {
            const errorTime = Date.now() - startTime;
            console.error(`❌ [ELIMINAR] Error después de ${errorTime}ms:`, error);
            if (error instanceof Error) {
                if (error.message.includes('Timeout')) {
                    return c.json({
                        success: false,
                        message: 'La operación tardó demasiado.'
                    }, 408);
                }
                if (error.message.includes('Record to delete does not exist')) {
                    return c.json({
                        success: false,
                        message: 'Usuario no encontrado'
                    }, 404);
                }
            }
            return c.json({
                success: false,
                message: 'Error interno del servidor'
            }, 500);
        }
    }
}
//# sourceMappingURL=usuariosController_optimized.js.map