import { Context, Next } from 'hono';
export declare const authMiddleware: (c: Context, next: Next) => Promise<(Response & import("hono").TypedResponse<{
    success: false;
    message: string;
}, 401, "json">) | undefined>;
//# sourceMappingURL=authMiddleware.d.ts.map