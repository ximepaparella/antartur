# Solución para Error de Migración - Tour Weekdays

## Problema
El error indica que las columnas `mondayAvailable`, `tuesdayAvailable`, etc. no existen en la base de datos de producción, pero el código las necesita.

## Solución Inmediata

Ejecuta la migración manualmente en el servidor de producción:

```bash
# Conectarse al servidor
ssh -p5857 root@149.50.129.68

# Ir al directorio del proyecto
cd /var/www/antartur

# Ejecutar la migración
docker compose -f docker-compose.prod.yml run --rm app npx prisma migrate deploy
```

O si prefieres ejecutarlo directamente sin entrar al servidor:

```bash
ssh -p5857 root@149.50.129.68 "cd /var/www/antartur && docker compose -f docker-compose.prod.yml run --rm app npx prisma migrate deploy"
```

## Verificar que la migración se ejecutó

Después de ejecutar la migración, verifica que las columnas se crearon:

```bash
# Conectarse a la base de datos
docker compose -f docker-compose.prod.yml exec postgres psql -U antartur -d antartur

# En psql, ejecutar:
\d "Tour"

# Deberías ver las columnas:
# mondayAvailable    | boolean | not null default true
# tuesdayAvailable   | boolean | not null default true
# wednesdayAvailable | boolean | not null default true
# thursdayAvailable  | boolean | not null default true
# fridayAvailable    | boolean | not null default true
# saturdayAvailable  | boolean | not null default true
# sundayAvailable    | boolean | not null default true
```

## Verificar el estado de las migraciones

Para ver qué migraciones se han aplicado:

```bash
docker compose -f docker-compose.prod.yml run --rm app npx prisma migrate status
```

## Si la migración falla

Si la migración falla por alguna razón, puedes ejecutarla manualmente con SQL:

```bash
# Conectarse a la base de datos
docker compose -f docker-compose.prod.yml exec postgres psql -U antartur -d antartur

# Ejecutar el SQL de la migración manualmente
ALTER TABLE "Tour" ADD COLUMN "mondayAvailable" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Tour" ADD COLUMN "tuesdayAvailable" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Tour" ADD COLUMN "wednesdayAvailable" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Tour" ADD COLUMN "thursdayAvailable" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Tour" ADD COLUMN "fridayAvailable" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Tour" ADD COLUMN "saturdayAvailable" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Tour" ADD COLUMN "sundayAvailable" BOOLEAN NOT NULL DEFAULT true;
```

Luego marca la migración como aplicada:

```bash
docker compose -f docker-compose.prod.yml run --rm app npx prisma migrate resolve --applied 20250120000000_add_tour_weekdays
```

## Prevención Futura

Asegúrate de que el script de deploy siempre ejecute las migraciones ANTES de reiniciar los servicios. El script `scripts/deploy.sh` ya lo hace correctamente en la línea 48.
