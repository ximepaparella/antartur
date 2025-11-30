# 🚀 Guía de Configuración Completa - Antartur Site

## 📋 Resumen Rápido

**Lo que necesitas hacer:**
1. ✅ Levantar PostgreSQL con Docker
2. ✅ Actualizar `DATABASE_URL` en `.env`
3. ✅ Crear las tablas con Prisma
4. ✅ Verificar que todo funciona

**Tiempo estimado:** 5-10 minutos

---

## Paso 1: Levantar PostgreSQL con Docker

```bash
# Opción A: Solo PostgreSQL (más rápido)
docker-compose up -d postgres

# Opción B: PostgreSQL + pgAdmin (interfaz web para ver la DB)
docker-compose up -d postgres pgadmin
```

**Espera 10-15 segundos** para que PostgreSQL termine de inicializarse.

**Verificar que está corriendo:**
```bash
docker ps | grep postgres
```

Deberías ver algo como:
```
antartur_postgres   postgres:16-alpine   Up X seconds   0.0.0.0:5432->5432/tcp
```

---

## Paso 2: Actualizar el archivo `.env`

Tu archivo `.env` actual tiene:
```env
DATABASE_URL=postgresql://antartur:change-this-in-production@postgres:5432/antartur
```

**Problema:** Está usando `postgres` como host, que es el nombre del servicio Docker. Para desarrollo local, necesitas usar `localhost`.

**Solución:** Actualiza la línea de `DATABASE_URL` a:

```env
DATABASE_URL=postgresql://antartur:antartur_dev_password@localhost:5432/antartur
```

**¿De dónde salen estos valores?**
- `antartur` = usuario (definido en docker-compose.yml línea 10)
- `antartur_dev_password` = contraseña (definida en docker-compose.yml línea 11)
- `localhost` = host (porque estás fuera del contenedor Docker)
- `5432` = puerto (expuesto en docker-compose.yml línea 17)
- `antartur` = nombre de la base de datos (definido en docker-compose.yml línea 12)

---

## Paso 3: Crear las Tablas en la Base de Datos

Una vez que PostgreSQL esté corriendo y `.env` esté actualizado:

```bash
# 1. Generar Prisma Client (si no está generado)
npx prisma generate

# 2. Crear las tablas en la base de datos
npx prisma db push
```

**¿Qué hace `prisma db push`?**
- Lee tu `prisma/schema.prisma`
- Crea las tablas `Tour`, `Booking`, `User` en PostgreSQL
- No crea migraciones (más rápido para desarrollo)

**Si prefieres usar migraciones (recomendado para producción):**
```bash
npx prisma migrate dev --name init
```

---

## Paso 4: Verificar que Todo Funciona

### Opción A: Probar la API de Test DB

```bash
# Iniciar el servidor
npm run dev

# En otra terminal, probar la conexión
curl http://localhost:3000/api/test-db
```

**Respuesta esperada:**
```json
{
  "status": "success",
  "message": "Database connection successful",
  "database": "PostgreSQL",
  "connected": true,
  "timestamp": "2024-12-..."
}
```

### Opción B: Usar Prisma Studio (Interfaz Visual)

```bash
npx prisma studio
```

Esto abrirá `http://localhost:5555` donde puedes ver las tablas creadas.

### Opción C: Usar pgAdmin (Si lo levantaste)

1. Abre `http://localhost:5050`
2. Login:
   - Email: `admin@antartur.com`
   - Password: `admin`
3. Click derecho en "Servers" → "Register" → "Server"
4. **General tab:**
   - Name: `Antartur Local`
5. **Connection tab:**
   - Host: `postgres` (si estás dentro de Docker) o `localhost` (si estás fuera)
   - Port: `5432`
   - Username: `antartur`
   - Password: `antartur_dev_password`
6. Click "Save"
7. Expande "Antartur Local" → "Databases" → "antartur" → "Schemas" → "public" → "Tables"
8. Deberías ver: `Tour`, `Booking`, `User`

---

## Paso 5: Verificar el Build

```bash
npm run build
```

Debería completar sin errores. Si ves errores de Prisma, asegúrate de haber ejecutado `npx prisma generate`.

---

## 📝 Variables de Entorno Completas

### 🔴 REQUERIDAS (mínimo para que funcione)

```env
# Base de datos
DATABASE_URL=postgresql://antartur:antartur_dev_password@localhost:5432/antartur
```

### 🟡 OPCIONALES (para funcionalidad completa)

```env
# Email (solo si quieres enviar emails reales)
CONTACT_RECIPIENT_EMAIL=tu_email@gmail.com
GMAIL_USER=tu_email@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx

# O usar SMTP genérico
# SMTP_HOST=smtp.tu-servidor.com
# SMTP_PORT=587
# SMTP_USER=tu_usuario
# SMTP_PASSWORD=tu_contraseña

# reCAPTCHA (solo si quieres protección anti-spam)
# NEXT_PUBLIC_RECAPTCHA_SITE_KEY=tu_site_key
# RECAPTCHA_SECRET_KEY=tu_secret_key
```

**Nota:** El formulario de contacto funciona sin estas variables, solo logueará en consola.

---

## 🐛 Solución de Problemas

### Error: "Can't reach database server"

**Causa:** PostgreSQL no está corriendo o `DATABASE_URL` incorrecta.

**Solución:**
```bash
# Verificar que PostgreSQL esté corriendo
docker ps | grep postgres

# Si no está, levantarlo
docker-compose up -d postgres

# Esperar 10 segundos y verificar la URL en .env
# Debe ser: postgresql://antartur:antartur_dev_password@localhost:5432/antartur
```

### Error: "Database does not exist"

**Causa:** La base de datos no se creó automáticamente.

**Solución:**
```bash
# Conectarse a PostgreSQL y crear la base manualmente
docker exec -it antartur_postgres psql -U antartur -c "CREATE DATABASE antartur;"

# Luego ejecutar Prisma
npx prisma db push
```

### Error: "relation does not exist"

**Causa:** Las tablas no están creadas.

**Solución:**
```bash
npx prisma db push
```

### Error: "Prisma Client is not generated"

**Causa:** Prisma Client no está generado.

**Solución:**
```bash
npx prisma generate
```

---

## ✅ Checklist Final

Antes de continuar, verifica:

- [ ] PostgreSQL corriendo (`docker ps | grep postgres`)
- [ ] `.env` con `DATABASE_URL` correcta (usando `localhost`)
- [ ] Prisma Client generado (`npx prisma generate`)
- [ ] Tablas creadas (`npx prisma db push`)
- [ ] Build funciona (`npm run build`)
- [ ] API test-db responde (`curl http://localhost:3000/api/test-db`)

---

## 🎯 Próximos Pasos

Una vez que todo esté configurado:

1. ✅ El build debería funcionar: `npm run build`
2. ✅ El servidor debería iniciar: `npm run dev`
3. ✅ La base de datos debería estar lista para usar
4. ✅ Puedes empezar a desarrollar las funcionalidades

---

## 📚 Referencias

- **Docker Compose**: Ver `docker-compose.yml`
- **Prisma Schema**: Ver `prisma/schema.prisma`
- **Email Setup**: Ver `EMAIL_SETUP.md` (si quieres configurar emails)
- **Documentación Prisma**: https://www.prisma.io/docs

---

**¿Necesitas ayuda?** Revisa los logs:
```bash
# Logs de PostgreSQL
docker-compose logs postgres

# Logs de la aplicación
npm run dev
```

