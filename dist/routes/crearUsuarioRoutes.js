import { Hono } from 'hono';
import { PrismaClient } from '../../generated/prisma/index.js';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();
const crearUsuarioRoutes = new Hono();
// Endpoint para crear usuario director
crearUsuarioRoutes.post('/crear-director', async (c) => {
    try {
        console.log('🚀 Creando usuario director...');
        // Verificar si ya existe el usuario
        const usuarioExistente = await prisma.usuarios.findFirst({
            where: {
                email: 'briyan@escuela.edu.pe'
            }
        });
        if (usuarioExistente) {
            return c.json({
                success: false,
                message: 'El usuario ya existe',
                usuario: usuarioExistente
            });
        }
        // Hash de la contraseña
        const hashedPassword = await bcrypt.hash('159briyan159', 10);
        console.log('🔐 Contraseña hasheada');
        // Crear el usuario director
        const usuario = await prisma.usuarios.create({
            data: {
                dni: '12345678',
                nombres: 'Briyan',
                apellidos: 'Quispe',
                email: 'briyan@escuela.edu.pe',
                telefono: '987654321',
                direccion: 'Lima, Perú',
                fecha_nacimiento: new Date('1990-01-01'),
                genero: 'Masculino',
                contrasena: hashedPassword,
                rol_id: 1, // Director
                estado: 'Activo',
                fecha_creacion: new Date(),
                fecha_actualizacion: new Date()
            }
        });
        console.log('✅ Usuario director creado exitosamente:', usuario);
        return c.json({
            success: true,
            message: 'Usuario director creado exitosamente',
            usuario: {
                id: usuario.id,
                email: usuario.email,
                nombres: usuario.nombres,
                apellidos: usuario.apellidos,
                dni: usuario.dni,
                telefono: usuario.telefono,
                direccion: usuario.direccion,
                fecha_nacimiento: usuario.fecha_nacimiento,
                genero: usuario.genero,
                rol_id: usuario.rol_id,
                estado: usuario.estado,
                fecha_creacion: usuario.fecha_creacion
            }
        });
    }
    catch (error) {
        console.error('❌ Error creando usuario director:', error);
        return c.json({
            success: false,
            message: 'Error creando usuario director',
            error: error.message
        }, 500);
    }
});
export default crearUsuarioRoutes;
//# sourceMappingURL=crearUsuarioRoutes.js.map