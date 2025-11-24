# Migración del Modelo de Precios

## Resumen

Este documento describe la migración del modelo de precios de tours de un sistema basado en conversión de monedas a un sistema de precios individuales por moneda.

## Cambios Realizados

### 1. Base de Datos

#### Tablas Eliminadas
- **`CurrencyRate`**: Tabla que almacenaba tasas de conversión entre monedas. Ya no es necesaria porque cada tour tiene precios específicos por moneda.

#### Tablas Modificadas
- **`Tour`**: 
  - ❌ Eliminados campos: `baseCurrency`, `basePriceAdult`, `basePriceChild`
  - ✅ Agregada relación: `prices` (uno a muchos con `TourPrice`)

- **`Currency`**:
  - ❌ Eliminadas relaciones: `baseRates`, `quoteRates`, `baseTours`
  - ✅ Agregada relación: `tourPrices`

#### Tablas Nuevas
- **`TourPrice`**:
  - `id` (PK)
  - `tourId` (FK → Tour)
  - `currency` (FK → Currency)
  - `priceAdult` (Decimal)
  - `priceChild` (Decimal)
  - `createdAt`, `updatedAt`
  - Índice único: `(tourId, currency)`

### 2. Backend

#### Repositorios
- **`TourPriceRepository`**: Nuevo repositorio para gestionar precios de tours
- **`TourRepository`**: Actualizado para incluir `includePrices` en métodos de consulta
- **`CurrencyRepository`**: Eliminado método `getExchangeRate`

#### Servicios de Dominio
- **`orderService.createReservation`**: 
  - Ahora obtiene precios directamente de `TourPrice` según la moneda solicitada
  - Eliminada lógica de conversión de monedas

#### API
- **Nuevos endpoints**:
  - `GET /api/tours/:id/prices` - Listar precios de un tour
  - `GET /api/tours/:id/prices/:currency` - Obtener precio por moneda
  - `POST /api/tours/:id/prices` - Crear precio para un tour
  - `PUT /api/tours/:id/prices/:priceId` - Actualizar precio
  - `DELETE /api/tours/:id/prices/:priceId` - Eliminar precio

- **Endpoints actualizados**:
  - `GET /api/tours` - Ahora incluye `prices` en la respuesta
  - `GET /api/tours/:id` - Ahora incluye `prices` en la respuesta
  - `POST /api/tours` - Ya no requiere `baseCurrency`, `basePriceAdult`, `basePriceChild`

#### Validators y DTOs
- Actualizados para reflejar la nueva estructura sin `baseCurrency` y con `prices` array
- Nuevos validators y DTOs para `TourPrice`

### 3. Frontend

#### Context y Hooks
- **`CurrencyContext`**: Nuevo contexto para manejar la moneda seleccionada globalmente
- **`useCurrency`**: Hook para acceder y cambiar la moneda seleccionada
- Persistencia en `localStorage` para mantener la selección del usuario

#### Componentes
- **`CurrencySwitcher`**: Componente para cambiar entre ARS y USD (agregado al Header)
- **`TourCard`**: Actualizado para mostrar precio según moneda seleccionada
- **`BannerBooking`**: Actualizado para obtener precio según moneda
- **`PricingBreakdown`**: Actualizado para formatear precios según moneda
- **`BookingSummary`**: Actualizado para formatear precios según moneda
- **`PaymentModal`**: Actualizado para formatear precios según moneda

#### Utilidades
- **`formatPriceByCurrency`**: Nueva función para formatear precios según moneda
  - ARS: `$1.000` (sin decimales, con punto de miles)
  - USD: `USD 100` (sin decimales, prefijo USD)
- **`pricingHelpers`**: Helpers para obtener precios según moneda desde objetos de precios

#### Tipos
- **`Pricing`**: Agregado campo `currency`
- **`TourCardData`**: Agregado campo `prices` opcional
- **`Tour`**: Actualizado `booking.pricing` para incluir `currency` y `prices`

### 4. Mockup Data

- **`toursData.json`**: Actualizado con estructura de precios por moneda:
  ```json
  {
    "prices": {
      "ARS": { "adult": 233000, "child": 116500 },
      "USD": { "adult": 233, "child": 116 }
    }
  }
  ```

## Migración de Datos

La migración SQL incluye un script que:
1. Crea la tabla `TourPrice`
2. Migra precios existentes de `Tour` a `TourPrice` (asumiendo que `baseCurrency` es la moneda)
3. Elimina columnas obsoletas de `Tour`
4. Elimina la tabla `CurrencyRate`

## Formato de Precios

### ARS (Pesos Argentinos)
- Formato: `$1.000`
- Sin decimales
- Con punto como separador de miles
- Prefijo: `$`

### USD (Dólares)
- Formato: `USD 100`
- Sin decimales
- Prefijo: `USD`

## Moneda por Defecto

- **ARS** es la moneda por defecto
- El usuario puede cambiar a USD usando el `CurrencySwitcher` en el Header
- La selección se persiste en `localStorage`

## Consideraciones Futuras

- Soporte para otras monedas (Reales, Euros) puede agregarse fácilmente agregando nuevas entradas en `TourPrice`
- El formato de precio puede extenderse en `formatPriceByCurrency` para nuevas monedas
- El `CurrencySwitcher` puede extenderse para mostrar más opciones

## Testing

- Actualizar fixtures de tests para usar la nueva estructura
- Verificar que los endpoints de TourPrice funcionan correctamente
- Verificar que el formateo de precios funciona para ambas monedas
- Verificar que el cambio de moneda actualiza todos los componentes correctamente

