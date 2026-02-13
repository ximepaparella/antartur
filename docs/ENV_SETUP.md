# Guía de Configuración de Variables de Entorno

## 📋 Resumen de Variables Necesarias

### 🔴 **REQUERIDAS** (para que funcione el build y la base de datos)
- `DATABASE_URL` - URL de conexión a PostgreSQL

### 🟡 **OPCIONALES** (para desarrollo local)
- Variables de email (solo si quieres enviar emails reales)
- Variables de reCAPTCHA (solo si quieres validación anti-spam)

---

## 🚀 Paso 1: Levantar PostgreSQL con Docker

### Opción A: Usar Docker Compose (Recomendado)

```bash
# Levantar solo PostgreSQL y pgAdmin
docker-compose up -d postgres pgadmin
```

Esto levantará:
- **PostgreSQL** en el puerto `5432`
- **pgAdmin** (interfaz web) en `http://localhost:5050`

**Credenciales de PostgreSQL (desde docker-compose.yml):**
- Usuario: `antartur`
- Contraseña: `antartur_dev_password`
- Base de datos: `antartur`
- Puerto: `5432`

**Credenciales de pgAdmin:**
- Email: `admin@antartur.tur.ar`
- Contraseña: `admin`

### Opción B: Solo PostgreSQL (sin pgAdmin)

```bash
docker-compose up -d postgres
```

---

## 🗄️ Paso 2: Crear la Base de Datos con Prisma

Una vez que PostgreSQL esté corriendo:

```bash
# 1. Generar Prisma Client (si no está generado)
npx prisma generate

# 2. Ejecutar las migraciones para crear las tablas
npx prisma migrate dev --name init

# O si prefieres solo sincronizar el schema sin migraciones:
npx prisma db push
```

**¿Cuál usar?**
- `prisma migrate dev` - Crea migraciones versionadas (recomendado para producción)
- `prisma db push` - Sincroniza directamente el schema (más rápido para desarrollo)

---

## 📝 Paso 3: Configurar el archivo `.env`

Crea o edita el archivo `.env` en la raíz del proyecto:

```env
# ============================================
# DATABASE - REQUERIDO
# ============================================
# URL de conexión a PostgreSQL
# Formato: postgresql://usuario:contraseña@host:puerto/base_de_datos
DATABASE_URL="postgresql://antartur:antartur_dev_password@localhost:5432/antartur"

# ============================================
# EMAIL - OPCIONAL (para desarrollo)
# ============================================
# Solo necesitas estas si quieres enviar emails reales
# Si no las configuras, el formulario funcionará pero solo logueará en consola

# Email destinatario (donde recibirás los emails del formulario)
CONTACT_RECIPIENT_EMAIL=tu_email@gmail.com

# Opción 1: Gmail (más fácil para empezar)
GMAIL_USER=tu_email@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx

# Opción 2: SMTP genérico (para producción)
# SMTP_HOST=smtp.tu-servidor.com
# SMTP_PORT=587
# SMTP_USER=tu_usuario_smtp
# SMTP_PASSWORD=tu_contraseña_smtp
# SMTP_FROM=noreply@antartur.tur.ar

# ============================================
# RECAPTCHA - OPCIONAL
# ============================================
# Solo si quieres validación anti-spam en el formulario
# NEXT_PUBLIC_RECAPTCHA_SITE_KEY=tu_site_key
# RECAPTCHA_SECRET_KEY=tu_secret_key

# ============================================
# NEXT.JS - OPCIONAL
# ============================================
# URL pública del sitio (para producción)
# NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## 🔍 Paso 4: Verificar la Conexión

### Opción A: Usar pgAdmin (Interfaz Web)

1. Abre `http://localhost:5050` en tu navegador
2. Inicia sesión con:
   - Email: `admin@antartur.tur.ar`
   - Contraseña: `admin`
3. Click derecho en "Servers" → "Register" → "Server"
4. En la pestaña "General":
   - Name: `Antartur DB`
5. En la pestaña "Connection":
   - Host name/address: `postgres` (o `localhost` si estás fuera de Docker)
   - Port: `5432`
   - Username: `antartur`
   - Password: `antartur_dev_password`
6. Click "Save"
7. Deberías ver la base de datos `antartur` con las tablas creadas

### Opción B: Usar Prisma Studio (Recomendado)

```bash
npx prisma studio
```

Esto abrirá una interfaz web en `http://localhost:5555` donde puedes ver y editar los datos.

### Opción C: Probar la API

```bash
# Iniciar el servidor de desarrollo
npm run dev

# En otra terminal, probar la conexión
curl http://localhost:3000/api/test-db
```

Deberías recibir:
```json
{
  "status": "success",
  "message": "Database connection successful",
  "database": "PostgreSQL",
  "connected": true,
  "timestamp": "2024-..."
}
```

---

## 📋 Checklist de Configuración

### ✅ Mínimo Requerido (para que funcione el build)

- [ ] PostgreSQL corriendo (`docker-compose up -d postgres`)
- [ ] `.env` con `DATABASE_URL` configurada
- [ ] Prisma Client generado (`npx prisma generate`)
- [ ] Tablas creadas (`npx prisma migrate dev` o `npx prisma db push`)
- [ ] Build funciona (`npm run build`)

### 🎯 Opcional (para funcionalidad completa)

- [ ] pgAdmin configurado (para ver la base de datos)
- [ ] Variables de email configuradas (para enviar emails reales)
- [ ] reCAPTCHA configurado (para protección anti-spam)

---

## 🐛 Solución de Problemas

### Error: "Prisma has detected that this project was built on Vercel"

**Solución:** Ya está resuelto. El script de build ahora incluye `prisma generate`.

### Error: "Can't reach database server"

**Causas posibles:**
1. PostgreSQL no está corriendo
2. `DATABASE_URL` incorrecta
3. Puerto 5432 ocupado

**Soluciones:**
```bash
# Verificar que PostgreSQL esté corriendo
docker ps | grep postgres

# Si no está corriendo, levantarlo
docker-compose up -d postgres

# Verificar la URL en .env
# Debe ser: postgresql://antartur:antartur_dev_password@localhost:5432/antartur
```

### Error: "Database does not exist"

**Solución:**
```bash
# Crear la base de datos con Prisma
npx prisma db push
```

### Error: "relation does not exist"

**Solución:**
```bash
# Las tablas no están creadas, ejecuta:
npx prisma migrate dev
# o
npx prisma db push
```

---

## 📚 Referencias

- **Prisma Docs**: https://www.prisma.io/docs
- **PostgreSQL Docker**: https://hub.docker.com/_/postgres
- **pgAdmin**: https://www.pgadmin.org/
- **Email Setup**: Ver `EMAIL_SETUP.md` para detalles sobre configuración de email

---

## 🎯 Próximos Pasos

Una vez que tengas todo configurado:

1. ✅ Verifica que el build funciona: `npm run build`
2. ✅ Prueba la conexión a la DB: `curl http://localhost:3000/api/test-db`
3. ✅ Prueba el formulario de contacto: `http://localhost:3000/contacto`
4. ✅ Explora la base de datos con Prisma Studio: `npx prisma studio`

---

**¿Necesitas ayuda?** Revisa los logs de Docker:
```bash
docker-compose logs postgres
```

