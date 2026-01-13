# Antartur Site

Migración de WordPress/Elementor a Next.js 100% - Sistema de reservas y gestión de tours.

## 📋 Tabla de Contenidos

- [Stack Tecnológico](#stack-tecnológico)
- [Requisitos Previos](#requisitos-previos)
- [Instalación Rápida](#instalación-rápida)
- [Configuración Detallada](#configuración-detallada)
- [Base de Datos](#base-de-datos)
- [Docker](#docker)
- [Variables de Entorno](#variables-de-entorno)
- [Scripts Disponibles](#scripts-disponibles)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Troubleshooting](#troubleshooting)

---

## 🛠 Stack Tecnológico

- **Framework:** Next.js 15 (App Router)
- **Lenguaje:** TypeScript
- **Estilos:** CSS Modules con Sass
- **Base de Datos:** PostgreSQL 16
- **ORM:** Prisma
- **Runtime:** Node.js 20+
- **Containerización:** Docker & Docker Compose

---

## ✅ Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js 20+** (recomendado usar [nvm](https://github.com/nvm-sh/nvm))
- **Docker** y **Docker Compose**
- **Git**
- **PostgreSQL** (opcional si usas Docker)

### Verificar Instalaciones

```bash
# Verificar Node.js
node --version  # Debe ser v20 o superior
npm --version

# Verificar Docker
docker --version
docker compose version

# Verificar Git
git --version
```

---

## 🚀 Instalación Rápida

### 1. Clonar el Repositorio

```bash
git clone <repository-url>
cd site
```

### 2. Instalar Dependencias

```bash
# Usar Node 20 (si usas nvm)
nvm use 20

# Instalar dependencias
npm install
```

### 3. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```bash
cp .env.example .env  # Si existe un ejemplo
# O crea el archivo manualmente
```

Ver sección [Variables de Entorno](#variables-de-entorno) para la configuración completa.

### 4. Levantar Base de Datos con Docker

```bash
# Levantar PostgreSQL y pgAdmin
docker compose up -d postgres pgadmin
```

Esto iniciará:
- **PostgreSQL** en `localhost:5432`
- **pgAdmin** (interfaz web) en `http://localhost:5050`

**Credenciales por defecto (desarrollo):**
- Usuario: `antartur`
- Contraseña: `antart_dev_password`
- Base de datos: `antartur`

### 5. Configurar Base de Datos

```bash
# Generar Prisma Client
npx prisma generate

# Ejecutar migraciones
npx prisma migrate deploy

# O si prefieres sincronizar directamente (desarrollo)
npx prisma db push
```

### 6. Importar Dump SQL (Opcional)

Si tienes un dump SQL proporcionado:

```bash
# Opción 1: Desde el contenedor Docker
docker compose exec -T postgres psql -U antartur -d antartur < dump_completo.sql

# Opción 2: Si tienes pg_dump instalado localmente
psql -h localhost -p 5432 -U antartur -d antartur < dump_completo.sql
```

**Nota:** Si el dump incluye el esquema completo, puedes omitir el paso 5 (migraciones).

### 7. Ejecutar en Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

---

## ⚙️ Configuración Detallada

### Base de Datos

#### Opción A: Docker (Recomendado para Desarrollo)

El `docker-compose.yml` ya está configurado. Solo ejecuta:

```bash
# Iniciar servicios
docker compose up -d postgres pgadmin

# Ver logs
docker compose logs -f postgres

# Detener servicios
docker compose down
```

#### Opción B: PostgreSQL Local

Si prefieres usar PostgreSQL instalado localmente:

1. Instala PostgreSQL en tu sistema
2. Crea la base de datos:
   ```sql
   CREATE DATABASE antartur;
   CREATE USER antartur WITH PASSWORD 'tu_password';
   GRANT ALL PRIVILEGES ON DATABASE antartur TO antartur;
   ```
3. Actualiza `DATABASE_URL` en tu `.env`

#### Acceso a pgAdmin

1. Abre `http://localhost:5050`
2. Login con:
   - Email: `admin@antartur.com`
   - Password: `admin`
3. Agrega un nuevo servidor:
   - Host: `postgres` (si estás en Docker) o `localhost`
   - Puerto: `5432`
   - Usuario: `antartur`
   - Password: `antart_dev_password`
   - Base de datos: `antartur`

### Importar Dump SQL

#### Exportar Dump desde el Proyecto Original

Si necesitas exportar un dump para compartir:

```bash
# Dump completo (esquema + datos)
docker compose exec postgres pg_dump -U antartur -d antartur > dump_completo.sql

# Solo esquema (estructura sin datos)
docker compose exec postgres pg_dump -U antartur -d antartur --schema-only > schema.sql

# Solo datos (sin esquema)
docker compose exec postgres pg_dump -U antartur -d antartur --data-only > datos.sql

# Dump con formato personalizado (más eficiente)
docker compose exec postgres pg_dump -U antartur -d antartur -Fc > dump_completo.backup
```

#### Importar Dump en Nuevo Entorno

```bash
# Si es un archivo .sql
docker compose exec -T postgres psql -U antartur -d antartur < dump_completo.sql

# Si es un archivo .backup (formato personalizado)
docker compose exec postgres pg_restore -U antartur -d antartur -c dump_completo.backup
```

**Importante:** Si el dump incluye el esquema completo, asegúrate de que la base de datos esté vacía o elimina las tablas existentes antes de importar.

### Prisma Migrations

```bash
# Ver estado de migraciones
npx prisma migrate status

# Crear nueva migración
npx prisma migrate dev --name nombre_de_la_migracion

# Aplicar migraciones pendientes
npx prisma migrate deploy

# Sincronizar schema sin crear migración (solo desarrollo)
npx prisma db push

# Abrir Prisma Studio (interfaz visual)
npx prisma studio
```

---

## 🐳 Docker

### Desarrollo

```bash
# Levantar todos los servicios
docker compose up -d

# Ver logs
docker compose logs -f app

# Detener servicios
docker compose down

# Detener y eliminar volúmenes
docker compose down -v
```

### Producción

```bash
# Usar docker-compose.prod.yml
docker compose -f docker-compose.prod.yml up -d

# Reconstruir imagen
docker compose -f docker-compose.prod.yml build --no-cache app

# Ver logs
docker compose -f docker-compose.prod.yml logs -f app
```

### Comandos Útiles

```bash
# Acceder a la base de datos
docker compose exec postgres psql -U antartur -d antartur

# Ejecutar comandos en el contenedor de la app
docker compose exec app npm run build

# Ver estado de contenedores
docker compose ps

# Limpiar recursos no utilizados
docker system prune -a
```

---

## 🔐 Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

### Variables Obligatorias

```env
# ============================================
# DATABASE - REQUERIDO
# ============================================
DATABASE_URL="postgresql://antartur:antart_dev_password@localhost:5432/antartur"

# ============================================
# SITE URL - REQUERIDO
# ============================================
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
SITE_URL="http://localhost:3000"
```

### Variables Opcionales (pero Recomendadas)

```env
# ============================================
# AUTHENTICATION
# ============================================
NEXTAUTH_SECRET="genera-con-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# ============================================
# EMAIL - Opción A: Gmail
# ============================================
GMAIL_USER="tu_email@gmail.com"
GMAIL_APP_PASSWORD="xxxx xxxx xxxx xxxx"

# ============================================
# EMAIL - Opción B: SMTP Genérico
# ============================================
SMTP_HOST="smtp.tu-servidor.com"
SMTP_PORT="587"
SMTP_USER="tu_usuario_smtp"
SMTP_PASS="tu_contraseña_smtp"
SMTP_FROM="noreply@antartur.tur.ar"

# ============================================
# CONTACT FORM
# ============================================
CONTACT_EMAIL="contacto@antartur.tur.ar"
CONTACT_RECIPIENT_EMAIL="agencias@antartur.tur.ar"

# ============================================
# RECAPTCHA (Opcional)
# ============================================
NEXT_PUBLIC_RECAPTCHA_SITE_KEY="tu_site_key"
RECAPTCHA_SECRET_KEY="tu_secret_key"

# ============================================
# PAYMENT GATEWAYS
# ============================================
# PayPal
PAYPAL_CLIENT_ID="tu_client_id"
PAYPAL_CLIENT_SECRET="tu_client_secret"
PAYPAL_MODE="sandbox"  # o "live" para producción

# Payway
PAYWAY_API_KEY="tu_api_key"
PAYWAY_MERCHANT_ID="tu_merchant_id"
PAYWAY_ENVIRONMENT="sandbox"  # o "production"

# ============================================
# BANK DETAILS (Transferencia Bancaria)
# ============================================
BANK_ACCOUNT_NAME="Antartur"
BANK_ACCOUNT_NUMBER="1234567890"
BANK_NAME="Banco"
BANK_CUIT="20-12345678-9"
BANK_CBU="1234567890123456789012"
BANK_ALIAS="ANTARTUR.TOURS"

# ============================================
# ORDER EXPIRATION
# ============================================
ORDER_EXPIRATION_HOURS=1
BANK_TRANSFER_EXPIRATION_HOURS=24
PENDING_RESERVATION_HOLD_HOURS=2
NEXT_PUBLIC_BOOKING_CUTOFF_HOUR=20

# ============================================
# JWT AUTHENTICATION
# ============================================
JWT_SECRET="genera-con-openssl-rand-base64-32"
JWT_ACCESS_EXPIRY="15m"
JWT_REFRESH_EXPIRY="7d"
```

### Generar Secrets

```bash
# Generar NEXTAUTH_SECRET
openssl rand -base64 32

# Generar JWT_SECRET
openssl rand -base64 32
```

---

## 📜 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Iniciar servidor de desarrollo
npm run build           # Construir para producción
npm run start           # Iniciar servidor de producción
npm run lint            # Ejecutar linter

# Base de Datos
npm run db:seed         # Ejecutar seed de datos
npx prisma studio       # Abrir Prisma Studio
npx prisma migrate dev  # Crear y aplicar migración
npx prisma migrate deploy # Aplicar migraciones pendientes

# Testing
npm run test            # Ejecutar tests
npm run test:ui         # Tests con interfaz visual
npm run test:coverage   # Tests con cobertura

# Utilidades
npm run lighthouse      # Análisis de performance
```

---

## 📁 Estructura del Proyecto

```
site/
├── src/
│   ├── app/              # Rutas Next.js (App Router)
│   │   ├── api/         # API Routes
│   │   ├── admin/       # Panel de administración
│   │   ├── checkout/    # Proceso de checkout
│   │   └── tours/       # Páginas de tours
│   ├── components/      # Componentes UI genéricos
│   ├── modules/         # Módulos de dominio
│   │   ├── booking/    # Módulo de reservas
│   │   ├── orders/     # Módulo de órdenes
│   │   ├── payments/   # Módulo de pagos
│   │   └── tours/      # Módulo de tours
│   ├── lib/            # Utilidades y helpers
│   ├── styles/         # Estilos globales
│   └── contexts/       # React Contexts
├── prisma/
│   ├── schema.prisma   # Schema de Prisma
│   ├── migrations/    # Migraciones de base de datos
│   └── seed.ts        # Script de seed
├── public/            # Archivos estáticos
├── docker/            # Configuración Docker
├── scripts/           # Scripts de utilidad
├── docs/              # Documentación
├── docker-compose.yml # Docker Compose (desarrollo)
├── docker-compose.prod.yml # Docker Compose (producción)
└── package.json
```

---

## 🔧 Troubleshooting

### Error: "Node.js 20+ required"

```bash
# Usar nvm para cambiar de versión
nvm use 20

# O instalar Node 20
nvm install 20
nvm use 20
```

### Error: "Cannot connect to database"

1. Verifica que PostgreSQL esté corriendo:
   ```bash
   docker compose ps
   ```

2. Verifica la `DATABASE_URL` en `.env`

3. Prueba la conexión:
   ```bash
   docker compose exec postgres psql -U antartur -d antartur -c "SELECT 1;"
   ```

### Error: "Prisma Client not generated"

```bash
npx prisma generate
```

### Error: "Migration failed"

```bash
# Ver estado de migraciones
npx prisma migrate status

# Resetear base de datos (¡CUIDADO! Elimina todos los datos)
npx prisma migrate reset

# O aplicar migraciones manualmente
npx prisma migrate deploy
```

### Puerto 5432 ya en uso

```bash
# Cambiar el puerto en docker-compose.yml
ports:
  - "5433:5432"  # Usar 5433 en lugar de 5432

# Y actualizar DATABASE_URL
DATABASE_URL="postgresql://antartur:antart_dev_password@localhost:5433/antartur"
```

### Limpiar y Reconstruir Todo

```bash
# Detener contenedores
docker compose down -v

# Eliminar node_modules
rm -rf node_modules package-lock.json

# Reinstalar
npm install

# Levantar servicios
docker compose up -d

# Aplicar migraciones
npx prisma migrate deploy
```

---

## 📚 Documentación Adicional

- [Documentación Técnica](./docs/TECHNICAL_DOCUMENTATION.md)
- [Guía de Variables de Entorno](./docs/ENVIRONMENT_VARIABLES.md)
- [Setup de Docker](./docs/DOCKER_SETUP.md)
- [Deploy en VPS](./docs/VPS_DEPLOY.md)
- [Configuración de Vercel](./docs/VERCEL_SETUP.md)

---

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📝 Licencia

Este proyecto es privado y confidencial.

---

## 📞 Soporte

Para preguntas o problemas:
- Revisa la [documentación](./docs/)
- Abre un issue en el repositorio
- Contacta al equipo de desarrollo

---

**Última actualización:** Enero 2025