import { Context } from 'hono';
export declare class AuthController {
    static loginUsuario(c: Context): Promise<(Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 400, "json">) | (Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 401, "json">) | (Response & import("hono").TypedResponse<{
        success: true;
        message: string;
        data: {
            token: string;
            user: {
                id: any;
                tipo: any;
                email: any;
                nombre: any;
                apellido: any;
                rol: any;
            };
        };
    }, import("hono/utils/http-status").ContentfulStatusCode, "json">) | (Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 500, "json">)>;
    static verifyToken(c: Context): Promise<(Response & import("hono").TypedResponse<{
        success: false;
        message: string;
    }, 401, "json">) | (Response & import("hono").TypedResponse<{
        success: true;
        data: {
            userId: any;
            userType: any;
            email: any;
            dni: any;
        };
    }, import("hono/utils/http-status").ContentfulStatusCode, "json">)>;
}
//# sourceMappingURL=authController.d.ts.map