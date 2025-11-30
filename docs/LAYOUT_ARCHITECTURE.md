# Layout Architecture - Next.js 15 Best Practices

## Estado Actual

Actualmente usamos un componente `ConditionalLayout` que verifica la ruta con `usePathname()` para decidir si mostrar Header/Footer. Esto funciona pero no es la solución más óptima para Next.js 15.

## Mejor Práctica: Route Groups + Nested Layouts

### Estructura Recomendada

```
src/app/
├── layout.tsx                    # Root layout (solo providers, sin Header/Footer)
├── (site)/                       # Route group para rutas públicas
│   ├── layout.tsx                # Layout con Header/Footer
│   ├── page.tsx                  # Home
│   ├── tours/
│   ├── contacto/
│   ├── checkout/
│   └── ...
├── admin/
│   ├── layout.tsx                # Layout sin Header/Footer (ya existe)
│   ├── dashboard/
│   └── ...
└── api/                          # API routes (sin layout)
```

### Ventajas

1. **Server Components**: Los layouts son Server Components por defecto, mejor performance
2. **Sin verificación client-side**: No necesita `usePathname()` ni `"use client"`
3. **Mejor organización**: Separación clara entre rutas públicas y admin
4. **Type-safe**: Next.js maneja los tipos automáticamente
5. **Más mantenible**: Cada grupo de rutas tiene su propio layout explícito

### Implementación

#### 1. Root Layout (`app/layout.tsx`)
```tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <ErrorBoundaryClient>
          <Providers>
            {children}  {/* Sin Header/Footer aquí */}
          </Providers>
        </ErrorBoundaryClient>
      </body>
    </html>
  );
}
```

#### 2. Site Layout (`app/(site)/layout.tsx`)
```tsx
import { Header } from "@/modules/layout/components/Header/Header";
import { Footer } from "@/modules/layout/components/Footer/Footer";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}
```

#### 3. Admin Layout (`app/admin/layout.tsx`)
Ya existe y está bien implementado - no incluye Header/Footer.

### Migración

Para migrar a esta estructura:

1. Crear carpeta `(site)` en `app/`
2. Mover rutas públicas a `(site)/`:
   - `page.tsx` → `(site)/page.tsx`
   - `tours/` → `(site)/tours/`
   - `contacto/` → `(site)/contacto/`
   - `checkout/` → `(site)/checkout/`
   - etc.
3. Crear `(site)/layout.tsx` con Header/Footer
4. Actualizar `app/layout.tsx` para remover `ConditionalLayout`
5. Eliminar `ConditionalLayout.tsx`

**Nota**: Los Route Groups (carpetas con paréntesis) no afectan las URLs. `/tours` sigue siendo `/tours` aunque esté en `(site)/tours/`.

## Solución Actual vs Recomendada

| Aspecto | Actual (ConditionalLayout) | Recomendada (Route Groups) |
|---------|----------------------------|----------------------------|
| Tipo de componente | Client Component | Server Component |
| Verificación | Client-side (`usePathname`) | Server-side (estructura de carpetas) |
| Performance | Requiere JS en cliente | Mejor (menos JS) |
| Mantenibilidad | Media (lógica condicional) | Alta (estructura explícita) |
| Complejidad migración | Ya implementado | Requiere reorganizar carpetas |

## Recomendación

La solución actual funciona bien y es aceptable. La migración a Route Groups es recomendable a largo plazo pero no urgente. Se puede hacer cuando haya tiempo para reorganizar las carpetas sin afectar funcionalidad.

