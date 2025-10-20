import { Context } from 'hono';
export declare class EstudiantesController {
    static obtenerEstudiantes(c: Context): Promise<(Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 403, "json">) | (Response & import("hono").TypedResponse<{
        success: true;
        data: {
            estudiantes: {
                apoderados: {
                    usuarios: {
                        email: string | null;
                        nombres: string;
                        apellidos: string;
                        telefono: string | null;
                    };
                    id: number;
                    direccion: string | null;
                    created_at: string | null;
                    updated_at: string | null;
                    usuario_id: number;
                };
                grados: {
                    id: number;
                    nombre: string;
                    nivel: string;
                };
                secciones: {
                    id: number;
                    nombre: string;
                };
                id: number;
                dni: string | null;
                nombres: string;
                apellidos: string;
                genero: string | null;
                created_at: string | null;
                updated_at: string | null;
                estado: string | null;
                grado_id: number;
                seccion_id: number;
                apoderado_id: number;
                codigo_estudiante: string;
                turno: string;
            }[];
            pagination: {
                page: number;
                limit: number;
                total: number;
                pages: number;
            };
        };
    }, import("hono/utils/http-status.js").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 500, "json">)>;
    static obtenerEstudiantePorId(c: Context): Promise<(Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 403, "json">) | (Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 400, "json">) | (Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 404, "json">) | (Response & import("hono").TypedResponse<{
        success: true;
        data: {
            apoderados: {
                usuarios: {
                    email: string | null;
                    nombres: string;
                    apellidos: string;
                    telefono: string | null;
                };
                id: number;
                direccion: string | null;
                created_at: string | null;
                updated_at: string | null;
                usuario_id: number;
            };
            grados: {
                id: number;
                nombre: string;
                nivel: string;
            };
            secciones: {
                id: number;
                nombre: string;
            };
            id: number;
            dni: string | null;
            nombres: string;
            apellidos: string;
            genero: string | null;
            created_at: string | null;
            updated_at: string | null;
            estado: string | null;
            grado_id: number;
            seccion_id: number;
            apoderado_id: number;
            codigo_estudiante: string;
            turno: string;
        };
    }, import("hono/utils/http-status.js").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 500, "json">)>;
    static crearEstudiante(c: Context): Promise<(Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 403, "json">) | (Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 400, "json">) | (Response & import("hono").TypedResponse<{
        success: true;
        message: string;
        data: {
            apoderados: {
                usuarios: {
                    email: string | null;
                    nombres: string;
                    apellidos: string;
                    telefono: string | null;
                };
                id: number;
                direccion: string | null;
                created_at: string | null;
                updated_at: string | null;
                usuario_id: number;
            };
            grados: {
                id: number;
                nombre: string;
                nivel: string;
            };
            secciones: {
                id: number;
                nombre: string;
            };
            id: number;
            dni: string | null;
            nombres: string;
            apellidos: string;
            genero: string | null;
            created_at: string | null;
            updated_at: string | null;
            estado: string | null;
            grado_id: number;
            seccion_id: number;
            apoderado_id: number;
            codigo_estudiante: string;
            turno: string;
        };
    }, import("hono/utils/http-status.js").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 500, "json">)>;
    static actualizarEstudiante(c: Context): Promise<(Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 403, "json">) | (Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 400, "json">) | (Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 404, "json">) | (Response & import("hono").TypedResponse<{
        success: true;
        message: string;
        data: {
            apoderados: {
                usuarios: {
                    email: string | null;
                    nombres: string;
                    apellidos: string;
                    telefono: string | null;
                };
                id: number;
                direccion: string | null;
                created_at: string | null;
                updated_at: string | null;
                usuario_id: number;
            };
            grados: {
                id: number;
                nombre: string;
                nivel: string;
            };
            secciones: {
                id: number;
                nombre: string;
            };
            id: number;
            dni: string | null;
            nombres: string;
            apellidos: string;
            genero: string | null;
            created_at: string | null;
            updated_at: string | null;
            estado: string | null;
            grado_id: number;
            seccion_id: number;
            apoderado_id: number;
            codigo_estudiante: string;
            turno: string;
        };
    }, import("hono/utils/http-status.js").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 500, "json">)>;
    static cambiarEstadoEstudiante(c: Context): Promise<(Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 403, "json">) | (Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 400, "json">) | (Response & import("hono").TypedResponse<{
        success: true;
        message: string;
        data: {
            id: number;
            dni: string | null;
            nombres: string;
            apellidos: string;
            genero: string | null;
            created_at: string | null;
            updated_at: string | null;
            estado: string | null;
            grado_id: number;
            seccion_id: number;
            apoderado_id: number;
            codigo_estudiante: string;
            turno: string;
        };
    }, import("hono/utils/http-status.js").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 500, "json">)>;
    static eliminarEstudiante(c: Context): Promise<(Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 403, "json">) | (Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 400, "json">) | (Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 404, "json">) | (Response & import("hono").TypedResponse<{
        success: true;
        message: string;
    }, import("hono/utils/http-status.js").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 500, "json">)>;
    static obtenerGradosYSecciones(c: Context): Promise<(Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 403, "json">) | (Response & import("hono").TypedResponse<{
        success: true;
        data: {
            grados: {
                id: number;
                nombre: string;
                created_at: string | null;
                updated_at: string | null;
                nivel: string;
            }[];
            secciones: {
                id: number;
                nombre: string;
                created_at: string | null;
                updated_at: string | null;
            }[];
        };
    }, import("hono/utils/http-status.js").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 500, "json">)>;
    static obtenerApoderados(c: Context): Promise<(Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 403, "json">) | (Response & import("hono").TypedResponse<{
        success: true;
        data: {
            usuarios: {
                email: string | null;
                nombres: string;
                apellidos: string;
                telefono: string | null;
            };
            id: number;
            direccion: string | null;
            created_at: string | null;
            updated_at: string | null;
            usuario_id: number;
        }[];
    }, import("hono/utils/http-status.js").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 500, "json">)>;
}
//# sourceMappingURL=estudiantesController_nuevo.d.ts.map