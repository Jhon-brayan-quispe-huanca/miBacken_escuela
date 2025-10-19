export declare class PorteroService {
    static obtenerPorteroPorId(id: number): Promise<({
        roles: {
            id: number;
            nombre: string;
            created_at: Date | null;
            updated_at: Date | null;
            descripcion: string | null;
            requiere_dni: boolean | null;
            puede_login_email: boolean | null;
        };
    } & {
        email: string | null;
        id: number;
        dni: string | null;
        nombres: string;
        apellidos: string;
        telefono: string | null;
        direccion: string | null;
        fecha_nacimiento: Date | null;
        genero: string | null;
        rol_id: number;
        password_hash: string;
        activo: boolean | null;
        ultimo_login: Date | null;
        created_at: Date | null;
        updated_at: Date | null;
    }) | null>;
    static obtenerPorterosActivos(): Promise<({
        roles: {
            id: number;
            nombre: string;
            created_at: Date | null;
            updated_at: Date | null;
            descripcion: string | null;
            requiere_dni: boolean | null;
            puede_login_email: boolean | null;
        };
    } & {
        email: string | null;
        id: number;
        dni: string | null;
        nombres: string;
        apellidos: string;
        telefono: string | null;
        direccion: string | null;
        fecha_nacimiento: Date | null;
        genero: string | null;
        rol_id: number;
        password_hash: string;
        activo: boolean | null;
        ultimo_login: Date | null;
        created_at: Date | null;
        updated_at: Date | null;
    })[]>;
    static actualizarPortero(id: number, datos: any): Promise<{
        roles: {
            id: number;
            nombre: string;
            created_at: Date | null;
            updated_at: Date | null;
            descripcion: string | null;
            requiere_dni: boolean | null;
            puede_login_email: boolean | null;
        };
    } & {
        email: string | null;
        id: number;
        dni: string | null;
        nombres: string;
        apellidos: string;
        telefono: string | null;
        direccion: string | null;
        fecha_nacimiento: Date | null;
        genero: string | null;
        rol_id: number;
        password_hash: string;
        activo: boolean | null;
        ultimo_login: Date | null;
        created_at: Date | null;
        updated_at: Date | null;
    }>;
}
//# sourceMappingURL=porteroService.d.ts.map