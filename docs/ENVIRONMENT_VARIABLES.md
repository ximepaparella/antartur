# Environment Variables

Fuente base: `.env.example`.  
Regla: si hay conflicto entre este documento y `.env.example`, prevalece `.env.example`.

## Obligatorias (core)

- `DATABASE_URL`
- `SITE_URL`
- `NEXT_PUBLIC_SITE_URL`
- `JWT_SECRET`
- `JWT_ACCESS_EXPIRY`
- `JWT_REFRESH_EXPIRY`
- `CRON_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

## Email

### Opcion Gmail

- `GMAIL_USER`
- `GMAIL_APP_PASSWORD`

### Opcion SMTP

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`

### Destinatarios

- `CONTACT_EMAIL`
- `CONTACT_RECIPIENT_EMAIL`

## Pagos

### PayPal

- `PAYPAL_CLIENT_ID`
- `PAYPAL_CLIENT_SECRET`
- `PAYPAL_MODE` (`sandbox` o `live`)

### Payway

- `PAYWAY_API_KEY`
- `PAYWAY_MERCHANT_ID`
- `PAYWAY_SITE_ID`
- `PAYWAY_TEMPLATE_ID`
- `PAYWAY_ENVIRONMENT`
- `PAYWAY_PUBLIC_KEY`
- `NEXT_PUBLIC_PAYWAY_PUBLIC_KEY`
- `NEXT_PUBLIC_PAYWAY_ENVIRONMENT`

## Configuracion de reserva y expiracion

- `ORDER_EXPIRATION_HOURS`
- `BANK_TRANSFER_EXPIRATION_HOURS`
- `PENDING_RESERVATION_HOLD_HOURS`
- `NEXT_PUBLIC_BOOKING_CUTOFF_HOUR`

## Transferencia bancaria

- `BANK_ACCOUNT_NAME`
- `BANK_ACCOUNT_NUMBER`
- `BANK_NAME`
- `BANK_CUIT`
- `BANK_CBU`
- `BANK_ALIAS`

## Seguridad y anti abuso

- `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
- `RECAPTCHA_SECRET_KEY`
- `NOTIFICATION_DRY_RUN`

## Analytics y tracking (opcionales)

- `NEXT_PUBLIC_GTM_ID`
- `NEXT_PUBLIC_GA4_ID`

## Reglas de manejo

- No commitear `.env` ni secretos reales.
- Rotar claves si hubo exposicion.
- Mantener valores separados por entorno (dev/preview/prod).
- Validar cambios de variables con smoke tests de checkout, auth admin y pagos.
