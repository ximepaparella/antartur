# .gitignore Review - Archivos que DEBEN estar ignorados

## ⚠️ CRÍTICO: Archivos actualmente rastreados que NO deberían estarlo

Los siguientes archivos están siendo rastreados por Git pero **DEBEN ser removidos del tracking**:

### 1. `.env` ⚠️ **SEGURIDAD CRÍTICA**
- **Estado**: Actualmente rastreado
- **Riesgo**: Contiene credenciales y secretos de la aplicación
- **Acción requerida**: 
  ```bash
  git rm --cached .env
  ```
- **Nota**: `.env.example` SÍ debe estar rastreado como plantilla

### 2. `site.css` y `site.css.map`
- **Estado**: Actualmente rastreados
- **Razón**: Son archivos compilados desde `site.scss`
- **Acción requerida**:
  ```bash
  git rm --cached site.css site.css.map
  ```
- **Nota**: `site.scss` SÍ debe estar rastreado (es el fuente)

### 3. `lighthouse-report.html`
- **Estado**: Actualmente rastreado
- **Razón**: Reporte generado automáticamente
- **Acción requerida**:
  ```bash
  git rm --cached lighthouse-report.html
  ```

### 4. `index.html`
- **Estado**: Actualmente rastreado
- **Razón**: Parece ser un archivo de prueba/test
- **Acción requerida**:
  ```bash
  git rm --cached index.html
  ```
- **Nota**: Si es necesario para el proyecto, mantenerlo, pero revisar su propósito

## ✅ Archivos correctamente ignorados

- `tsconfig.tsbuildinfo` - Cache de TypeScript
- `node_modules/` - Dependencias
- `.next/` - Build de Next.js
- `.DS_Store` - Archivos del sistema macOS

## 📋 Archivos agregados al .gitignore

Se actualizó el `.gitignore` para incluir:

### Entorno y configuración
- `.env` (archivo principal, no solo `.env.local`)
- Variantes de `.env.*.local`

### Build y compilación
- `site.css` y `site.css.map` (CSS compilado)
- `*.tsbuildinfo` (ya estaba)
- `lighthouse-report.html` y `*.html.report`

### IDE y editores
- `.vscode/`
- `.idea/`
- `*.swp`, `*.swo`, `*~` (archivos temporales de editores)

### Docker y contenedores
- `postgres_data/` (volúmenes de Docker)
- `pgadmin_data/`
- `backups/` (directorio de backups mencionado en docker-compose)
- `certbot/` (certificados SSL)

### Sistema operativo
- `.DS_Store` y variantes
- `Thumbs.db` (Windows)
- Otros archivos temporales del sistema

### Logs y temporales
- `logs/`
- Varios tipos de logs (`*.log`, `npm-debug.log*`, etc.)
- Archivos temporales (`*.tmp`, `*.temp`, `*.bak`, `*.cache`)

## 🔧 Comandos para limpiar archivos rastreados

Ejecuta estos comandos para remover los archivos sensibles del tracking de Git:

```bash
# Remover archivos sensibles del tracking (NO los elimina del disco)
git rm --cached .env
git rm --cached site.css site.css.map
git rm --cached lighthouse-report.html
git rm --cached index.html

# Verificar que ya no están rastreados
git status

# Commit los cambios
git add .gitignore
git commit -m "chore: update .gitignore and remove sensitive files from tracking"
```

## 📝 Notas importantes

1. **`.env`**: Este archivo contiene credenciales. Si ya fue commitado al repositorio:
   - Considera rotar todas las credenciales que contiene
   - Asegúrate de que no esté en el historial de Git público
   - Si el repo es público, considera usar GitHub Secret Scanning o similar

2. **`/docs`**: El `.gitignore` anterior ignoraba `/docs`, pero ahora está comentado porque la documentación debería estar rastreada. Si prefieres ignorarla, descomenta la línea.

3. **Prisma**: Los archivos generados de Prisma están en `node_modules/.prisma/`, que ya está ignorado por `node_modules/`.

4. **Docker volumes**: Los volúmenes nombrados (`postgres_data`, `pgadmin_data`) son manejados por Docker y no deberían estar en Git.

## ✅ Verificación

Después de aplicar los cambios, verifica que los archivos están correctamente ignorados:

```bash
# Verificar que .env está ignorado
git check-ignore -v .env

# Verificar que site.css está ignorado
git check-ignore -v site.css

# Ver todos los archivos ignorados
git status --ignored
```

