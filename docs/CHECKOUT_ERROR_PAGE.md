# Página de Error de Checkout

## Acceso a la página de error

La página de error de checkout está disponible en `/checkout/error` y acepta parámetros opcionales vía URL.

### Formas de acceder

#### 1. Con mensaje de error personalizado
```
/checkout/error?error=Mensaje%20de%20error%20personalizado
```

Ejemplo:
```
/checkout/error?error=No%20se%20pudo%20procesar%20el%20pago
```

#### 2. Con código de orden
```
/checkout/error?code=ORD-123456789
```

#### 3. Con ambos parámetros
```
/checkout/error?error=Error%20al%20procesar&code=ORD-123456789
```

#### 4. Sin parámetros (mensaje por defecto)
```
/checkout/error
```
Muestra el mensaje por defecto: "Ocurrió un error al procesar tu reserva. Por favor, intenta nuevamente."

### Parámetros aceptados

- `error` (opcional): Mensaje de error codificado en URL. Si no se proporciona, se usa el mensaje por defecto.
- `code` (opcional): Código de orden para mostrar en la página de error.

### Ejemplos de uso

#### Desde el navegador
1. Abre tu navegador
2. Navega a: `http://localhost:3000/checkout/error?error=Error%20de%20prueba&code=TEST-123`

#### Desde código JavaScript/TypeScript
```typescript
import { useRouter } from "next/navigation";

const router = useRouter();

// Redirigir con error personalizado
router.push("/checkout/error?error=" + encodeURIComponent("Error al procesar el pago"));

// Redirigir con código de orden
router.push("/checkout/error?code=ORD-123456789");

// Redirigir con ambos
router.push(
  `/checkout/error?error=${encodeURIComponent("Error al procesar")}&code=ORD-123456789`
);
```

#### Desde la consola del navegador
```javascript
// Redirigir a la página de error
window.location.href = "/checkout/error?error=" + encodeURIComponent("Error de prueba");
```

### Notas

- Los mensajes de error deben estar codificados en URL (usar `encodeURIComponent()` en JavaScript o codificar manualmente los espacios como `%20`)
- La página muestra botones para "Reintentar" (redirige a `/checkout`) y "Contactar soporte" (redirige a `/contacto`)
- Si se proporciona un código de orden, se muestra debajo del mensaje de error

