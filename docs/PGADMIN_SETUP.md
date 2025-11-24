# Configuración de pgAdmin

## Conectar pgAdmin al servidor PostgreSQL

El endpoint `/api/test-db` confirma que la base de datos está funcionando correctamente. Para ver las tablas en pgAdmin, necesitas agregar el servidor PostgreSQL.

### Pasos para configurar pgAdmin:

1. **En pgAdmin (http://localhost:5050):**
   - Click en "Add New Server" (o click derecho en "Servers" → "Register" → "Server")

2. **En la pestaña "General":**
   - **Name:** `Antartur Local` (o cualquier nombre que prefieras)

3. **En la pestaña "Connection":**
   - **Host name/address:** `postgres` (nombre del servicio en Docker Compose)
   - **Port:** `5432`
   - **Maintenance database:** `antartur`
   - **Username:** `antartur`
   - **Password:** `antartur_dev_password`
   - ✅ Marcar "Save password" si quieres que se guarde

4. **En la pestaña "Advanced" (opcional):**
   - **DB restriction:** `antartur` (para mostrar solo esta base de datos)

5. Click en "Save"

### Verificar la conexión:

Una vez conectado, deberías ver:
- **Servers** → **Antartur Local** → **Databases** → **antartur** → **Schemas** → **public** → **Tables**

Las tablas que deberías ver:
- Booking
- Currency (con 3 registros)
- CurrencyRate (con 4 registros)
- Notification
- Order
- Passenger
- Payment
- Tour
- TourDeparture
- TourImage
- User
- _prisma_migrations

### Si no puedes conectar:

**Problema:** "Unable to connect to server"

**Soluciones:**
1. Verificar que Docker Compose esté corriendo:
   ```bash
   docker-compose ps
   ```

2. Verificar que el servicio `postgres` esté corriendo:
   ```bash
   docker ps | grep postgres
   ```

3. Si pgAdmin está corriendo fuera de Docker, usar `localhost` en lugar de `postgres`:
   - **Host name/address:** `localhost`
   - **Port:** `5432`

4. Verificar que el puerto 5432 esté expuesto:
   ```bash
   docker-compose ps postgres
   ```

### Nota importante:

- Si pgAdmin está corriendo **dentro de Docker** (como servicio en docker-compose.yml), usa `postgres` como hostname
- Si pgAdmin está corriendo **fuera de Docker** (instalado localmente), usa `localhost` como hostname

