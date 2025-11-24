# Antartur API - Postman Collection

Esta documentación describe cómo usar la collection de Postman para interactuar con la API de Antartur.

## Instalación

1. Abre Postman
2. Click en "Import" (botón superior izquierdo)
3. Selecciona los archivos:
   - `postman/Antartur_API.postman_collection.json`
   - `postman/Antartur_API.postman_environment.json`
4. Asegúrate de que el environment "Antartur API - Development" esté seleccionado

## Variables de Entorno

La collection incluye las siguientes variables:

- `base_url`: URL base del servidor (default: `http://localhost:3000`)
- `api_url`: URL base de la API (default: `{{base_url}}/api`)
- `auth_token`: Token de autenticación (para uso futuro)

## Estructura de la Collection

La collection está organizada en las siguientes carpetas:

### Tours
- List Tours
- Get Tour by ID
- Get Tour by Slug
- Create Tour
- Update Tour
- Delete Tour
- **Tour Prices** (subcarpeta)
  - List Tour Prices
  - Get Tour Price by Currency
  - Create Tour Price
  - Update Tour Price
  - Delete Tour Price
- **Tour Availability** (subcarpeta)
  - Get Tour Availability
  - Get Tour Availability by Date
  - Create Availability

### Availability
- Get Availability by ID
- Update Availability
- Delete Availability

### Orders
- List Orders
- Create Order
- Get Order by ID
- Get Order by Code
- Update Order Status

### Bookings
- Get Booking by ID
- Get Bookings by Order
- Update Booking Status
- Get Booking Passengers

### Passengers
- Get Passenger by ID

### Payments
- Get Payment by ID
- Get Payments by Order
- Create Payment
- PayPal Webhook
- Payway Webhook

### Notifications
- Get Notification by ID
- Get Notifications by Order
- Create Notification

### Admin
- Expire Pending Orders
- Get Stats

### Contact
- Send Contact Form

### Docs
- Get Swagger Spec

## Uso

1. **Selecciona el environment**: Asegúrate de tener seleccionado "Antartur API - Development" en el dropdown de environments (arriba a la derecha)

2. **Configura variables**: Si necesitas cambiar la URL base, edita la variable `base_url` en el environment

3. **Ejecuta requests**: 
   - Para endpoints con parámetros dinámicos (como `:id`), edita el valor en la URL antes de ejecutar
   - Para requests POST/PUT, edita el body JSON según tus necesidades

4. **Revisa respuestas**: Todas las respuestas exitosas siguen el formato:
   ```json
   {
     "success": true,
     "data": { ... },
     "timestamp": "2024-01-15T10:30:00Z"
   }
   ```

## Ejemplos de Uso

### Obtener todos los tours de verano

1. Ve a **Tours > List Tours**
2. Habilita el query parameter `category` y establece su valor a `summer`
3. Click en "Send"

### Crear una nueva orden

1. Ve a **Orders > Create Order**
2. Edita el body JSON con los datos reales:
   - Reemplaza `tourId` y `departureId` con IDs válidos
   - Completa la información del cliente y pasajeros
3. Click en "Send"

### Obtener disponibilidad de un tour

1. Ve a **Tours > Tour Availability > Get Tour Availability**
2. Reemplaza `:id` en la URL con el ID del tour
3. Click en "Send"

## Notas

- Todos los endpoints requieren que el servidor esté corriendo en `http://localhost:3000` (o la URL configurada en `base_url`)
- Los webhooks (PayPal, Payway) están configurados pero requieren configuración adicional del servidor para funcionar correctamente
- El endpoint de contacto tiene rate limiting (5 requests por IP cada 15 minutos)

## Troubleshooting

- **Error de conexión**: Verifica que el servidor esté corriendo y que `base_url` sea correcta
- **404 Not Found**: Verifica que los IDs en la URL sean válidos
- **400 Bad Request**: Revisa que el body JSON tenga el formato correcto según la documentación Swagger

