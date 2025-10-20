import { Context } from 'hono';
export declare class ProfesoresController {
    static obtenerProfesores(c: Context): Promise<(Response & import("hono").TypedResponse<{
        message: string;
    }, 403, "json">) | (Response & import("hono").TypedResponse<{
        success: true;
        data: {
            usuarios: {
                email: string | null;
                id: number;
                dni: string | null;
                nombres: string;
                apellidos: string;
                telefono: string | null;
                direccion: string | null;
                fecha_nacimiento: string | null;
                genero: string | null;
                activo: boolean | null;
            };
            profesor_grado_seccion: {
                grados: {
                    nombre: string;
                    nivel: string;
                };
                secciones: {
                    nombre: string;
                };
                id: number;
                activo: boolean | null;
                created_at: string | null;
                updated_at: string | null;
                profesor_id: number;
                grado_id: number;
                seccion_id: number;
                es_tutor: boolean | null;
                anio_escolar: number;
            }[];
            id: number;
            created_at: string | null;
            updated_at: string | null;
            especialidad: string | null;
            usuario_id: number;
            fecha_ingreso: string | null;
            codigo_profesor: string | null;
            tipo_profesor: string;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }, import("hono/utils/http-status.js").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
        message: string;
    }, 500, "json">)>;
    static obtenerProfesorPorId(c: Context): Promise<(Response & import("hono").TypedResponse<{
        message: string;
    }, 403, "json">) | (Response & import("hono").TypedResponse<{
        message: string;
    }, 404, "json">) | (Response & import("hono").TypedResponse<{
        success: true;
        data: {
            usuarios: {
                email: string | null;
                id: number;
                dni: string | null;
                nombres: string;
                apellidos: string;
                telefono: string | null;
                direccion: string | null;
                fecha_nacimiento: string | null;
                genero: string | null;
                activo: boolean | null;
            };
            profesor_grado_seccion: {
                grados: {
                    id: number;
                    nombre: string;
                    created_at: string | null;
                    updated_at: string | null;
                    nivel: string;
                };
                secciones: {
                    id: number;
                    nombre: string;
                    created_at: string | null;
                    updated_at: string | null;
                };
                id: number;
                activo: boolean | null;
                created_at: string | null;
                updated_at: string | null;
                profesor_id: number;
                grado_id: number;
                seccion_id: number;
                es_tutor: boolean | null;
                anio_escolar: number;
            }[];
            id: number;
            created_at: string | null;
            updated_at: string | null;
            especialidad: string | null;
            usuario_id: number;
            fecha_ingreso: string | null;
            codigo_profesor: string | null;
            tipo_profesor: string;
        };
    }, import("hono/utils/http-status.js").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
        message: string;
    }, 500, "json">)>;
    static crearProfesor(c: Context): Promise<(Response & import("hono").TypedResponse<{
        message: string;
    }, 403, "json">) | (Response & import("hono").TypedResponse<{
        message: string;
    }, 400, "json">) | (Response & import("hono").TypedResponse<{
        success: true;
        message: string;
        data: {
            usuarios: {
                email: string | null;
                id: number;
                dni: string | null;
                nombres: string;
                apellidos: string;
                telefono: string | null;
                direccion: string | null;
                fecha_nacimiento: string | null;
                genero: string | null;
                activo: boolean | null;
            };
            id: number;
            created_at: string | null;
            updated_at: string | null;
            especialidad: string | null;
            usuario_id: number;
            fecha_ingreso: string | null;
            codigo_profesor: string | null;
            tipo_profesor: string;
        };
        password_temporal: string;
    }, 201, "json">) | (Response & import("hono").TypedResponse<{
        message: string;
    }, 500, "json">)>;
    static actualizarProfesor(c: Context): Promise<(Response & import("hono").TypedResponse<{
        message: string;
    }, 403, "json">) | (Response & import("hono").TypedResponse<{
        message: string;
    }, 404, "json">) | (Response & import("hono").TypedResponse<{
        message: string;
    }, 400, "json">) | (Response & import("hono").TypedResponse<{
        success: true;
        message: string;
        data: {
            usuarios: {
                email: string | null;
                id: number;
                dni: string | null;
                nombres: string;
                apellidos: string;
                telefono: string | null;
                direccion: string | null;
                fecha_nacimiento: string | null;
                genero: string | null;
                activo: boolean | null;
            };
            id: number;
            created_at: string | null;
            updated_at: string | null;
            especialidad: string | null;
            usuario_id: number;
            fecha_ingreso: string | null;
            codigo_profesor: string | null;
            tipo_profesor: string;
        };
    }, import("hono/utils/http-status.js").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
        message: string;
    }, 500, "json">)>;
    static cambiarEstadoProfesor(c: Context): Promise<(Response & import("hono").TypedResponse<{
        message: string;
    }, 403, "json">) | (Response & import("hono").TypedResponse<{
        success: true;
        message: string;
        data: {
            usuarios: {
                email: string | null;
                id: number;
                dni: string | null;
                nombres: string;
                apellidos: string;
                telefono: string | null;
                direccion: string | null;
                fecha_nacimiento: string | null;
                genero: string | null;
                activo: boolean | null;
            };
            id: number;
            created_at: string | null;
            updated_at: string | null;
            especialidad: string | null;
            usuario_id: number;
            fecha_ingreso: string | null;
            codigo_profesor: string | null;
            tipo_profesor: string;
        } | null;
    }, import("hono/utils/http-status.js").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
        message: string;
    }, 500, "json">)>;
    static eliminarProfesor(c: Context): Promise<(Response & import("hono").TypedResponse<{
        message: string;
    }, 403, "json">) | (Response & import("hono").TypedResponse<{
        message: string;
    }, 404, "json">) | (Response & import("hono").TypedResponse<{
        success: true;
        message: string;
    }, import("hono/utils/http-status.js").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
        message: string;
    }, 500, "json">)>;
    static asignarProfesorGradoSeccion(c: Context): Promise<(Response & import("hono").TypedResponse<{
        message: string;
    }, 403, "json">) | (Response & import("hono").TypedResponse<{
        message: string;
    }, 400, "json">) | (Response & import("hono").TypedResponse<{
        message: string;
    }, 404, "json">) | (Response & import("hono").TypedResponse<{
        success: true;
        message: string;
        data: {
            profesores: {
                usuarios: {
                    nombres: string;
                    apellidos: string;
                };
                id: number;
                created_at: string | null;
                updated_at: string | null;
                especialidad: string | null;
                usuario_id: number;
                fecha_ingreso: string | null;
                codigo_profesor: string | null;
                tipo_profesor: string;
            };
            grados: {
                id: number;
                nombre: string;
                created_at: string | null;
                updated_at: string | null;
                nivel: string;
            };
            secciones: {
                id: number;
                nombre: string;
                created_at: string | null;
                updated_at: string | null;
            };
            id: number;
            activo: boolean | null;
            created_at: string | null;
            updated_at: string | null;
            profesor_id: number;
            grado_id: number;
            seccion_id: number;
            es_tutor: boolean | null;
            anio_escolar: number;
        };
    }, 201, "json">) | (Response & import("hono").TypedResponse<{
        message: string;
    }, 500, "json">)>;
    static obtenerMaterias(c: Context): Promise<(Response & import("hono").TypedResponse<{
        message: string;
    }, 403, "json">) | (Response & import("hono").TypedResponse<{
        success: true;
        data: never[];
    }, import("hono/utils/http-status.js").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
        message: string;
    }, 500, "json">)>;
    static obtenerAsignacionesProfesor(c: Context): Promise<(Response & import("hono").TypedResponse<{
        message: string;
    }, 403, "json">) | (Response & import("hono").TypedResponse<{
        success: true;
        data: {
            usuarios: {
                email: string | null;
                id: number;
                dni: string | null;
                nombres: string;
                apellidos: string;
                telefono: string | null;
                direccion: string | null;
                fecha_nacimiento: string | null;
                genero: string | null;
                activo: boolean | null;
            };
            profesor_grado_seccion: {
                grados: {
                    nombre: string;
                    nivel: string;
                };
                secciones: {
                    nombre: string;
                };
                id: number;
                activo: boolean | null;
                created_at: string | null;
                updated_at: string | null;
                profesor_id: number;
                grado_id: number;
                seccion_id: number;
                es_tutor: boolean | null;
                anio_escolar: number;
            }[];
            id: number;
            created_at: string | null;
            updated_at: string | null;
            especialidad: string | null;
            usuario_id: number;
            fecha_ingreso: string | null;
            codigo_profesor: string | null;
            tipo_profesor: string;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }, import("hono/utils/http-status.js").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
        message: string;
    }, 500, "json">)>;
    static eliminarAsignacionProfesor(c: Context): Promise<(Response & import("hono").TypedResponse<{
        message: string;
    }, 403, "json">) | (Response & import("hono").TypedResponse<{
        message: string;
    }, 404, "json">) | (Response & import("hono").TypedResponse<{
        success: true;
        message: string;
    }, import("hono/utils/http-status.js").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
        message: string;
    }, 500, "json">)>;
}
//# sourceMappingURL=profesoresController.d.ts.map