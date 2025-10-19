import { PrismaClient } from '../../generated/prisma/index.js';
const prisma = new PrismaClient();
export class PorteroService {
    // Obtener portero por ID
    static async obtenerPorteroPorId(id) {
        try {
            const portero = await prisma.usuarios.findFirst({
                where: {
                    id: id,
                    rol_id: 4, // Rol de portero
                    activo: true
                },
                include: {
                    roles: true
                }
            });
            return portero;
        }
        catch (error) {
            console.error('Error al obtener portero por ID:', error);
            throw error;
        }
    }
    // Obtener todos los porteros activos
    static async obtenerPorterosActivos() {
        try {
            const porteros = await prisma.usuarios.findMany({
                where: {
                    rol_id: 4,
                    activo: true
                },
                include: {
                    roles: true
                },
                orderBy: {
                    nombres: 'asc'
                }
            });
            return porteros;
        }
        catch (error) {
            console.error('Error al obtener porteros activos:', error);
            throw error;
        }
    }
    // Actualizar información del portero
    static async actualizarPortero(id, datos) {
        try {
            const portero = await prisma.usuarios.update({
                where: {
                    id: id
                },
                data: {
                    ...datos,
                    updated_at: new Date()
                },
                include: {
                    roles: true
                }
            });
            return portero;
        }
        catch (error) {
            console.error('Error al actualizar portero:', error);
            throw error;
        }
    }
}
//# sourceMappingURL=porteroService.js.map