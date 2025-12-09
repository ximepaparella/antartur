# Checklist de Deployment - CRUD Tours

## ✅ Estado Local

### Migraciones
- ✅ Las columnas `mondayAvailable`, `tuesdayAvailable`, etc. existen en la base de datos local
- ✅ La migración `20250120000000_add_tour_weekdays` está aplicada
- ✅ Prisma Client regenerado correctamente
- ✅ Build completado sin errores

### Código
- ✅ Errores de TypeScript corregidos:
  - Importación de `AvailabilityManager` corregida
  - Props inválidas (`compact`, `variant="danger"`) eliminadas
  - Exportación de `BulkActions` corregida
- ✅ Build exitoso (solo warnings de deprecación de Sass, no críticos)

## 📋 Scripts de Producción

### ✅ `scripts/deploy.sh`
El script ya ejecuta las migraciones correctamente:
```bash
# Línea 48: Ejecuta migraciones ANTES de reiniciar servicios
docker compose -f docker-compose.prod.yml run --rm app npx prisma migrate deploy
```

### ✅ `.github/workflows/deploy.yml`
El workflow de GitHub Actions también ejecuta migraciones:
```bash
# Línea 40: Ejecuta migraciones ANTES de reiniciar servicios
docker compose -f docker-compose.prod.yml run --rm app npx prisma migrate deploy
```

### ✅ `scripts/run-migration.sh` (Nuevo)
Script creado para ejecutar migraciones manualmente si es necesario.

## 🚀 Pasos para Deploy en Producción

Cuando se abra el PR y se haga merge a `main`:

1. **Automático (GitHub Actions)**
   - El workflow se ejecutará automáticamente
   - Ejecutará las migraciones antes de reiniciar servicios
   - Verificará el estado de los contenedores

2. **Manual (si es necesario)**
   ```bash
   ssh -p5857 root@149.50.129.68
   cd /var/www/antartur
   ./scripts/deploy.sh
   ```

3. **Solo migraciones (si es necesario)**
   ```bash
   ssh -p5857 root@149.50.129.68
   cd /var/www/antartur
   ./scripts/run-migration.sh
   ```

## ⚠️ Notas Importantes

1. **Las migraciones se ejecutan ANTES de reiniciar servicios** - Esto es crítico para evitar errores
2. **La migración `20250120000000_add_tour_weekdays` debe aplicarse** antes de que el código nuevo intente usar las columnas
3. **Si la migración falla en producción**, se puede ejecutar manualmente con SQL (ver `docs/MIGRATION_FIX.md`)

## 🔍 Verificación Post-Deploy

Después del deploy, verificar:

```bash
# Verificar que las columnas existen
docker compose -f docker-compose.prod.yml exec postgres psql -U antartur -d antartur -c "\d \"Tour\"" | grep -i "available"

# Verificar estado de migraciones
docker compose -f docker-compose.prod.yml run --rm app npx prisma migrate status

# Verificar logs de la aplicación
docker compose -f docker-compose.prod.yml logs --tail=50 app
```

## 📝 Archivos Modificados

- `src/modules/admin/components/TourForm/TourForm.tsx` - Importación corregida
- `src/modules/tours/components/admin/AvailabilityManager/BulkActions.tsx` - Props corregidas
- `src/modules/tours/components/admin/AvailabilityManager/BulkActions/index.ts` - Exportación corregida
- `scripts/run-migration.sh` - Nuevo script para migraciones manuales
- `docs/MIGRATION_FIX.md` - Documentación de solución de problemas
- `docs/CRUD_DEPLOYMENT_CHECKLIST.md` - Este archivo
