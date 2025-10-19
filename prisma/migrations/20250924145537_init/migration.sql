-- CreateTable
CREATE TABLE "public"."apoderados" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "direccion" TEXT,
    "ocupacion" VARCHAR(100),
    "telefono_emergencia" VARCHAR(15),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "apoderados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."asistencia_general" (
    "id" SERIAL NOT NULL,
    "estudiante_id" INTEGER NOT NULL,
    "usuario_portero_id" INTEGER NOT NULL,
    "fecha" DATE NOT NULL,
    "hora_entrada" TIME(6),
    "hora_salida" TIME(6),
    "estado" VARCHAR(20) DEFAULT 'Presente',
    "observaciones" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "asistencia_general_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."asistencia_salon" (
    "id" SERIAL NOT NULL,
    "estudiante_id" INTEGER NOT NULL,
    "profesor_id" INTEGER NOT NULL,
    "fecha" DATE NOT NULL,
    "estado" VARCHAR(20) DEFAULT 'Presente',
    "observaciones" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "asistencia_salon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."configuracion_sistema" (
    "id" SERIAL NOT NULL,
    "clave" VARCHAR(100) NOT NULL,
    "valor" TEXT NOT NULL,
    "tipo_dato" VARCHAR(20) DEFAULT 'string',
    "descripcion" TEXT,
    "categoria" VARCHAR(50) DEFAULT 'general',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "configuracion_sistema_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."estudiantes" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "apoderado_id" INTEGER NOT NULL,
    "grado_id" INTEGER NOT NULL,
    "seccion_id" INTEGER NOT NULL,
    "codigo_estudiante" VARCHAR(20) NOT NULL,
    "fecha_matricula" DATE DEFAULT CURRENT_DATE,
    "estado" VARCHAR(20) DEFAULT 'Activo',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "estudiantes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."grados" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(20) NOT NULL,
    "nivel" VARCHAR(20) NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "grados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."materias" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "es_especial" BOOLEAN DEFAULT false,
    "permite_multiples_grados" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "materias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."notificaciones" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "titulo" VARCHAR(200) NOT NULL,
    "mensaje" TEXT NOT NULL,
    "tipo" VARCHAR(50) DEFAULT 'General',
    "leido" BOOLEAN DEFAULT false,
    "fecha_envio" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notificaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."profesor_grado_seccion" (
    "id" SERIAL NOT NULL,
    "profesor_id" INTEGER NOT NULL,
    "grado_id" INTEGER NOT NULL,
    "seccion_id" INTEGER NOT NULL,
    "es_tutor" BOOLEAN DEFAULT false,
    "anio_escolar" INTEGER NOT NULL,
    "activo" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profesor_grado_seccion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."profesores" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "especialidad" VARCHAR(100),
    "fecha_ingreso" DATE,
    "codigo_profesor" VARCHAR(20),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profesores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."roles" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "descripcion" TEXT,
    "requiere_dni" BOOLEAN DEFAULT true,
    "puede_login_email" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."secciones" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(10) NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "secciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."solicitudes_permisos" (
    "id" SERIAL NOT NULL,
    "estudiante_id" INTEGER NOT NULL,
    "apoderado_id" INTEGER NOT NULL,
    "fecha_solicitud" DATE NOT NULL,
    "fecha_permiso_inicio" DATE NOT NULL,
    "fecha_permiso_fin" DATE,
    "motivo" TEXT NOT NULL,
    "estado" VARCHAR(20) DEFAULT 'Pendiente',
    "aprobado_por" INTEGER,
    "fecha_respuesta" TIMESTAMP(6),
    "observaciones_respuesta" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "solicitudes_permisos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."usuarios" (
    "id" SERIAL NOT NULL,
    "dni" VARCHAR(8),
    "nombres" VARCHAR(100) NOT NULL,
    "apellidos" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100),
    "telefono" VARCHAR(15),
    "direccion" TEXT,
    "fecha_nacimiento" DATE,
    "genero" VARCHAR(10),
    "rol_id" INTEGER NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "activo" BOOLEAN DEFAULT true,
    "ultimo_login" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_asistencia_general_estudiante_fecha" ON "public"."asistencia_general"("estudiante_id", "fecha");

-- CreateIndex
CREATE UNIQUE INDEX "unique_estudiante_fecha_general" ON "public"."asistencia_general"("estudiante_id", "fecha");

-- CreateIndex
CREATE INDEX "idx_asistencia_salon_estudiante_fecha" ON "public"."asistencia_salon"("estudiante_id", "fecha");

-- CreateIndex
CREATE UNIQUE INDEX "unique_estudiante_fecha_salon" ON "public"."asistencia_salon"("estudiante_id", "fecha");

-- CreateIndex
CREATE UNIQUE INDEX "configuracion_sistema_clave_key" ON "public"."configuracion_sistema"("clave");

-- CreateIndex
CREATE UNIQUE INDEX "estudiantes_codigo_estudiante_key" ON "public"."estudiantes"("codigo_estudiante");

-- CreateIndex
CREATE INDEX "idx_estudiantes_apoderado" ON "public"."estudiantes"("apoderado_id");

-- CreateIndex
CREATE INDEX "idx_estudiantes_codigo" ON "public"."estudiantes"("codigo_estudiante");

-- CreateIndex
CREATE INDEX "idx_estudiantes_grado_seccion" ON "public"."estudiantes"("grado_id", "seccion_id");

-- CreateIndex
CREATE INDEX "idx_estudiantes_usuario" ON "public"."estudiantes"("usuario_id");

-- CreateIndex
CREATE INDEX "idx_notificaciones_fecha" ON "public"."notificaciones"("fecha_envio");

-- CreateIndex
CREATE INDEX "idx_notificaciones_leido" ON "public"."notificaciones"("leido");

-- CreateIndex
CREATE INDEX "idx_notificaciones_usuario" ON "public"."notificaciones"("usuario_id");

-- CreateIndex
CREATE INDEX "idx_profesor_grado_seccion_anio" ON "public"."profesor_grado_seccion"("anio_escolar");

-- CreateIndex
CREATE INDEX "idx_profesor_grado_seccion_grado_seccion" ON "public"."profesor_grado_seccion"("grado_id", "seccion_id");

-- CreateIndex
CREATE INDEX "idx_profesor_grado_seccion_profesor" ON "public"."profesor_grado_seccion"("profesor_id");

-- CreateIndex
CREATE UNIQUE INDEX "unique_tutor_seccion_anio" ON "public"."profesor_grado_seccion"("grado_id", "seccion_id", "anio_escolar", "es_tutor");

-- CreateIndex
CREATE UNIQUE INDEX "profesores_codigo_profesor_key" ON "public"."profesores"("codigo_profesor");

-- CreateIndex
CREATE UNIQUE INDEX "roles_nombre_key" ON "public"."roles"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_dni_key" ON "public"."usuarios"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "public"."usuarios"("email");

-- CreateIndex
CREATE INDEX "idx_usuarios_activo" ON "public"."usuarios"("activo");

-- CreateIndex
CREATE INDEX "idx_usuarios_dni" ON "public"."usuarios"("dni");

-- CreateIndex
CREATE INDEX "idx_usuarios_email" ON "public"."usuarios"("email");

-- CreateIndex
CREATE INDEX "idx_usuarios_rol" ON "public"."usuarios"("rol_id");

-- AddForeignKey
ALTER TABLE "public"."apoderados" ADD CONSTRAINT "apoderados_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."asistencia_general" ADD CONSTRAINT "asistencia_general_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "public"."estudiantes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."asistencia_general" ADD CONSTRAINT "asistencia_general_usuario_portero_id_fkey" FOREIGN KEY ("usuario_portero_id") REFERENCES "public"."usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."asistencia_salon" ADD CONSTRAINT "asistencia_salon_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "public"."estudiantes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."asistencia_salon" ADD CONSTRAINT "asistencia_salon_profesor_id_fkey" FOREIGN KEY ("profesor_id") REFERENCES "public"."profesores"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."estudiantes" ADD CONSTRAINT "estudiantes_apoderado_id_fkey" FOREIGN KEY ("apoderado_id") REFERENCES "public"."apoderados"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."estudiantes" ADD CONSTRAINT "estudiantes_grado_id_fkey" FOREIGN KEY ("grado_id") REFERENCES "public"."grados"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."estudiantes" ADD CONSTRAINT "estudiantes_seccion_id_fkey" FOREIGN KEY ("seccion_id") REFERENCES "public"."secciones"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."estudiantes" ADD CONSTRAINT "estudiantes_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."notificaciones" ADD CONSTRAINT "notificaciones_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."profesor_grado_seccion" ADD CONSTRAINT "profesor_grado_seccion_grado_id_fkey" FOREIGN KEY ("grado_id") REFERENCES "public"."grados"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."profesor_grado_seccion" ADD CONSTRAINT "profesor_grado_seccion_profesor_id_fkey" FOREIGN KEY ("profesor_id") REFERENCES "public"."profesores"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."profesor_grado_seccion" ADD CONSTRAINT "profesor_grado_seccion_seccion_id_fkey" FOREIGN KEY ("seccion_id") REFERENCES "public"."secciones"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."profesores" ADD CONSTRAINT "profesores_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."solicitudes_permisos" ADD CONSTRAINT "solicitudes_permisos_apoderado_id_fkey" FOREIGN KEY ("apoderado_id") REFERENCES "public"."apoderados"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."solicitudes_permisos" ADD CONSTRAINT "solicitudes_permisos_aprobado_por_fkey" FOREIGN KEY ("aprobado_por") REFERENCES "public"."usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."solicitudes_permisos" ADD CONSTRAINT "solicitudes_permisos_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "public"."estudiantes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."usuarios" ADD CONSTRAINT "usuarios_rol_id_fkey" FOREIGN KEY ("rol_id") REFERENCES "public"."roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
