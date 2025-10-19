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
                ultimo_login: string | null;
                created_at: string | null;
                updated_at: string | null;
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
                    email: string | null;
                    id: number;
                    dni: string | null;
                    nombres: string;
                    apellidos: string;
                    telefono: string | null;
                    direccion: string | null;
                };
                id: number;
                direccion: string | null;
                created_at: string | null;
                updated_at: string | null;
                usuario_id: number;
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
            ultimo_login: string | null;
            created_at: string | null;
            updated_at: string | null;
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
            ultimo_login: string | null;
            created_at: string | null;
            updated_at: string | null;
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
            ultimo_login: string | null;
            created_at: string | null;
            updated_at: string | null;
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
            ultimo_login: string | null;
            created_at: string | null;
            updated_at: string | null;
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