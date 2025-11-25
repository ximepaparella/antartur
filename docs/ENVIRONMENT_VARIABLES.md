# Variables de Entorno - Configuración Completa

Este documento describe todas las variables de entorno necesarias para el funcionamiento completo del sistema de checkout y pagos.

## Variables Obligatorias

### Database
```env
DATABASE_URL=postgresql://usuario:contraseña@host:puerto/base_de_datos
```
**Descripción:** URL de conexión a PostgreSQL.  
**Ejemplo:** `postgresql://antartur:password@db.railway.app:5432/antartur`  
**Environments:** Production, Preview, Development

### Site URL
```env
NEXT_PUBLIC_SITE_URL=https://antartur.tur.ar
```
**Descripción:** URL base del sitio (usado en emails y links).  
**Environments:** Production, Preview

## Variables de Email

### Opción A: Gmail (Recomendado para empezar)
```env
GMAIL_USER=tu_email@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
```
**Descripción:** Credenciales de Gmail para enviar emails.  
**Nota:** Requiere contraseña de aplicación (no la contraseña normal).

### Opción B: SMTP (Para producción profesional)
```env
SMTP_HOST=smtp.tu-servidor.com
SMTP_PORT=587
SMTP_USER=tu_usuario_smtp
SMTP_PASSWORD=tu_contraseña_smtp
SMTP_FROM=noreply@antartur.tur.ar
```
**Descripción:** Configuración SMTP para envío de emails.

### Email Destinatario
```env
CONTACT_RECIPIENT_EMAIL=agencias@antartur.tur.ar
```
**Descripción:** Email donde se reciben consultas del formulario de contacto y copias de reservas.  
**Environments:** Production, Preview

## Variables de Expiración de Órdenes

```env
ORDER_EXPIRATION_HOURS=1
```
**Descripción:** Tiempo en horas antes de cancelar automáticamente órdenes pendientes (consultas, PayPal, Payway).  
**Default:** 1 hora

```env
BANK_TRANSFER_EXPIRATION_HOURS=24
```
**Descripción:** Tiempo en horas antes de cancelar automáticamente órdenes con transferencia bancaria.  
**Default:** 24 horas

## Variables de Datos Bancarios

Estas variables se usan en la página de transferencia bancaria:

```env
BANK_ACCOUNT_NAME=Gustavo Adolfo Francisco Giro
BANK_ACCOUNT_NUMBER=6893238937
BANK_NAME=HSBC
BANK_CUIT=20-20453913-9
BANK_CBU=1500689100068932389378
BANK_ALIAS=Antartur
```
**Descripción:** Datos bancarios para transferencias.  
**Nota:** Estos son valores por defecto. Pueden configurarse en variables de entorno para facilitar cambios.

## Variables de Gateways de Pago

### PayPal
```env
PAYPAL_CLIENT_ID=tu_paypal_client_id
PAYPAL_CLIENT_SECRET=tu_paypal_client_secret
```
**Descripción:** Credenciales de PayPal API.  
**Uso:** Solo disponible cuando currency es USD.

### Payway
```env
PAYWAY_API_KEY=tu_payway_api_key
PAYWAY_MERCHANT_ID=tu_payway_merchant_id
```
**Descripción:** Credenciales de Payway API.  
**Uso:** Solo disponible cuando currency es ARS.  
**Documentación:** https://developers.payway.com.ar/documentation

## Variables de Cron Job

```env
CRON_SECRET=tu_secret_aleatorio_para_cron
```
**Descripción:** Secret para proteger el endpoint de cancelación automática de órdenes.  
**Uso:** Configurar en Vercel Cron o sistema de cron similar.  
**Generación:** Usar un string aleatorio seguro (ej: `openssl rand -hex 32`)

## Variables Opcionales

### reCAPTCHA (para formulario de contacto)
```env
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=tu_site_key
RECAPTCHA_SECRET_KEY=tu_secret_key
```
**Descripción:** Credenciales de Google reCAPTCHA para protección del formulario de contacto.

## Configuración en Vercel

1. Ve a **Settings** → **Environment Variables**
2. Agrega cada variable según el ambiente (Production, Preview, Development)
3. Redesplega después de agregar variables

## Configuración Local

1. Crea un archivo `.env.local` en la raíz del proyecto
2. Copia las variables necesarias desde este documento
3. Reemplaza los valores con tus credenciales reales
4. **IMPORTANTE:** `.env.local` está en `.gitignore` y no se subirá al repositorio

## Verificación

Después de configurar las variables:

1. **Database:** Verifica conexión en `/api/test-db` (si existe)
2. **Email:** Envía un test desde el formulario de contacto
3. **Checkout:** Crea una orden de prueba y verifica que se envíen emails
4. **Cron:** Verifica que el endpoint `/api/cron/cancel-expired-orders` responda (requiere autenticación)

## Notas Importantes

- Las variables con prefijo `NEXT_PUBLIC_` son accesibles en el cliente (frontend)
- Las variables sin prefijo solo están disponibles en el servidor
- Nunca subas archivos `.env` o `.env.local` al repositorio
- Usa diferentes valores para Production y Development cuando sea necesario
- Las variables se aplican después de redesplegar en Vercel

