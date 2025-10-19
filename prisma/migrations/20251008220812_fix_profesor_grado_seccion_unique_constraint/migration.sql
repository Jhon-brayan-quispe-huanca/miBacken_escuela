/*
  Warnings:

  - A unique constraint covering the columns `[grado_id,seccion_id,anio_escolar]` on the table `profesor_grado_seccion` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."unique_tutor_seccion_anio";

-- CreateIndex
CREATE UNIQUE INDEX "unique_grado_seccion_anio" ON "public"."profesor_grado_seccion"("grado_id", "seccion_id", "anio_escolar");
