-- ========================================
-- SISTEMA DE ASISTENCIA ESCOLAR
-- Base de datos PostgreSQL completa
-- ========================================

-- Crear la base de datos (ejecutar como superusuario)
-- CREATE DATABASE sistema_asistencia;

-- Usar la base de datos
-- \c sistema_asistencia;

-- ========================================
-- ROLES - 4 roles fijos con IDs específicos
-- ========================================
CREATE TABLE roles (
    id INTEGER PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL,
    descripcion TEXT,
    requiere_dni BOOLEAN DEFAULT true,
    puede_login_email BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Insertar los 4 roles fijos
INSERT INTO roles (id, nombre, descripcion, requiere_dni, puede_login_email) VALUES
(1, 'Director', 'Director de la institución educativa', true, true),
(2, 'Profesor', 'Profesor de aula', true, true),
(3, 'Portero', 'Personal de portería', true, false),
(4, 'Apoderado', 'Padre o madre de familia', true, false);

-- ========================================
-- USUARIOS - Solo 4 tipos (sin estudiantes)
-- ========================================
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    dni VARCHAR(8) UNIQUE,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    telefono VARCHAR(15),
    direccion TEXT,
    fecha_nacimiento DATE,
    genero VARCHAR(10),
    rol_id INTEGER NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    activo BOOLEAN DEFAULT true,
    ultimo_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    FOREIGN KEY (rol_id) REFERENCES roles(id) ON DELETE RESTRICT ON UPDATE NO ACTION
);

-- Índices para usuarios
CREATE INDEX idx_usuarios_activo ON usuarios(activo);
CREATE INDEX idx_usuarios_dni ON usuarios(dni);
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_rol ON usuarios(rol_id);

-- ========================================
-- APODERADOS - Simplificado
-- ========================================
CREATE TABLE apoderados (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL,
    direccion TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE ON UPDATE NO ACTION
);

-- ========================================
-- GRADOS
-- ========================================
CREATE TABLE grados (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(20) NOT NULL,
    nivel VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ========================================
-- SECCIONES
-- ========================================
CREATE TABLE secciones (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ========================================
-- ESTUDIANTES - CON DATOS PERSONALES DIRECTOS
-- ========================================
CREATE TABLE estudiantes (
    id SERIAL PRIMARY KEY,
    apoderado_id INTEGER NOT NULL,
    grado_id INTEGER NOT NULL,
    seccion_id INTEGER NOT NULL,
    
    -- DATOS PERSONALES (NUEVOS)
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    dni VARCHAR(8) UNIQUE,
    genero VARCHAR(10),
    
    -- DATOS ACADÉMICOS
    codigo_estudiante VARCHAR(20) UNIQUE NOT NULL,
    estado VARCHAR(20) DEFAULT 'Activo',
    turno VARCHAR(10) DEFAULT 'mañana',
    
    -- AUDITORÍA
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    FOREIGN KEY (apoderado_id) REFERENCES apoderados(id) ON DELETE NO ACTION ON UPDATE NO ACTION,
    FOREIGN KEY (grado_id) REFERENCES grados(id) ON DELETE NO ACTION ON UPDATE NO ACTION,
    FOREIGN KEY (seccion_id) REFERENCES secciones(id) ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- Índices para estudiantes
CREATE INDEX idx_estudiantes_apoderado ON estudiantes(apoderado_id);
CREATE INDEX idx_estudiantes_codigo ON estudiantes(codigo_estudiante);
CREATE INDEX idx_estudiantes_grado_seccion ON estudiantes(grado_id, seccion_id);
CREATE INDEX idx_estudiantes_dni ON estudiantes(dni);

-- ========================================
-- PROFESORES
-- ========================================
CREATE TABLE profesores (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL,
    especialidad VARCHAR(100),
    fecha_ingreso DATE,
    codigo_profesor VARCHAR(20) UNIQUE,
    tipo_profesor VARCHAR(20) DEFAULT 'aula',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE ON UPDATE NO ACTION
);

-- Índices para profesores
CREATE INDEX idx_profesores_tipo ON profesores(tipo_profesor);

-- ========================================
-- PROFESOR GRADO SECCION
-- ========================================
CREATE TABLE profesor_grado_seccion (
    id SERIAL PRIMARY KEY,
    profesor_id INTEGER NOT NULL,
    grado_id INTEGER NOT NULL,
    seccion_id INTEGER NOT NULL,
    es_tutor BOOLEAN DEFAULT false,
    anio_escolar INTEGER NOT NULL,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    FOREIGN KEY (profesor_id) REFERENCES profesores(id) ON DELETE NO ACTION ON UPDATE NO ACTION,
    FOREIGN KEY (grado_id) REFERENCES grados(id) ON DELETE NO ACTION ON UPDATE NO ACTION,
    FOREIGN KEY (seccion_id) REFERENCES secciones(id) ON DELETE NO ACTION ON UPDATE NO ACTION,
    
    UNIQUE(profesor_id, grado_id, seccion_id, anio_escolar)
);

-- Índices para profesor_grado_seccion
CREATE INDEX idx_profesor_grado_seccion_anio ON profesor_grado_seccion(anio_escolar);
CREATE INDEX idx_profesor_grado_seccion_grado_seccion ON profesor_grado_seccion(grado_id, seccion_id);
CREATE INDEX idx_profesor_grado_seccion_profesor ON profesor_grado_seccion(profesor_id);

-- ========================================
-- ASISTENCIA GENERAL
-- ========================================
CREATE TABLE asistencia_general (
    id SERIAL PRIMARY KEY,
    estudiante_id INTEGER NOT NULL,
    usuario_portero_id INTEGER NOT NULL,
    fecha DATE NOT NULL,
    hora_entrada TIME,
    hora_salida TIME,
    estado VARCHAR(20) DEFAULT 'Presente',
    observaciones TEXT,
    permiso_id INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id) ON DELETE NO ACTION ON UPDATE NO ACTION,
    FOREIGN KEY (usuario_portero_id) REFERENCES usuarios(id) ON DELETE NO ACTION ON UPDATE NO ACTION,
    
    UNIQUE(estudiante_id, fecha)
);

-- Índices para asistencia_general
CREATE INDEX idx_asistencia_general_estudiante_fecha ON asistencia_general(estudiante_id, fecha);

-- ========================================
-- ASISTENCIA SALON
-- ========================================
CREATE TABLE asistencia_salon (
    id SERIAL PRIMARY KEY,
    estudiante_id INTEGER NOT NULL,
    profesor_id INTEGER NOT NULL,
    fecha DATE NOT NULL,
    estado VARCHAR(20) DEFAULT 'Presente',
    observaciones TEXT,
    permiso_id INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id) ON DELETE NO ACTION ON UPDATE NO ACTION,
    FOREIGN KEY (profesor_id) REFERENCES profesores(id) ON DELETE NO ACTION ON UPDATE NO ACTION,
    
    UNIQUE(estudiante_id, fecha, profesor_id)
);

-- Índices para asistencia_salon
CREATE INDEX idx_asistencia_salon_estudiante_fecha ON asistencia_salon(estudiante_id, fecha);

-- ========================================
-- SOLICITUDES PERMISOS
-- ========================================
CREATE TABLE solicitudes_permisos (
    id SERIAL PRIMARY KEY,
    estudiante_id INTEGER NOT NULL,
    apoderado_id INTEGER NOT NULL,
    fecha_solicitud DATE NOT NULL,
    fecha_permiso_inicio DATE NOT NULL,
    fecha_permiso_fin DATE,
    motivo TEXT NOT NULL,
    estado VARCHAR(20) DEFAULT 'Pendiente',
    aprobado_por INTEGER,
    fecha_respuesta TIMESTAMP,
    observaciones_respuesta TEXT,
    
    -- NUEVOS CAMPOS PARA DOCUMENTOS (PDF Y FOTO)
    documento_path VARCHAR(500),
    documento_nombre VARCHAR(255),
    documento_tipo VARCHAR(50),
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id) ON DELETE NO ACTION ON UPDATE NO ACTION,
    FOREIGN KEY (apoderado_id) REFERENCES apoderados(id) ON DELETE NO ACTION ON UPDATE NO ACTION,
    FOREIGN KEY (aprobado_por) REFERENCES usuarios(id) ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- ========================================
-- CARNETS
-- ========================================
CREATE TABLE carnets (
    id SERIAL PRIMARY KEY,
    estudiante_id INTEGER UNIQUE NOT NULL,
    codigo_qr TEXT,
    foto_url TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id) ON DELETE CASCADE ON UPDATE NO ACTION
);

-- Índices para carnets
CREATE INDEX idx_carnets_estudiante ON carnets(estudiante_id);
CREATE INDEX idx_carnets_activo ON carnets(activo);

-- ========================================
-- NOTIFICACIONES - MEJORADO PARA SISTEMA DE NOTIFICACIONES AVANZADO
-- ========================================
CREATE TABLE notificaciones (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    mensaje TEXT NOT NULL,
    tipo VARCHAR(50) DEFAULT 'General',
    leido BOOLEAN DEFAULT false,
    fecha_envio TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- NUEVOS CAMPOS PARA NOTIFICACIONES AVANZADAS
    datos_adicionales JSONB, -- {estudiante: "Ana", hora: "08:15", estado: "Presente"}
    estudiante_id INTEGER, -- ID del estudiante relacionado
    asistencia_id INTEGER, -- ID del registro de asistencia
    prioridad VARCHAR(20) DEFAULT 'media', -- "alta", "media", "baja"
    categoria VARCHAR(50) DEFAULT 'general', -- "asistencia", "permiso", "sistema"
    fecha_leido TIMESTAMP, -- Cuándo se leyó
    accion_requerida VARCHAR(50), -- "aprobar", "revisar", "responder"
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE NO ACTION ON UPDATE NO ACTION,
    FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id) ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- Índices para notificaciones
CREATE INDEX idx_notificaciones_fecha ON notificaciones(fecha_envio);
CREATE INDEX idx_notificaciones_leido ON notificaciones(leido);
CREATE INDEX idx_notificaciones_usuario ON notificaciones(usuario_id);
CREATE INDEX idx_notificaciones_estudiante ON notificaciones(estudiante_id);
CREATE INDEX idx_notificaciones_categoria ON notificaciones(categoria);
CREATE INDEX idx_notificaciones_prioridad ON notificaciones(prioridad);

-- ========================================
-- CONFIGURACION SISTEMA
-- ========================================
CREATE TABLE configuracion_sistema (
    id SERIAL PRIMARY KEY,
    clave VARCHAR(100) UNIQUE NOT NULL,
    valor TEXT NOT NULL,
    tipo_dato VARCHAR(20) DEFAULT 'string',
    descripcion TEXT,
    categoria VARCHAR(50) DEFAULT 'general',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ========================================
-- DATOS INICIALES
-- ========================================

-- Insertar grados
INSERT INTO grados (nombre, nivel) VALUES
('1er Grado', 'Primaria'),
('2do Grado', 'Primaria'),
('3er Grado', 'Primaria'),
('4to Grado', 'Primaria'),
('5to Grado', 'Primaria'),
('6to Grado', 'Primaria'),
('1er Año', 'Secundaria'),
('2do Año', 'Secundaria'),
('3er Año', 'Secundaria'),
('4to Año', 'Secundaria'),
('5to Año', 'Secundaria');

-- Insertar secciones
INSERT INTO secciones (nombre) VALUES
('A'), ('B'), ('C'), ('D'), ('E');

-- Insertar configuración del sistema
INSERT INTO configuracion_sistema (clave, valor, descripcion, categoria) VALUES
('nombre_institucion', 'Institución Educativa Mariano Núñez', 'Nombre de la institución educativa', 'general'),
('año_escolar', '2024', 'Año escolar actual', 'academico'),
('hora_inicio_clases', '08:00', 'Hora de inicio de clases', 'horarios'),
('hora_fin_clases', '15:00', 'Hora de fin de clases', 'horarios'),
('tolerancia_tardanza', '15', 'Tolerancia en minutos para tardanzas', 'asistencia');

-- ========================================
-- TRIGGERS PARA ACTUALIZAR updated_at
-- ========================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para todas las tablas
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_apoderados_updated_at BEFORE UPDATE ON apoderados FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_estudiantes_updated_at BEFORE UPDATE ON estudiantes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profesores_updated_at BEFORE UPDATE ON profesores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_grados_updated_at BEFORE UPDATE ON grados FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_secciones_updated_at BEFORE UPDATE ON secciones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_asistencia_general_updated_at BEFORE UPDATE ON asistencia_general FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_asistencia_salon_updated_at BEFORE UPDATE ON asistencia_salon FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_solicitudes_permisos_updated_at BEFORE UPDATE ON solicitudes_permisos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_carnets_updated_at BEFORE UPDATE ON carnets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profesor_grado_seccion_updated_at BEFORE UPDATE ON profesor_grado_seccion FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notificaciones_updated_at BEFORE UPDATE ON notificaciones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_configuracion_sistema_updated_at BEFORE UPDATE ON configuracion_sistema FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- VISTAS ÚTILES
-- ========================================

-- Vista para estudiantes con información completa
CREATE VIEW vista_estudiantes_completa AS
SELECT 
    e.id,
    e.nombres,
    e.apellidos,
    e.dni,
    e.genero,
    e.codigo_estudiante,
    e.estado,
    e.turno,
    g.nombre as grado,
    g.nivel,
    s.nombre as seccion,
    a.id as apoderado_id,
    u.nombres as apoderado_nombres,
    u.apellidos as apoderado_apellidos,
    u.email as apoderado_email,
    u.telefono as apoderado_telefono
FROM estudiantes e
JOIN grados g ON e.grado_id = g.id
JOIN secciones s ON e.seccion_id = s.id
JOIN apoderados a ON e.apoderado_id = a.id
JOIN usuarios u ON a.usuario_id = u.id;

-- Vista para profesores con información completa
CREATE VIEW vista_profesores_completa AS
SELECT 
    p.id,
    p.especialidad,
    p.fecha_ingreso,
    p.codigo_profesor,
    p.tipo_profesor,
    u.nombres,
    u.apellidos,
    u.email,
    u.telefono,
    r.nombre as rol
FROM profesores p
JOIN usuarios u ON p.usuario_id = u.id
JOIN roles r ON u.rol_id = r.id;

-- Vista para asistencias del día
CREATE VIEW vista_asistencias_hoy AS
SELECT 
    ag.id,
    e.codigo_estudiante,
    e.nombres,
    e.apellidos,
    g.nombre as grado,
    s.nombre as seccion,
    ag.fecha,
    ag.hora_entrada,
    ag.hora_salida,
    ag.estado,
    ag.observaciones,
    u.nombres as portero_nombres,
    u.apellidos as portero_apellidos
FROM asistencia_general ag
JOIN estudiantes e ON ag.estudiante_id = e.id
JOIN grados g ON e.grado_id = g.id
JOIN secciones s ON e.seccion_id = s.id
JOIN usuarios u ON ag.usuario_portero_id = u.id
WHERE ag.fecha = CURRENT_DATE;

-- ========================================
-- COMENTARIOS EN TABLAS
-- ========================================

COMMENT ON TABLE roles IS 'Roles del sistema: Director, Profesor, Portero, Apoderado';
COMMENT ON TABLE usuarios IS 'Usuarios del sistema (sin estudiantes)';
COMMENT ON TABLE apoderados IS 'Apoderados de los estudiantes';
COMMENT ON TABLE estudiantes IS 'Estudiantes con datos personales directos';
COMMENT ON TABLE profesores IS 'Profesores de la institución';
COMMENT ON TABLE grados IS 'Grados académicos (1er Grado, 2do Año, etc.)';
COMMENT ON TABLE secciones IS 'Secciones de cada grado (A, B, C, D, E)';
COMMENT ON TABLE asistencia_general IS 'Asistencia general de estudiantes (portería)';
COMMENT ON TABLE asistencia_salon IS 'Asistencia por salón de clases';
COMMENT ON TABLE solicitudes_permisos IS 'Solicitudes de permisos de estudiantes';
COMMENT ON TABLE carnets IS 'Carnets de estudiantes con códigos QR';
COMMENT ON TABLE profesor_grado_seccion IS 'Asignación de profesores a grados y secciones';
COMMENT ON TABLE notificaciones IS 'Sistema de notificaciones avanzado';
COMMENT ON TABLE configuracion_sistema IS 'Configuración general del sistema';

-- ========================================
-- FIN DEL SCRIPT
-- ========================================
