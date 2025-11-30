# Configuración de Cronjobs en Don Web

Este documento explica cómo configurar los cronjobs necesarios para el sistema de Antartur en Don Web.

## Cronjobs Requeridos

El sistema requiere dos cronjobs:

1. **Cancelar órdenes expiradas** - Ejecuta cada hora
2. **Reintentar notificaciones fallidas** - Ejecuta cada 15 minutos

## Requisitos Previos

Antes de configurar los cronjobs, asegúrate de tener configurada la variable de entorno `CRON_SECRET` en tu servidor Don Web.

### Generar CRON_SECRET

Puedes generar un secret seguro usando:

```bash
openssl rand -hex 32
```

O usando Node.js:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Guarda este valor y configúralo como variable de entorno `CRON_SECRET` en Don Web.

## Configuración en Don Web

### Paso 1: Acceder a la Configuración de Cronjobs

1. Inicia sesión en el panel de control de Don Web
2. Navega a tu sitio web
3. Busca la sección "Cronjobs" o "Tareas Programadas" (puede estar en "Configuración" o "Herramientas")

### Paso 2: Configurar Cronjob 1: Cancelar Órdenes Expiradas

**Configuración:**

- **Nombre:** `Cancelar órdenes expiradas`
- **Comando/URL:** 
  ```
  https://tu-dominio.com/api/cron/cancel-expired-orders
  ```
- **Método:** `GET` o `POST`
- **Frecuencia:** Cada hora (`0 * * * *` en formato cron)
- **Headers (si está disponible):**
  ```
  Authorization: Bearer TU_CRON_SECRET_AQUI
  ```

**Alternativa con query parameter (si Don Web no soporta headers):**

Si Don Web no permite configurar headers personalizados, puedes usar el query parameter:

- **Comando/URL:** 
  ```
  https://tu-dominio.com/api/cron/cancel-expired-orders?secret=TU_CRON_SECRET_AQUI
  ```

**Formato Cron:**
```
0 * * * *
```
Esto ejecuta el cronjob a los minutos 0 de cada hora (00:00, 01:00, 02:00, etc.)

### Paso 3: Configurar Cronjob 2: Reintentar Notificaciones

**Configuración:**

- **Nombre:** `Reintentar notificaciones fallidas`
- **Comando/URL:** 
  ```
  https://tu-dominio.com/api/cron/retry-notifications
  ```
- **Método:** `GET` o `POST`
- **Frecuencia:** Cada 15 minutos (`*/15 * * * *` en formato cron)
- **Headers (si está disponible):**
  ```
  Authorization: Bearer TU_CRON_SECRET_AQUI
  ```

**Alternativa con query parameter:**

- **Comando/URL:** 
  ```
  https://tu-dominio.com/api/cron/retry-notifications?secret=TU_CRON_SECRET_AQUI
  ```

**Formato Cron:**
```
*/15 * * * *
```
Esto ejecuta el cronjob cada 15 minutos (00:00, 00:15, 00:30, 00:45, 01:00, etc.)

## Ejemplos de Configuración

### Ejemplo 1: Don Web con Soporte de Headers

Si Don Web permite configurar headers HTTP personalizados:

**Cronjob 1:**
```
URL: https://antartur.tur.ar/api/cron/cancel-expired-orders
Método: GET
Headers: Authorization: Bearer abc123def456...
Frecuencia: 0 * * * *
```

**Cronjob 2:**
```
URL: https://antartur.tur.ar/api/cron/retry-notifications
Método: GET
Headers: Authorization: Bearer abc123def456...
Frecuencia: */15 * * * *
```

### Ejemplo 2: Don Web sin Soporte de Headers

Si Don Web NO permite headers personalizados, usa query parameters:

**Cronjob 1:**
```
URL: https://antartur.tur.ar/api/cron/cancel-expired-orders?secret=abc123def456...
Método: GET
Frecuencia: 0 * * * *
```

**Cronjob 2:**
```
URL: https://antartur.tur.ar/api/cron/retry-notifications?secret=abc123def456...
Método: GET
Frecuencia: */15 * * * *
```

## Verificación

### Verificar que los Cronjobs Funcionan

1. **Verificar logs del servidor:**
   - Revisa los logs de tu aplicación después de que se ejecute el cronjob
   - Deberías ver mensajes de log indicando que los cronjobs se ejecutaron

2. **Probar manualmente:**
   Puedes probar los endpoints manualmente usando curl:

   ```bash
   # Probar cancelar órdenes expiradas
   curl -H "Authorization: Bearer TU_CRON_SECRET" \
     https://tu-dominio.com/api/cron/cancel-expired-orders

   # O con query parameter
   curl "https://tu-dominio.com/api/cron/cancel-expired-orders?secret=TU_CRON_SECRET"

   # Probar reintentar notificaciones
   curl -H "Authorization: Bearer TU_CRON_SECRET" \
     https://tu-dominio.com/api/cron/retry-notifications

   # O con query parameter
   curl "https://tu-dominio.com/api/cron/retry-notifications?secret=TU_CRON_SECRET"
   ```

3. **Respuesta esperada:**
   Deberías recibir una respuesta JSON como:
   ```json
   {
     "success": true,
     "message": "Processed X notifications",
     "processed": 0,
     "successful": 0,
     "failed": 0,
     "timestamp": "2024-12-XX..."
   }
   ```

## Troubleshooting

### Error 401 Unauthorized

Si recibes un error 401, verifica:
- Que `CRON_SECRET` esté configurado correctamente en las variables de entorno
- Que el secret en el header o query parameter coincida exactamente con `CRON_SECRET`
- Que no haya espacios adicionales en el secret

### Los Cronjobs No Se Ejecutan

1. Verifica que Don Web tenga habilitada la ejecución de cronjobs
2. Revisa los logs de Don Web para ver si hay errores
3. Verifica que la URL sea accesible públicamente (no debe requerir autenticación adicional)
4. Asegúrate de que el formato cron sea correcto

### Notificaciones No Se Reintentan

1. Verifica que el cronjob de reintentos esté configurado y ejecutándose
2. Revisa la tabla `Notification` en la base de datos para ver notificaciones con `status = ERROR`
3. Verifica que `nextRetryAt` sea menor o igual a la fecha/hora actual
4. Revisa los logs del servidor para ver errores durante el reintento

## Notas Importantes

1. **Seguridad:**
   - Nunca compartas tu `CRON_SECRET` públicamente
   - Usa HTTPS para las URLs de los cronjobs
   - El secret debe ser lo suficientemente largo y aleatorio

2. **Frecuencias Recomendadas:**
   - Cancelar órdenes: Cada hora es suficiente (las órdenes tienen tiempos de expiración de 1-24 horas)
   - Reintentar notificaciones: Cada 15 minutos permite reintentos rápidos sin sobrecargar el servidor

3. **En Desarrollo:**
   - Los endpoints permiten requests sin autenticación en modo desarrollo (`NODE_ENV=development`)
   - En producción, siempre se requiere autenticación

4. **Límites:**
   - El endpoint de reintentos procesa máximo 100 notificaciones por ejecución para evitar sobrecarga
   - Si hay más de 100 notificaciones pendientes, se procesarán en la siguiente ejecución

## Formato Cron - Referencia Rápida

```
* * * * *
│ │ │ │ │
│ │ │ │ └─── Día de la semana (0-7, donde 0 y 7 = domingo)
│ │ │ └───── Mes (1-12)
│ │ └─────── Día del mes (1-31)
│ └───────── Hora (0-23)
└─────────── Minuto (0-59)
```

**Ejemplos:**
- `0 * * * *` - Cada hora a los minutos 0
- `*/15 * * * *` - Cada 15 minutos
- `0 0 * * *` - Una vez al día a medianoche
- `0 9 * * 1` - Cada lunes a las 9:00 AM
