import { Context } from 'hono';
export declare class UsuariosController {
    static obtenerUsuarios(c: Context): Promise<(Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 403, "json">) | (Response & import("hono").TypedResponse<{
        success: true;
        data: {
            usuarios: {
                roles: {
                    id: number;
                    nombre: string;
                    descripcion: string | null;
                    requiere_dni: boolean | null;
                    puede_login_email: boolean | null;
                };
                id: number;
                dni: string | null;
                nombres: string;
                apellidos: string;
                genero: string | null;
                created_at: string | null;
                updated_at: string | null;
                activo: boolean | null;
                direccion: string | null;
                email: string | null;
                telefono: string | null;
                fecha_nacimiento: string | null;
                rol_id: number;
                ultimo_login: string | null;
            }[];
            total: number;
            pagina: number;
            limite: number;
            totalPaginas: number;
        };
    }, import("hono/utils/http-status.js").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
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
            apoderados: {
                usuarios: {
                    id: number;
                    dni: string | null;
                    nombres: string;
                    apellidos: string;
                    direccion: string | null;
                    email: string | null;
                    telefono: string | null;
                };
                id: number;
                created_at: string | null;
                updated_at: string | null;
                usuario_id: number;
                direccion: string | null;
            }[];
            profesores: {
                id: number;
                especialidad: string | null;
                tipo_profesor: string;
            }[];
            roles: {
                id: number;
                nombre: string;
                descripcion: string | null;
                requiere_dni: boolean | null;
                puede_login_email: boolean | null;
            };
            id: number;
            dni: string | null;
            nombres: string;
            apellidos: string;
            genero: string | null;
            created_at: string | null;
            updated_at: string | null;
            activo: boolean | null;
            direccion: string | null;
            email: string | null;
            telefono: string | null;
            fecha_nacimiento: string | null;
            rol_id: number;
            ultimo_login: string | null;
        };
    }, import("hono/utils/http-status.js").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
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
        success: true;
        message: string;
        usuario: {
            roles: {
                id: number;
                nombre: string;
                descripcion: string | null;
                requiere_dni: boolean | null;
                puede_login_email: boolean | null;
            };
            id: number;
            dni: string | null;
            nombres: string;
            apellidos: string;
            genero: string | null;
            created_at: string | null;
            updated_at: string | null;
            activo: boolean | null;
            direccion: string | null;
            email: string | null;
            telefono: string | null;
            fecha_nacimiento: string | null;
            rol_id: number;
            ultimo_login: string | null;
        };
    }, 201, "json">) | (Response & import("hono").TypedResponse<{
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
        success: false;
        message: string;
    }, 404, "json">) | (Response & import("hono").TypedResponse<{
        success: true;
        message: string;
        usuario: {
            roles: {
                id: number;
                nombre: string;
                descripcion: string | null;
                requiere_dni: boolean | null;
                puede_login_email: boolean | null;
            };
            id: number;
            dni: string | null;
            nombres: string;
            apellidos: string;
            genero: string | null;
            created_at: string | null;
            updated_at: string | null;
            activo: boolean | null;
            direccion: string | null;
            email: string | null;
            telefono: string | null;
            fecha_nacimiento: string | null;
            rol_id: number;
            ultimo_login: string | null;
        };
    }, import("hono/utils/http-status.js").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 500, "json">)>;
    static cambiarContrasena(c: Context): Promise<(Response & import("hono").TypedResponse<{
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
    static cambiarEstadoUsuario(c: Context): Promise<(Response & import("hono").TypedResponse<{
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
            roles: {
                id: number;
                nombre: string;
                descripcion: string | null;
                requiere_dni: boolean | null;
                puede_login_email: boolean | null;
            };
            id: number;
            dni: string | null;
            nombres: string;
            apellidos: string;
            genero: string | null;
            created_at: string | null;
            updated_at: string | null;
            activo: boolean | null;
            direccion: string | null;
            email: string | null;
            telefono: string | null;
            fecha_nacimiento: string | null;
            rol_id: number;
            ultimo_login: string | null;
        };
    }, import("hono/utils/http-status.js").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
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
        success: false;
        message: string;
    }, 404, "json">) | (Response & import("hono").TypedResponse<{
        success: true;
        message: string;
    }, import("hono/utils/http-status.js").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 500, "json">)>;
    static obtenerRoles(c: Context): Promise<(Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 403, "json">) | (Response & import("hono").TypedResponse<{
        success: true;
        data: {
            id: number;
            nombre: string;
            descripcion: string | null;
            requiere_dni: boolean | null;
            puede_login_email: boolean | null;
        }[];
    }, import("hono/utils/http-status.js").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 500, "json">)>;
}
//# sourceMappingURL=usuariosController.d.ts.map