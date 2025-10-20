import { Context } from 'hono';
export declare class UsuariosController {
    static obtenerUsuarios(c: Context): Promise<(Response & import("hono").TypedResponse<{
        success: false;
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
                rol_id: number;
                activo: boolean | null;
                created_at: string | null;
                roles: {
                    id: number;
                    nombre: string;
                    requiere_dni: boolean | null;
                    puede_login_email: boolean | null;
                };
            }[];
            total: number;
            pagina: number;
            limite: number;
            totalPaginas: number;
        };
    }, import("hono/utils/http-status.js").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 408, "json">) | (Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 503, "json">) | (Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 500, "json">)>;
    static obtenerUsuarioPorId(c: Context): Promise<(Response & import("hono").TypedResponse<{
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
            email: string | null;
            id: number;
            dni: string | null;
            nombres: string;
            apellidos: string;
            telefono: string | null;
            direccion: string | null;
            fecha_nacimiento: string | null;
            genero: string | null;
            rol_id: number;
            activo: boolean | null;
            created_at: string | null;
            updated_at: string | null;
            apoderados: {
                id: number;
                direccion: string | null;
                created_at: string | null;
                updated_at: string | null;
            }[];
            profesores: {
                id: number;
                created_at: string | null;
                updated_at: string | null;
                especialidad: string | null;
            }[];
            roles: {
                id: number;
                nombre: string;
                descripcion: string | null;
                requiere_dni: boolean | null;
                puede_login_email: boolean | null;
            };
        };
    }, import("hono/utils/http-status.js").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 408, "json">) | (Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 500, "json">)>;
    static crearUsuario(c: Context): Promise<(Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 403, "json">) | (Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 400, "json">) | (Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 409, "json">) | (Response & import("hono").TypedResponse<{
        success: true;
        message: string;
        data: {
            email: string | null;
            id: number;
            dni: string | null;
            nombres: string;
            apellidos: string;
            telefono: string | null;
            direccion: string | null;
            fecha_nacimiento: string | null;
            genero: string | null;
            rol_id: number;
            password_hash: string;
            activo: boolean | null;
            ultimo_login: string | null;
            created_at: string | null;
            updated_at: string | null;
        };
    }, import("hono/utils/http-status.js").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 408, "json">) | (Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 500, "json">)>;
    static actualizarUsuario(c: Context): Promise<(Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 403, "json">) | (Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 400, "json">) | (Response & import("hono").TypedResponse<{
        success: true;
        message: string;
        data: {
            email: string | null;
            id: number;
            dni: string | null;
            nombres: string;
            apellidos: string;
            telefono: string | null;
            rol_id: number;
            activo: boolean | null;
            updated_at: string | null;
        };
    }, import("hono/utils/http-status.js").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 408, "json">) | (Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 404, "json">) | (Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 500, "json">)>;
    static eliminarUsuario(c: Context): Promise<(Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 403, "json">) | (Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 400, "json">) | (Response & import("hono").TypedResponse<{
        success: true;
        message: string;
    }, import("hono/utils/http-status.js").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 408, "json">) | (Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 404, "json">) | (Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 500, "json">)>;
}
//# sourceMappingURL=usuariosController_optimized.d.ts.map