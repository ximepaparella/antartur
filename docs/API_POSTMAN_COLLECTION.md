# Antartur API - Postman Collection

**Versión:** 2.0  
**Última actualización:** Enero 2025

Esta documentación describe cómo usar la collection de Postman para interactuar con la API de Antartur.

---

## Instalación

1. Abre Postman
2. Click en "Import" (botón superior izquierdo)
3. Selecciona los archivos:
   - `postman/Antartur_API.postman_collection.json`
   - `postman/Antartur_API.postman_environment.json`
4. Asegúrate de que el environment "Antartur API - Development" esté seleccionado

---

## Variables de Entorno

La collection incluye las siguientes variables:

- `base_url`: URL base del servidor (default: `http://localhost:3000`)
- `api_url`: URL base de la API (default: `{{base_url}}/api`)
- `auth_token`: Token de autenticación JWT (se obtiene del login)
- `cron_secret`: Secret para autenticar cron jobs (solo para endpoints de cron)

---

## Estructura de la Collection

La collection está organizada en las siguientes carpetas:

### 1. Tours

**Endpoints:**
- `GET /api/tours` - Listar tours (con paginación y filtros)
- `GET /api/tours/:id` - Obtener tour por ID
- `GET /api/tours/slug/:slug` - Obtener tour por slug
- `POST /api/tours` - Crear tour
- `PUT /api/tours/:id` - Actualizar tour
- `DELETE /api/tours/:id` - Eliminar tour

**Subcarpeta: Tour Prices**
- `GET /api/tours/:id/prices` - Listar precios de un tour
- `GET /api/tours/:id/prices?currency=ARS` - Obtener precio por moneda
- `POST /api/tours/:id/prices` - Crear precio para un tour
- `PUT /api/tours/:id/prices/:priceId` - Actualizar precio
- `DELETE /api/tours/:id/prices/:priceId` - Eliminar precio

**Subcarpeta: Tour Availability**
- `GET /api/tours/:id/availability` - Obtener disponibilidad completa de un tour
- `GET /api/tours/:id/availability/:date` - Obtener disponibilidad para una fecha específica
- `POST /api/tours/:id/availability` - Crear disponibilidad (requiere auth)

### 2. Availability

**Endpoints:**
- `GET /api/availability/:id` - Obtener disponibilidad por ID
- `PUT /api/availability/:id` - Actualizar disponibilidad (requiere auth)
- `DELETE /api/availability/:id` - Eliminar disponibilidad (requiere auth)

### 3. Orders

**Endpoints:**
- `GET /api/orders` - Listar órdenes (con paginación y filtros, requiere auth)
- `POST /api/orders` - Crear orden/reserva
- `GET /api/orders/:id` - Obtener orden por ID (requiere auth)
- `GET /api/orders/code/:code` - Obtener orden por código (requiere auth)
- `PUT /api/orders/:id/status` - Actualizar estado de orden (requiere auth)

### 4. Bookings

**Endpoints:**
- `GET /api/bookings/:id` - Obtener booking por ID (requiere auth)
- `GET /api/bookings/order/:orderId` - Obtener bookings de una orden (requiere auth)
- `PUT /api/bookings/:id/status` - Actualizar estado de booking (requiere auth)
- `GET /api/bookings/:id/passengers` - Obtener pasajeros de un booking (requiere auth)

### 5. Passengers

**Endpoints:**
- `GET /api/passengers/:id` - Obtener pasajero por ID (requiere auth)

### 6. Payments

**Endpoints:**
- `GET /api/payments/:id` - Obtener pago por ID (requiere auth)
- `GET /api/payments/order/:orderId` - Obtener pagos de una orden (requiere auth)
- `POST /api/payments` - Crear registro de pago (requiere auth, para uso interno)
- `GET /api/payments/available?currency=ARS` - Obtener métodos de pago disponibles

**Subcarpeta: PayPal**
- `POST /api/payments/paypal/create` - Crear pago PayPal
- `POST /api/payments/webhook/paypal` - Webhook de PayPal (para uso de PayPal)

**Subcarpeta: Payway**
- `POST /api/payments/payway/create` - Crear pago Payway
- `POST /api/payments/webhook/payway` - Webhook de Payway (para uso de Payway)

### 7. Notifications

**Endpoints:**
- `GET /api/notifications/:id` - Obtener notificación por ID (requiere auth)
- `GET /api/notifications/order/:orderId` - Obtener notificaciones de una orden (requiere auth)
- `POST /api/notifications` - Crear notificación (requiere auth)

### 8. Auth

**Endpoints:**
- `POST /api/auth/login` - Autenticar usuario
- `POST /api/auth/logout` - Cerrar sesión (requiere auth)
- `GET /api/auth/me` - Obtener usuario actual (requiere auth)
- `POST /api/auth/refresh` - Refrescar access token

### 9. Admin

**Endpoints:**
- `POST /api/admin/orders/expire-pending` - Expirar órdenes pendientes manualmente (requiere auth)
- `GET /api/admin/stats` - Obtener estadísticas del sistema (requiere auth)

**Subcarpeta: Settings**
- `GET /api/admin/settings/payments` - Obtener configuración de gateways (requiere auth)
- `PUT /api/admin/settings/payments/:provider` - Actualizar gateway (requiere auth)
- `POST /api/admin/settings/payments/:provider/test` - Probar gateway (requiere auth)
- `GET /api/admin/settings/bank-transfer` - Obtener configuración bancaria (requiere auth)
- `PUT /api/admin/settings/bank-transfer` - Actualizar configuración bancaria (requiere auth)

**Subcarpeta: Upload**
- `POST /api/admin/upload` - Subir imagen (requiere auth)
- `POST /api/admin/upload/testimonial` - Subir testimonio (requiere auth)

### 10. Contact

**Endpoints:**
- `POST /api/contact` - Enviar formulario de contacto

### 11. Bank Details

**Endpoints:**
- `GET /api/bank-details` - Obtener datos bancarios para transferencia

### 12. Cron Jobs

**Endpoints:**
- `GET /api/cron/cancel-expired-orders?secret={{cron_secret}}` - Cancelar órdenes expiradas (requiere CRON_SECRET)
- `GET /api/cron/retry-notifications?secret={{cron_secret}}` - Reintentar notificaciones fallidas (requiere CRON_SECRET)
- `POST /api/cron/retry-notifications?secret={{cron_secret}}` - Reintentar notificaciones (método POST alternativo)

### 13. Docs

**Endpoints:**
- `GET /api/docs` - Obtener especificación Swagger/OpenAPI en formato JSON

### 14. Testing

**Endpoints:**
- `POST /api/test-email` - Probar configuración SMTP (solo desarrollo)
- `GET /api/test-db` - Probar conexión a base de datos (solo desarrollo)

---

## Autenticación

### Login

1. Ve a **Auth > Login**
2. Edita el body JSON:
   ```json
   {
     "email": "admin@antartur.tur.ar",
     "password": "tu-password"
   }
   ```
3. Click en "Send"
4. Copia el `accessToken` de la respuesta
5. Ve a la pestaña "Authorization" del request
6. Selecciona "Bearer Token"
7. Pega el token en el campo "Token"

### Refresh Token

Si el access token expira:

1. Ve a **Auth > Refresh**
2. El refresh token se envía automáticamente en cookies (httpOnly)
3. Click en "Send"
4. Obtendrás un nuevo access token

### Variables Automáticas

La collection incluye scripts de prueba que automáticamente:
- Guardan el `accessToken` en la variable `auth_token` después del login
- Usan `auth_token` en todos los requests que requieren autenticación

---

## Uso

### 1. Selecciona el environment

Asegúrate de tener seleccionado "Antartur API - Development" en el dropdown de environments (arriba a la derecha)

### 2. Configura variables

Si necesitas cambiar la URL base, edita la variable `base_url` en el environment

### 3. Autentícate

Ejecuta el request **Auth > Login** para obtener un token de autenticación

### 4. Ejecuta requests

- Para endpoints con parámetros dinámicos (como `:id`), edita el valor en la URL antes de ejecutar
- Para requests POST/PUT, edita el body JSON según tus necesidades
- Los requests que requieren autenticación usarán automáticamente el token guardado

### 5. Revisa respuestas

Todas las respuestas exitosas siguen el formato:
```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2025-01-15T10:30:00Z"
}
```

Las respuestas de error siguen el formato:
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

---

## Ejemplos de Uso

### Obtener todos los tours de verano

1. Ve a **Tours > List Tours**
2. Habilita el query parameter `category` y establece su valor a `summer`
3. Click en "Send"

### Crear una nueva orden

1. Ve a **Orders > Create Order**
2. Edita el body JSON con los datos reales:
   ```json
   {
     "tourId": "tour-id-here",
     "departureId": "departure-id-here",
     "numAdults": 2,
     "numChildren": 1,
     "currency": "ARS",
     "customerName": "Juan Pérez",
     "customerEmail": "juan@example.com",
     "customerPhone": "+5491123456789",
     "passengers": [
       {
         "type": "ADULT",
         "firstName": "Juan",
         "lastName": "Pérez",
         "birthDate": "1990-01-15",
         "documentType": "DNI",
         "documentNumber": "12345678",
         "nationality": "AR"
       }
     ]
   }
   ```
3. Click en "Send"

### Obtener disponibilidad de un tour

1. Ve a **Tours > Tour Availability > Get Tour Availability**
2. Reemplaza `:id` en la URL con el ID del tour
3. Click en "Send"

### Crear pago PayPal

1. Ve a **Payments > PayPal > Create PayPal Payment**
2. Edita el body JSON:
   ```json
   {
     "orderId": "order-id-here",
     "amount": 180.00,
     "currency": "USD"
   }
   ```
3. Click en "Send"
4. Usa el `approvalUrl` de la respuesta para redirigir al cliente a PayPal

### Obtener métodos de pago disponibles

1. Ve a **Payments > Get Available Payment Methods**
2. Agrega query parameter `currency=ARS` o `currency=USD`
3. Click en "Send"

### Configurar gateway de pago (Admin)

1. Autentícate como admin
2. Ve a **Admin > Settings > Update Payment Gateway**
3. Reemplaza `:provider` con "PAYPAL" o "PAYWAY"
4. Edita el body JSON:
   ```json
   {
     "isActive": true,
     "isSandbox": false,
     "displayName": "PayPal"
   }
   ```
5. Click en "Send"

### Ejecutar cron job

1. Configura la variable `cron_secret` en el environment con el valor de `CRON_SECRET`
2. Ve a **Cron Jobs > Cancel Expired Orders**
3. Click en "Send"
4. Verifica la respuesta con el número de órdenes canceladas

---

## Rate Limiting

Los endpoints tienen límites de rate limiting configurados:

- **Public endpoints** (tours, availability): 200 requests/hour
- **Write endpoints** (orders, bookings): 50 requests/hour
- **Admin endpoints**: 500 requests/hour
- **Contact form**: 10 requests/hour
- **Notifications**: 30 requests/hour
- **Webhooks**: 100 requests/hour
- **Auth endpoints**: 20 requests/hour

Si excedes el límite, recibirás un error `429 Too Many Requests`.

---

## Notas Importantes

### Endpoints que requieren autenticación

Los siguientes endpoints requieren un token JWT válido:
- Todos los endpoints de **Admin**
- `GET /api/orders` (listar)
- `GET /api/orders/:id`
- `GET /api/orders/code/:code`
- `PUT /api/orders/:id/status`
- Todos los endpoints de **Bookings** (excepto creación que se hace vía Orders)
- Todos los endpoints de **Payments** (excepto create y webhooks)
- Todos los endpoints de **Notifications**
- `PUT /api/availability/:id`
- `DELETE /api/availability/:id`
- `POST /api/tours/:id/availability`

### Endpoints de Cron Jobs

Los endpoints de cron jobs requieren el `CRON_SECRET` en:
- Query parameter: `?secret={{cron_secret}}`
- O header: `Authorization: Bearer {{cron_secret}}`

### Webhooks

Los webhooks de PayPal y Payway están diseñados para ser llamados por los servicios externos, no por Postman directamente. Para probarlos, necesitarías configurar un túnel (ej: ngrok) o usar las herramientas de testing de cada proveedor.

### Variables de entorno necesarias

Para que algunos endpoints funcionen correctamente, necesitas configurar:

- `CRON_SECRET`: Para endpoints de cron jobs
- Credenciales de PayPal/Payway: Para crear pagos
- `SMTP_*`: Para enviar emails

---

## Troubleshooting

### Error de conexión

- Verifica que el servidor esté corriendo
- Verifica que `base_url` sea correcta
- Verifica que no haya firewall bloqueando la conexión

### 404 Not Found

- Verifica que los IDs en la URL sean válidos
- Verifica que la ruta del endpoint sea correcta

### 400 Bad Request

- Revisa que el body JSON tenga el formato correcto
- Verifica que todos los campos requeridos estén presentes
- Revisa la documentación Swagger en `/api/docs`

### 401 Unauthorized

- Verifica que hayas hecho login
- Verifica que el token no haya expirado (haz refresh)
- Verifica que el token esté en el header Authorization

### 403 Forbidden

- Verifica que tu usuario tenga los permisos necesarios (rol ADMIN para endpoints admin)

### 429 Too Many Requests

- Has excedido el límite de rate limiting
- Espera un momento antes de volver a intentar
- Considera usar un token de autenticación (los usuarios autenticados tienen límites más altos)

### 500 Internal Server Error

- Revisa los logs del servidor
- Verifica que la base de datos esté accesible
- Verifica que las variables de entorno estén configuradas correctamente

---

## Próximos Pasos

1. **Explora la API**: Usa la collection para familiarizarte con todos los endpoints
2. **Lee la documentación Swagger**: Visita `/api/docs` en el navegador para ver la documentación interactiva
3. **Revisa los ejemplos**: Cada request tiene ejemplos de body en la descripción
4. **Integra en tu aplicación**: Usa los endpoints desde tu frontend o aplicación móvil

---

**Documento actualizado:** Enero 2025  
**Collection version:** 2.0
