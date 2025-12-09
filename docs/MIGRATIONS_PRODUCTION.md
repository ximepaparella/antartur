# Migraciones para Producción

Este documento lista todas las migraciones que deben ejecutarse en el servidor después de hacer merge del MR.

## Migraciones Pendientes

### 1. Migración de Weekdays (Días de Semana)
**Archivo:** `prisma/migrations/20250120000000_add_tour_weekdays/migration.sql`

Esta migración agrega los campos de días de semana disponibles a la tabla `Tour`:
- `mondayAvailable` (Boolean, default: true)
- `tuesdayAvailable` (Boolean, default: true)
- `wednesdayAvailable` (Boolean, default: true)
- `thursdayAvailable` (Boolean, default: true)
- `fridayAvailable` (Boolean, default: true)
- `saturdayAvailable` (Boolean, default: true)
- `sundayAvailable` (Boolean, default: true)

**SQL de la migración:**
```sql
ALTER TABLE "Tour" ADD COLUMN "mondayAvailable" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "tuesdayAvailable" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "wednesdayAvailable" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "thursdayAvailable" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "fridayAvailable" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "saturdayAvailable" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "sundayAvailable" BOOLEAN NOT NULL DEFAULT true;
```

**Comando recomendado (usando Prisma):**
```bash
cd /ruta/al/proyecto
npx prisma migrate deploy
```

**Comando alternativo (ejecución manual):**
```bash
psql -U postgres -d antartur -f prisma/migrations/20250120000000_add_tour_weekdays/migration.sql
```

**Nota:** Si usas Docker, ejecuta:
```bash
docker exec -i <nombre_contenedor_db> psql -U postgres -d antartur < prisma/migrations/20250120000000_add_tour_weekdays/migration.sql
```

## Verificación Post-Migración

Después de ejecutar las migraciones, verificar:

1. **Verificar que los campos existen:**
```sql
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'Tour' 
AND column_name LIKE '%Available';
```

2. **Verificar que los tours existentes tienen valores por defecto:**
```sql
SELECT id, name, mondayAvailable, tuesdayAvailable, wednesdayAvailable, 
       thursdayAvailable, fridayAvailable, saturdayAvailable, sundayAvailable 
FROM "Tour" 
LIMIT 5;
```

Todos los tours existentes deberían tener `true` en todos los campos de weekdays.

## Notas Importantes

- **Backup:** Siempre hacer backup de la base de datos antes de ejecutar migraciones en producción
- **Horario:** Ejecutar migraciones en horario de bajo tráfico si es posible
- **Rollback:** Si algo sale mal, las migraciones pueden revertirse manualmente eliminando las columnas agregadas

## Orden de Ejecución

1. Hacer backup de la base de datos
2. Ejecutar `npx prisma migrate deploy` o las migraciones manualmente
3. Verificar que las migraciones se aplicaron correctamente
4. Reiniciar la aplicación para que los cambios surtan efecto
