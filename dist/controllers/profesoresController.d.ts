import { Context } from 'hono';
export declare class ProfesoresController {
    static obtenerProfesores(c: Context): Promise<(Response & import("hono").TypedResponse<{
        message: string;
    }, 403, "json">) | (Response & import("hono").TypedResponse<{
        success: true;
        data: {
            profesor_grado_seccion: {
                grados: {
                    nombre: string;
                    nivel: string;
                };
                secciones: {
                    nombre: string;
                };
                id: number;
                grado_id: number;
                seccion_id: number;
                created_at: string | null;
                updated_at: string | null;
                activo: boolean | null;
                profesor_id: number;
                es_tutor: boolean | null;
                anio_escolar: number;
            }[];
            usuarios: {
                id: number;
                dni: string | null;
                nombres: string;
                apellidos: string;
                genero: string | null;
                activo: boolean | null;
                direccion: string | null;
                email: string | null;
                telefono: string | null;
                fecha_nacimiento: string | null;
            };
            id: number;
            created_at: string | null;
            updated_at: string | null;
            usuario_id: number;
            especialidad: string | null;
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
            profesor_grado_seccion: {
                grados: {
                    id: number;
                    created_at: string | null;
                    updated_at: string | null;
                    nombre: string;
                    nivel: string;
                };
                secciones: {
                    id: number;
                    created_at: string | null;
                    updated_at: string | null;
                    nombre: string;
                };
                id: number;
                grado_id: number;
                seccion_id: number;
                created_at: string | null;
                updated_at: string | null;
                activo: boolean | null;
                profesor_id: number;
                es_tutor: boolean | null;
                anio_escolar: number;
            }[];
            usuarios: {
                id: number;
                dni: string | null;
                nombres: string;
                apellidos: string;
                genero: string | null;
                activo: boolean | null;
                direccion: string | null;
                email: string | null;
                telefono: string | null;
                fecha_nacimiento: string | null;
            };
            id: number;
            created_at: string | null;
            updated_at: string | null;
            usuario_id: number;
            especialidad: string | null;
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
                id: number;
                dni: string | null;
                nombres: string;
                apellidos: string;
                genero: string | null;
                activo: boolean | null;
                direccion: string | null;
                email: string | null;
                telefono: string | null;
                fecha_nacimiento: string | null;
            };
            id: number;
            created_at: string | null;
            updated_at: string | null;
            usuario_id: number;
            especialidad: string | null;
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
                id: number;
                dni: string | null;
                nombres: string;
                apellidos: string;
                genero: string | null;
                activo: boolean | null;
                direccion: string | null;
                email: string | null;
                telefono: string | null;
                fecha_nacimiento: string | null;
            };
            id: number;
            created_at: string | null;
            updated_at: string | null;
            usuario_id: number;
            especialidad: string | null;
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
                id: number;
                dni: string | null;
                nombres: string;
                apellidos: string;
                genero: string | null;
                activo: boolean | null;
                direccion: string | null;
                email: string | null;
                telefono: string | null;
                fecha_nacimiento: string | null;
            };
            id: number;
            created_at: string | null;
            updated_at: string | null;
            usuario_id: number;
            especialidad: string | null;
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
            grados: {
                id: number;
                created_at: string | null;
                updated_at: string | null;
                nombre: string;
                nivel: string;
            };
            secciones: {
                id: number;
                created_at: string | null;
                updated_at: string | null;
                nombre: string;
            };
            profesores: {
                usuarios: {
                    nombres: string;
                    apellidos: string;
                };
                id: number;
                created_at: string | null;
                updated_at: string | null;
                usuario_id: number;
                especialidad: string | null;
                fecha_ingreso: string | null;
                codigo_profesor: string | null;
                tipo_profesor: string;
            };
            id: number;
            grado_id: number;
            seccion_id: number;
            created_at: string | null;
            updated_at: string | null;
            activo: boolean | null;
            profesor_id: number;
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
            profesor_grado_seccion: {
                grados: {
                    nombre: string;
                    nivel: string;
                };
                secciones: {
                    nombre: string;
                };
                id: number;
                grado_id: number;
                seccion_id: number;
                created_at: string | null;
                updated_at: string | null;
                activo: boolean | null;
                profesor_id: number;
                es_tutor: boolean | null;
                anio_escolar: number;
            }[];
            usuarios: {
                id: number;
                dni: string | null;
                nombres: string;
                apellidos: string;
                genero: string | null;
                activo: boolean | null;
                direccion: string | null;
                email: string | null;
                telefono: string | null;
                fecha_nacimiento: string | null;
            };
            id: number;
            created_at: string | null;
            updated_at: string | null;
            usuario_id: number;
            especialidad: string | null;
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