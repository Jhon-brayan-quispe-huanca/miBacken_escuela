# Sistema de Ausencias Automáticas

## Descripción General

El sistema de ausencias automáticas permite marcar automáticamente como ausentes a los estudiantes que no han registrado su asistencia en un día determinado. Esta funcionalidad se ejecuta diariamente de forma automática y también puede ser activada manualmente por el portero.

## Funcionalidades Implementadas

### 1. Marcado Automático Diario

- **Horario**: Se ejecuta automáticamente todos los días a las 8:00 PM
- **Proceso**: Identifica estudiantes activos sin registro de asistencia del día actual
- **Acción**: Los marca como "Ausente" con observaciones automáticas

### 2. Marcado Manual por Portero

- **Endpoint**: `POST /api/portero/asistencia/marcar-ausencias`
- **Autenticación**: Requiere token JWT de usuario con rol de portero
- **Funcionalidad**: Permite ejecutar el proceso de marcado de ausencias bajo demanda

## Detalles Técnicos

### Método Principal: `marcarAusenciasAutomaticas`

**Ubicación**: `src/services/asistenciaService.ts`

**Parámetros**:
- `fecha` (opcional): Fecha para la cual marcar ausencias. Por defecto usa la fecha actual
- `usuario_portero_id` (opcional): ID del portero que ejecuta la acción

**Proceso**:
1. Obtiene todos los estudiantes activos
2. Identifica estudiantes con registro de asistencia para la fecha especificada
3. Determina estudiantes sin registro de asistencia
4. Crea registros de ausencia para estudiantes sin asistencia
5. Retorna estadísticas del proceso

**Retorno**:
```typescript
{
  ausenciasMarcadas: number,
  estudiantesProcesados: number,
  estudiantesConAsistencia: number,
  detalle: string
}
```

### Tarea Programada

**Configuración**: `src/services/scheduler.ts`
- Utiliza `node-cron` para programación
- Patrón cron: `0 20 * * *` (8:00 PM diario)
- Ejecuta `marcarAusenciasAutomaticas()` sin parámetros

### Endpoint Manual

**Ruta**: `/api/portero/asistencia/marcar-ausencias`
**Método**: POST
**Controlador**: `src/controllers/porteroController.ts` - `marcarAusenciasManual`

**Autenticación**:
- Requiere header `Authorization: Bearer <token>`
- Token debe ser de usuario con rol de portero

**Respuesta Exitosa**:
```json
{
  "success": true,
  "message": "Marcado de ausencias ejecutado correctamente",
  "data": {
    "ausenciasMarcadas": 1,
    "estudiantesProcesados": 3,
    "estudiantesConAsistencia": 2,
    "detalle": "Se marcaron 1 estudiantes como ausentes automáticamente"
  }
}
```

## Configuración de Base de Datos

### Tabla: `asistencia_general`

Los registros de ausencia automática se crean con:
- `estado`: "Ausente"
- `observaciones`: "Ausencia marcada automáticamente por el sistema a las [hora]"
- `fecha`: Fecha del día para el cual se marca la ausencia
- `hora_entrada`: null
- `hora_salida`: null
- `usuario_portero_id`: ID del portero (si se especifica)

## Logs y Monitoreo

### Logs del Scheduler
- Inicio de tareas programadas al arrancar el servidor
- Ejecución diaria del marcado automático
- Estadísticas de estudiantes procesados

### Logs del Endpoint Manual
- Autenticación de portero
- Ejecución del proceso de marcado
- Resultados detallados por estudiante

## Casos de Uso

### 1. Ejecución Automática Diaria
- El sistema ejecuta automáticamente a las 8:00 PM
- Marca como ausentes a estudiantes sin registro del día
- No requiere intervención manual

### 2. Ejecución Manual por Portero
- El portero puede ejecutar el proceso en cualquier momento
- Útil para correcciones o ejecuciones fuera del horario programado
- Proporciona feedback inmediato sobre el proceso

### 3. Verificación de Resultados
- Los registros se crean en `asistencia_general`
- Se pueden consultar a través de los endpoints existentes de asistencia
- Las observaciones indican que fue marcado automáticamente

## Consideraciones de Seguridad

1. **Autenticación**: Solo usuarios con rol de portero pueden ejecutar manualmente
2. **Validación**: Se verifica la existencia del usuario antes de procesar
3. **Logs**: Todas las acciones quedan registradas en los logs del sistema
4. **Transacciones**: El proceso utiliza transacciones de base de datos para consistencia

## Mantenimiento

### Monitoreo Recomendado
- Verificar logs diarios para confirmar ejecución automática
- Revisar estadísticas de estudiantes procesados
- Monitorear errores en la ejecución del scheduler

### Posibles Mejoras Futuras
- Configuración de horario de ejecución desde interfaz
- Notificaciones por email de ausencias marcadas
- Reportes automáticos de ausencias por período
- Exclusión de días festivos o no lectivos