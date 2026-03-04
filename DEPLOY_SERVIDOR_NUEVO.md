# Deploy en servidor nuevo (producción)

Guía paso a paso para desplegar Antartur en un servidor vacío con Docker ya instalado.

---

## Datos que vas a necesitar

Antes de empezar, tené a mano:

- **IP del servidor** (ej: `149.50.129.68`)
- **Puerto SSH** (ej: `22` o `5857`)
- **Usuario SSH** (ej: `root`)
- **URL del repo** (ej: `https://github.com/ximepaparella/antartur.git`)
- **Dump de la base de datos** del servidor de producción actual (si tenés datos para migrar)

---

## Paso 1: Conectarte al servidor

```bash
ssh -p<PUERTO_SSH> <USUARIO>@<IP_SERVIDOR>
```

Ejemplo:
```bash
ssh -p5857 root@149.50.129.68
```

---

## Paso 2: Crear directorio y clonar el repositorio

```bash
# Crear directorio si no existe
sudo mkdir -p /var/www
cd /var/www

# Clonar el repo (reemplazá con tu URL real)
sudo git clone https://github.com/ximepaparella/antartur.git antartur
cd antartur

# Si el repo tiene la app en una subcarpeta "site", entrá ahí:
# cd site
```

**Nota:** El `docker-compose.prod.yml` debe estar en el directorio desde donde ejecutás todos los comandos.

---

## Paso 3: Generar secrets y preparar el .env

```bash
# Generar contraseñas y secrets
echo "POSTGRES_PASSWORD=$(openssl rand -base64 24)"
echo "NEXTAUTH_SECRET=$(openssl rand -base64 32)"
echo "CRON_SECRET=$(openssl rand -hex 32)"
echo "JWT_SECRET=$(openssl rand -base64 32)"
```

Copiá cada valor que se muestre (vas a usarlos en el `.env`).

```bash
# Crear .env desde la plantilla
cp .env.example .env
nano .env
```

Configurá **como mínimo** estas variables:

| Variable | Valor | Cómo obtenerlo |
|----------|-------|----------------|
| `POSTGRES_USER` | `antartur` | Fijo |
| `POSTGRES_PASSWORD` | *(el que generaste arriba)* | `openssl rand -base64 24` |
| `POSTGRES_DB` | `antartur` | Fijo |
| `SITE_URL` | `https://antartur.tur.ar` | Fijo (NEXTAUTH_URL se toma de acá) |
| `NEXTAUTH_SECRET` | *(el que generaste)* | `openssl rand -base64 32` |
| `JWT_SECRET` | *(el que generaste)* | `openssl rand -base64 32` |
| `CRON_SECRET` | *(el que generaste)* | `openssl rand -hex 32` |
| `ADMIN_EMAIL` | `admin@antartur.tur.ar` | Fijo |
| `ADMIN_PASSWORD` | *(contraseña segura para el admin)* | Elegí una de al menos 8 caracteres |

Además, completá según tu configuración:

- **Email:** Gmail (`GMAIL_USER`, `GMAIL_APP_PASSWORD`) o SMTP
- **Contacto:** `CONTACT_EMAIL`, `CONTACT_RECIPIENT_EMAIL`
- **PayPal:** `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_MODE=live`
- **Payway:** `PAYWAY_API_KEY`, `PAYWAY_MERCHANT_ID`, `PAYWAY_SITE_ID`, `PAYWAY_TEMPLATE_ID`, `NEXT_PUBLIC_PAYWAY_PUBLIC_KEY`, `PAYWAY_ENVIRONMENT=production`
- **Datos bancarios:** `BANK_ACCOUNT_NAME`, `BANK_CBU`, etc.
- **reCAPTCHA** (opcional): `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`, `RECAPTCHA_SECRET_KEY`

Guardá con `Ctrl+O`, `Enter`, `Ctrl+X`.

---

## Paso 4: DNS apuntando al servidor

Antes de pedir el certificado SSL, **antartur.tur.ar** y **www.antartur.tur.ar** deben apuntar a la IP del servidor nuevo.

En el panel de DNS de tu dominio:

- Registro **A** para `@` (o `antartur.tur.ar`) → IP del servidor
- Registro **A** o **CNAME** para `www` → misma IP o `antartur.tur.ar`

Verificá con:
```bash
ping antartur.tur.ar
```

---

## Paso 5: Levantar Postgres e importar datos de producción

**Ruta del proyecto:** Si clonaste y la app está en `site/`, usá `cd /var/www/antartur/site`. Si la app está en la raíz del clone, usá `cd /var/www/antartur`.

### 5.1 Levantar Postgres

```bash
cd /var/www/antartur   # o .../antartur/site si la app está en esa subcarpeta
docker compose -f docker-compose.prod.yml up -d postgres
```

Esperá unos segundos a que Postgres esté listo:

```bash
docker compose -f docker-compose.prod.yml exec postgres pg_isready -U antartur
```

### 5.2 Crear el dump en el servidor actual (producción)

Conectate al servidor donde está corriendo la base de datos actual:

```bash
ssh -p<PUERTO> <USUARIO>@<IP_SERVIDOR_ACTUAL>
cd /var/www/antartur   # o la ruta donde esté el proyecto
```

**Postgres en Docker** (el compose de antartur monta `./backups:/backups`, el dump queda en el host):

```bash
mkdir -p backups

# Dump completo (schema + datos) en formato custom - recomendado para pg_restore
docker compose -f docker-compose.prod.yml exec postgres pg_dump -U antartur -d antartur -Fc -f /backups/antartur_produccion.dump

# Verificar
ls -lh backups/antartur_produccion.dump
```

**Postgres instalado directamente** (sin Docker):

```bash
pg_dump -U antartur -d antartur -Fc -f antartur_produccion.dump
```

**Formato SQL plano** (alternativa si hay problemas con el formato custom):

```bash
docker compose -f docker-compose.prod.yml exec postgres pg_dump -U antartur -d antartur -f /backups/antartur_produccion.sql
```

### 5.3 Copiar el dump al servidor nuevo

**Desde tu máquina local** (tenés el dump descargado o lo bajás del servidor viejo):

```bash
# Descargar del servidor actual a tu máquina
scp -P<PUERTO> root@<IP_SERVIDOR_ACTUAL>:/var/www/antartur/backups/antartur_produccion.dump ./

# Subir al servidor nuevo
scp -P<PUERTO> antartur_produccion.dump root@<IP_SERVIDOR_NUEVO>:/var/www/antartur/backups/
```

**Directo de servidor a servidor** (si el servidor nuevo puede conectarse al viejo):

```bash
# Ejecutando en el servidor nuevo
scp -P<PUERTO> root@<IP_SERVIDOR_ACTUAL>:/var/www/antartur/backups/antartur_produccion.dump ./backups/
```

### 5.4 Restaurar el dump en el servidor nuevo

**En el servidor nuevo:**

```bash
cd /var/www/antartur   # o .../antartur/site
mkdir -p backups
```

**Dump en formato custom (`.dump`):**
```bash
docker compose -f docker-compose.prod.yml exec -T postgres pg_restore -U antartur -d antartur --clean --if-exists -Fc < backups/antartur_produccion.dump
```

**Dump en formato SQL (`.sql`):**
```bash
docker compose -f docker-compose.prod.yml exec -T postgres psql -U antartur -d antartur < backups/antartur_produccion.sql
```

**Dump solo de datos** (si ya corriste `prisma migrate deploy` antes):
```bash
docker compose -f docker-compose.prod.yml exec -T postgres pg_restore -U antartur -d antartur -a --disable-triggers -Fc < backups/antartur_data_only.dump
```

### 5.5 Si NO tenés dump: crear schema y seed

Si es una instalación nueva sin datos de producción:

```bash
# Aplicar migraciones
docker compose -f docker-compose.prod.yml run --rm app npx prisma migrate deploy

# Crear usuario admin y datos iniciales (requiere ADMIN_EMAIL y ADMIN_PASSWORD en .env)
docker compose -f docker-compose.prod.yml run --rm app npx prisma db seed
```

---

## Paso 6: Cambiar contraseña del administrador (si importaste datos)

Si restauraste un dump que ya tiene usuarios, el admin puede tener la contraseña vieja. Para actualizarla:

```bash
# Ejecutar el seed (actualiza el usuario admin con ADMIN_PASSWORD del .env)
docker compose -f docker-compose.prod.yml run --rm -e ADMIN_EMAIL=admin@antartur.tur.ar -e ADMIN_PASSWORD=TU_NUEVA_PASSWORD app npx prisma db seed
```

---

## Paso 7: Obtener certificado SSL

```bash
cd /var/www/antartur   # o .../antartur/site
chmod +x scripts/init-ssl.sh
sudo ./scripts/init-ssl.sh
```

El script:

1. Usa nginx en modo HTTP para el challenge de Let's Encrypt
2. Pide el certificado para `antartur.tur.ar` y `www.antartur.tur.ar`
3. Restaura la config de nginx con SSL

**Importante:** El DNS debe estar propagado antes de ejecutar esto.

Para probar primero con certificados de staging (no válidos en el navegador):

```bash
SSL_STAGING=1 sudo ./scripts/init-ssl.sh
```

---

## Paso 8: Levantar todos los servicios

```bash
cd /var/www/antartur   # o .../antartur/site
docker compose -f docker-compose.prod.yml up -d --build
```

Verificá que todo esté corriendo:

```bash
docker compose -f docker-compose.prod.yml ps
```

Deberías ver `antartur_postgres`, `antartur_app`, `antartur_nginx` y `antartur_certbot` en estado `Up`.

---

## Paso 9: Migraciones (si no las corriste antes)

Si importaste un dump de producción, el schema ya está. Si hiciste instalación limpia, ya corriste `prisma migrate deploy` en el paso 5.4.

Para estar seguros, podés ejecutar:

```bash
docker compose -f docker-compose.prod.yml run --rm app npx prisma migrate deploy
```

Si las migraciones ya están aplicadas, no hará nada.

---

## Paso 10: Verificar que todo funciona

1. **Sitio:** https://antartur.tur.ar
2. **Admin:** https://antartur.tur.ar/admin — login con `ADMIN_EMAIL` y `ADMIN_PASSWORD`
3. **API docs:** https://antartur.tur.ar/admin-api-docs

---

## Paso 11: Configurar cron jobs (opcional pero recomendado)

Para cancelar órdenes expiradas y reintentar notificaciones:

```bash
crontab -e
```

Agregar (reemplazá `TU_CRON_SECRET` por el valor de `CRON_SECRET` del `.env`):

```cron
# Cancelar órdenes expiradas (cada hora)
0 * * * * curl -s -H "Authorization: Bearer TU_CRON_SECRET" "https://antartur.tur.ar/api/cron/cancel-expired-orders" > /dev/null

# Reintentar notificaciones fallidas (cada 15 minutos)
*/15 * * * * curl -s -H "Authorization: Bearer TU_CRON_SECRET" "https://antartur.tur.ar/api/cron/retry-notifications" > /dev/null
```

---

## Resumen de orden de pasos

| # | Paso |
|---|------|
| 1 | Conectarse por SSH |
| 2 | Clonar repo en `/var/www/antartur` |
| 3 | Crear `.env` con secrets generados y variables de producción |
| 4 | Verificar DNS (antartur.tur.ar → IP del servidor) |
| 5 | Levantar postgres, importar dump (o migrate + seed si es nuevo) |
| 6 | Actualizar contraseña del admin si importaste datos |
| 7 | Ejecutar `sudo ./scripts/init-ssl.sh` |
| 8 | `docker compose -f docker-compose.prod.yml up -d --build` |
| 9 | Verificar sitio y admin |
| 10 | Configurar crontab para cron jobs |

---

## Troubleshooting

### El sitio no carga
```bash
docker compose -f docker-compose.prod.yml logs app
docker compose -f docker-compose.prod.yml logs nginx
```

### Error de base de datos
```bash
docker compose -f docker-compose.prod.yml exec postgres pg_isready -U antartur
docker compose -f docker-compose.prod.yml logs postgres
```

### Certificado SSL no se genera
- Verificá que el DNS apunte al servidor: `ping antartur.tur.ar`
- Revisá que el puerto 80 esté abierto
- Probá con staging: `SSL_STAGING=1 sudo ./scripts/init-ssl.sh`

### Cambiar contraseña de Postgres después (con datos existentes)
1. Conectate a postgres: `docker compose -f docker-compose.prod.yml exec postgres psql -U antartur -d antartur`
2. Ejecutá: `ALTER USER antartur PASSWORD 'nueva_contraseña';` y salí con `\q`
3. Actualizá `POSTGRES_PASSWORD` en el `.env`
4. Reiniciá: `docker compose -f docker-compose.prod.yml restart app`
