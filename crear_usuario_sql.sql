-- Crear usuario director en Supabase
-- Ejecutar este SQL directamente en Supabase

-- Crear el usuario director
INSERT INTO usuarios (
    dni,
    nombres,
    apellidos,
    email,
    telefono,
    direccion,
    fecha_nacimiento,
    genero,
    password_hash,
    rol_id,
    activo,
    created_at,
    updated_at
) VALUES (
    '12345678',
    'Briyan',
    'Quispe',
    'briyan@escuela.edu.pe',
    '987654321',
    'Lima, Perú',
    '1990-01-01',
    'Masculino',
    '$2b$10$74AXSriRmHkyZYoUtJepku1dD/nwpV4nkIveKzGOuwrrsnpk3EPSi', -- Hash de '159briyan159'
    1, -- Director
    true, -- Activo
    NOW(),
    NOW()
);

-- Usuario director creado exitosamente
