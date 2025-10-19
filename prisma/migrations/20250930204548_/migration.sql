-- AlterTable
ALTER TABLE "public"."estudiantes" ADD COLUMN     "turno" VARCHAR(10) NOT NULL DEFAULT 'mañana';

-- AlterTable
ALTER TABLE "public"."profesores" ADD COLUMN     "tipo_profesor" VARCHAR(20) NOT NULL DEFAULT 'aula';

-- CreateIndex
CREATE INDEX "idx_profesores_tipo" ON "public"."profesores"("tipo_profesor");
