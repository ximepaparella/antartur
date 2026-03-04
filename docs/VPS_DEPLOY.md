# Guía de Deploy en VPS Don Web

Esta guía documenta el proceso completo para desplegar Antartur en el VPS de Don Web.

## Datos del VPS

| Parámetro | Valor |
|-----------|-------|
| IP | `149.50.129.68` |
| Host | `vps-5495836-x.dattaweb.com` |
| Usuario SSH | `root` |
| Puerto SSH | `5857` |
| Dominio | `antartur.tur.ar` |
| Path del proyecto | `/var/www/antartur` (clonar el repo aquí; nginx y certbot usan `/var/www/` dentro del contenedor) |

## Conexión SSH

```bash
ssh -p5857 root@149.50.129.68
```

## Prerequisitos del VPS

- Docker instalado
- Docker Compose instalado
- Git instalado
- Puertos 80 y 443 abiertos

## Configuración Inicial (Primera vez)

### 1. Clonar el repositorio

```bash
cd /var/www
git clone https://github.com/tu-usuario/antartur.git
cd antartur
```

### 2. Crear archivo .env

```bash
cp .env.example .env
nano .env
```

Edita el archivo y configura todas las variables. Ver sección "Variables de Entorno" más abajo.

### 3. Generar secrets seguros

```bash
# Para NEXTAUTH_SECRET
openssl rand -base64 32

# Para CRON_SECRET
openssl rand -hex 32

# Para POSTGRES_PASSWORD
openssl rand -base64 24
```

### 4. Obtener certificados SSL

```bash
chmod +x scripts/init-ssl.sh
sudo ./scripts/init-ssl.sh
```

Si quieres probar primero con certificados de staging (no válidos pero no tienen límite de intentos):

```bash
SSL_STAGING=1 sudo ./scripts/init-ssl.sh
```

### 5. Iniciar los servicios

```bash
docker compose -f docker-compose.prod.yml up -d
```

### 6. Ejecutar migraciones de base de datos

```bash
docker compose -f docker-compose.prod.yml run --rm app npx prisma migrate deploy
```

### 7. (Opcional) Sembrar datos iniciales

```bash
docker compose -f docker-compose.prod.yml run --rm app npx prisma db seed
```

## Variables de Entorno

### Requeridas

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `POSTGRES_USER` | Usuario de PostgreSQL | `antartur` |
| `POSTGRES_PASSWORD` | Contraseña de PostgreSQL (recomendado: fuerte) | `openssl rand -base64 24` |
| `POSTGRES_DB` | Nombre de la base de datos | `antartur` |
| `SITE_URL` | URL del sitio | `https://antartur.tur.ar` |
| `NEXTAUTH_SECRET` | Secret para NextAuth | (generar con openssl) |
| `CRON_SECRET` | Secret para endpoints cron | (generar con openssl) |

**PostgreSQL: contraseña segura**  
Sí, conviene usar una contraseña fuerte en producción. Generala con `openssl rand -base64 24` y ponela en `POSTGRES_PASSWORD` del `.env`. El `docker-compose.prod.yml` arma `DATABASE_URL` con esa variable, así que no hace falta tocar la base ya creada: solo asegurate de que en el `.env` esté la misma contraseña y reiniciá los servicios (`docker compose -f docker-compose.prod.yml up -d`). Si en algún momento cambiás la contraseña, actualizá `POSTGRES_PASSWORD` en el `.env` y reiniciá postgres y app.

### Email (elegir una opción)

**Opción A: Gmail**
```env
GMAIL_USER=tu_email@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
```

**Opción B: SMTP**
```env
SMTP_HOST=smtp.tu-servidor.com
SMTP_PORT=587
SMTP_USER=usuario
SMTP_PASS=contraseña
SMTP_FROM=noreply@antartur.tur.ar
```

### Pasarelas de Pago

```env
# PayPal
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
PAYPAL_MODE=live

# Payway
PAYWAY_API_KEY=...
PAYWAY_MERCHANT_ID=...
PAYWAY_ENVIRONMENT=production
```

Ver `.env.example` para la lista completa de variables.

## Deploy Automático (CI/CD)

El proyecto está configurado con GitHub Actions para deploy automático cuando se hace push a la rama `main`.

### Configurar GitHub Secrets

En tu repositorio de GitHub, ve a **Settings** → **Secrets and variables** → **Actions** y agrega:

| Secret | Valor |
|--------|-------|
| `VPS_HOST` | `149.50.129.68` |
| `VPS_USER` | `root` |
| `VPS_PORT` | `5857` |
| `VPS_SSH_KEY` | (clave privada SSH) |

### Generar par de claves SSH para GitHub Actions

En tu máquina local:

```bash
ssh-keygen -t ed25519 -C "github-actions-antartur" -f ~/.ssh/github_actions_antartur
```

Esto genera dos archivos:
- `~/.ssh/github_actions_antartur` (clave privada - para GitHub Secrets)
- `~/.ssh/github_actions_antartur.pub` (clave pública - para el VPS)

### Agregar clave pública al VPS

```bash
# En tu máquina local, copia la clave pública
cat ~/.ssh/github_actions_antartur.pub

# En el VPS, agrega la clave a authorized_keys
ssh -p5857 root@149.50.129.68
echo "PEGA_LA_CLAVE_PUBLICA_AQUI" >> ~/.ssh/authorized_keys
```

### Agregar clave privada a GitHub Secrets

1. Ve a tu repositorio en GitHub
2. Settings → Secrets and variables → Actions
3. New repository secret
4. Name: `VPS_SSH_KEY`
5. Value: (pega el contenido de `~/.ssh/github_actions_antartur`)

## Deploy Manual

Si necesitas hacer deploy sin GitHub Actions:

```bash
ssh -p5857 root@149.50.129.68
cd /var/www/antartur
./scripts/deploy.sh
```

O manualmente:

```bash
git pull origin main
docker compose -f docker-compose.prod.yml build --no-cache app
docker compose -f docker-compose.prod.yml run --rm app npx prisma migrate deploy
docker compose -f docker-compose.prod.yml up -d
```

## Comandos Útiles

### Ver logs

```bash
# Todos los servicios
docker compose -f docker-compose.prod.yml logs -f

# Solo la aplicación
docker compose -f docker-compose.prod.yml logs -f app

# Solo nginx
docker compose -f docker-compose.prod.yml logs -f nginx
```

### Reiniciar servicios

```bash
docker compose -f docker-compose.prod.yml restart
```

### Ver estado de los contenedores

```bash
docker compose -f docker-compose.prod.yml ps
```

### Acceder a la base de datos

```bash
docker compose -f docker-compose.prod.yml exec postgres psql -U antartur -d antartur
```

### Hacer backup de la base de datos

```bash
docker compose -f docker-compose.prod.yml exec postgres pg_dump -U antartur antartur > backups/backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restaurar backup

```bash
docker compose -f docker-compose.prod.yml exec -T postgres psql -U antartur -d antartur < backups/backup_FECHA.sql
```

## Configuración de Cronjobs

El sistema requiere dos cronjobs para:
1. Cancelar órdenes expiradas
2. Reintentar notificaciones fallidas

### En Don Web

Si Don Web tiene panel de cronjobs, configura:

**Cronjob 1: Cancelar órdenes expiradas**
- URL: `https://antartur.tur.ar/api/cron/cancel-expired-orders` (sin query param)
- Autenticación: header `Authorization: Bearer <CRON_SECRET>` (el valor de `CRON_SECRET` del .env)
- Frecuencia: `0 * * * *` (cada hora)

**Cronjob 2: Reintentar notificaciones**
- URL: `https://antartur.tur.ar/api/cron/retry-notifications` (sin query param)
- Autenticación: header `Authorization: Bearer <CRON_SECRET>`
- Frecuencia: `*/15 * * * *` (cada 15 minutos)

### Con crontab en el VPS

```bash
crontab -e
```

Agregar:

```cron
# Cancelar órdenes expiradas (cada hora). Usar header Authorization: Bearer CRON_SECRET
0 * * * * curl -s -H "Authorization: Bearer $CRON_SECRET" "https://antartur.tur.ar/api/cron/cancel-expired-orders" > /dev/null

# Reintentar notificaciones fallidas (cada 15 minutos)
*/15 * * * * curl -s -H "Authorization: Bearer $CRON_SECRET" "https://antartur.tur.ar/api/cron/retry-notifications" > /dev/null
```

(Definí `CRON_SECRET` en el .env o exportalo en el crontab.)

## Renovación de Certificados SSL

Los certificados SSL se renuevan automáticamente mediante el contenedor certbot. No se requiere intervención manual.

Para verificar el estado de los certificados:

```bash
docker compose -f docker-compose.prod.yml exec certbot certbot certificates
```

Para forzar una renovación:

```bash
docker compose -f docker-compose.prod.yml exec certbot certbot renew --force-renewal
docker compose -f docker-compose.prod.yml exec nginx nginx -s reload
```

## Troubleshooting

### El sitio no carga

1. Verificar que los contenedores estén corriendo:
   ```bash
   docker compose -f docker-compose.prod.yml ps
   ```

2. Ver logs de nginx:
   ```bash
   docker compose -f docker-compose.prod.yml logs nginx
   ```

3. Ver logs de la app:
   ```bash
   docker compose -f docker-compose.prod.yml logs app
   ```

### Error de base de datos

1. Verificar que postgres está corriendo:
   ```bash
   docker compose -f docker-compose.prod.yml ps postgres
   ```

2. Ver logs de postgres:
   ```bash
   docker compose -f docker-compose.prod.yml logs postgres
   ```

3. Verificar conexión:
   ```bash
   docker compose -f docker-compose.prod.yml exec postgres pg_isready -U antartur
   ```

### Certificados SSL no funcionan

1. Verificar que el dominio apunta al servidor:
   ```bash
   ping antartur.tur.ar
   nslookup antartur.tur.ar
   ```

2. Verificar que los certificados existen:
   ```bash
   ls -la certbot/conf/live/antartur.tur.ar/
   ```

3. Re-obtener certificados:
   ```bash
   ./scripts/init-ssl.sh
   ```

### GitHub Actions falla

1. Verificar que los secrets están configurados correctamente
2. Verificar que la clave SSH tiene acceso al VPS
3. Probar conexión SSH manualmente:
   ```bash
   ssh -p5857 -i ~/.ssh/github_actions_antartur root@149.50.129.68
   ```

## Monitoreo

### Verificar uso de recursos

```bash
# Uso de disco
df -h

# Uso de memoria
free -h

# Uso de CPU
top

# Uso de Docker
docker system df
```

### Limpiar recursos de Docker

```bash
# Eliminar imágenes no usadas
docker image prune -a

# Eliminar contenedores parados
docker container prune

# Limpiar todo (cuidado!)
docker system prune -a
```

