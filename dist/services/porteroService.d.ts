export declare class PorteroService {
    static obtenerPorteroPorId(id: number): Promise<({
        roles: {
            id: number;
            created_at: Date | null;
            updated_at: Date | null;
            nombre: string;
            descripcion: string | null;
            requiere_dni: boolean | null;
            puede_login_email: boolean | null;
        };
    } & {
        id: number;
        dni: string | null;
        nombres: string;
        apellidos: string;
        genero: string | null;
        created_at: Date | null;
        updated_at: Date | null;
        activo: boolean | null;
        direccion: string | null;
        email: string | null;
        telefono: string | null;
        fecha_nacimiento: Date | null;
        rol_id: number;
        password_hash: string;
        ultimo_login: Date | null;
    }) | null>;
    static obtenerPorterosActivos(): Promise<({
        roles: {
            id: number;
            created_at: Date | null;
            updated_at: Date | null;
            nombre: string;
            descripcion: string | null;
            requiere_dni: boolean | null;
            puede_login_email: boolean | null;
        };
    } & {
        id: number;
        dni: string | null;
        nombres: string;
        apellidos: string;
        genero: string | null;
        created_at: Date | null;
        updated_at: Date | null;
        activo: boolean | null;
        direccion: string | null;
        email: string | null;
        telefono: string | null;
        fecha_nacimiento: Date | null;
        rol_id: number;
        password_hash: string;
        ultimo_login: Date | null;
    })[]>;
    static actualizarPortero(id: number, datos: any): Promise<{
        roles: {
            id: number;
            created_at: Date | null;
            updated_at: Date | null;
            nombre: string;
            descripcion: string | null;
            requiere_dni: boolean | null;
            puede_login_email: boolean | null;
        };
    } & {
        id: number;
        dni: string | null;
        nombres: string;
        apellidos: string;
        genero: string | null;
        created_at: Date | null;
        updated_at: Date | null;
        activo: boolean | null;
        direccion: string | null;
        email: string | null;
        telefono: string | null;
        fecha_nacimiento: Date | null;
        rol_id: number;
        password_hash: string;
        ultimo_login: Date | null;
    }>;
}
//# sourceMappingURL=porteroService.d.ts.map