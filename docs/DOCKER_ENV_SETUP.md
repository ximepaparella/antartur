# Configuración de Variables de Entorno en Docker

## Variables de Entorno en Producción

### Variable Crítica: `SITE_URL`

La variable `SITE_URL` es **crítica** para el correcto funcionamiento de los pagos (PayPal, Payway) y las URLs de retorno.

#### Configuración en el servidor

1. **Crear o editar el archivo `.env` en el servidor:**
   ```bash
   # En el servidor, en el directorio del proyecto
   nano .env
   ```

2. **Agregar la variable `SITE_URL`:**
   ```env
   SITE_URL=https://coderoots.tech
   ```
   
   **Nota:** Cuando cambien a `antartur.tur.ar`, actualizar a:
   ```env
   SITE_URL=https://antartur.tur.ar
   ```

3. **Verificar que la variable esté configurada:**
   ```bash
   # Verificar que el archivo .env existe y tiene SITE_URL
   grep SITE_URL .env
   ```

#### Cómo funciona

- `SITE_URL` se usa en el **servidor** (API routes) para construir URLs de retorno de PayPal/Payway
- `NEXT_PUBLIC_SITE_URL` se usa en el **cliente** (React components) y se expone al navegador
- Ambas se configuran desde la misma variable `SITE_URL` en el `.env`
- El fallback en `docker-compose.prod.yml` es `https://coderoots.tech`

#### Verificación después del deploy

1. **Verificar variables en el contenedor:**
   ```bash
   docker compose -f docker-compose.prod.yml exec app env | grep SITE_URL
   ```
   
   Deberías ver:
   ```
   SITE_URL=https://coderoots.tech
   NEXT_PUBLIC_SITE_URL=https://coderoots.tech
   ```

2. **Verificar en los logs que las URLs se construyen correctamente:**
   ```bash
   docker compose -f docker-compose.prod.yml logs app | grep -i "paypal\|payway\|return"
   ```

3. **Probar un pago de prueba:**
   - Crear una orden de prueba
   - Iniciar pago con PayPal
   - Verificar que la URL de retorno sea `https://coderoots.tech/checkout/paypal/return?orderId=...`
   - **NO** debería ser `http://localhost:3000/...`

## Cambio de URL de Producción

Cuando cambien de `coderoots.tech` a `antartur.tur.ar`:

1. **Actualizar el archivo `.env` en el servidor:**
   ```env
   SITE_URL=https://antartur.tur.ar
   ```

2. **Actualizar el fallback en `docker-compose.prod.yml`** (opcional, pero recomendado):
   ```yaml
   - SITE_URL=${SITE_URL:-https://antartur.tur.ar}
   - NEXT_PUBLIC_SITE_URL=${SITE_URL:-https://antartur.tur.ar}
   ```

3. **Reconstruir y reiniciar:**
   ```bash
   docker compose -f docker-compose.prod.yml up -d --build
   ```

4. **Verificar:**
   ```bash
   docker compose -f docker-compose.prod.yml exec app env | grep SITE_URL
   ```

## Troubleshooting

### Problema: URLs de retorno apuntan a localhost

**Síntoma:** Los pagos redirigen a `http://localhost:3000/checkout/paypal/return`

**Solución:**
1. Verificar que `SITE_URL` esté en el `.env` del servidor
2. Verificar que el contenedor tenga la variable:
   ```bash
   docker compose -f docker-compose.prod.yml exec app env | grep SITE_URL
   ```
3. Si no está, reconstruir:
   ```bash
   docker compose -f docker-compose.prod.yml up -d --build
   ```

### Problema: Variable no se actualiza después de cambiar .env

**Solución:** Reconstruir el contenedor:
```bash
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d --build
```

