# Diagrama de Arquitectura - Antartur

**Versión:** 2.0  
**Última actualización:** Enero 2025  
**Arquitectura:** Clean Architecture orientada a features

---

## Arquitectura General

```mermaid
graph TB
    subgraph "Frontend - Next.js App Router"
        A[Pages] --> B[Components]
        B --> C[Modules]
        C --> D[API Routes]
        B --> E[Contexts]
        E --> F[CurrencyContext]
    end
    
    subgraph "Backend - Next.js API Routes"
        D --> G[Rate Limiter]
        G --> H[Controller Error Handler]
        H --> I[Controllers]
        I --> J[Domain Services]
        J --> K[Repositories]
    end
    
    subgraph "Database Layer"
        K --> L[Prisma ORM]
        L --> M[(PostgreSQL)]
    end
    
    subgraph "External Services"
        J --> N[Payment Gateways]
        J --> O[Email Service]
        J --> P[WhatsApp Service]
    end
    
    style A fill:#e1f5ff
    style B fill:#e1f5ff
    style C fill:#e1f5ff
    style D fill:#fff4e1
    style I fill:#fff4e1
    style J fill:#fff4e1
    style K fill:#fff4e1
    style L fill:#ffe1f5
    style M fill:#ffe1f5
```

**Nota:** El handler layer fue eliminado en diciembre 2024. Los controllers se llaman directamente desde las API routes con `withControllerErrorHandler`.

---

## Flujo de Datos - Creación de Reserva

```mermaid
sequenceDiagram
    participant U as Usuario
    participant F as Frontend
    participant API as API Route
    participant RL as Rate Limiter
    participant EH as Error Handler
    participant C as Controller
    participant S as OrderService
    participant R as Repository
    participant DB as PostgreSQL
    
    U->>F: Selecciona fecha y pasajeros
    F->>API: POST /api/orders
    API->>RL: withRateLimitHandler("write")
    RL->>EH: withControllerErrorHandler()
    EH->>C: OrdersController.create()
    
    C->>C: validateBody(createOrderSchema)
    C->>S: createReservation(input)
    
    S->>R: TourPriceRepository.findByTourIdAndCurrency()
    R->>DB: SELECT TourPrice WHERE tourId AND currency
    DB-->>R: TourPrice
    R-->>S: priceAdult, priceChild
    
    S->>R: TourDepartureRepository.findById()
    R->>DB: SELECT TourDeparture WHERE id FOR UPDATE
    DB-->>R: TourDeparture
    R-->>S: seatsTotal, seatsHeld, seatsConfirmed
    
    S->>S: Validar disponibilidad
    S->>S: Validar restricciones
    S->>S: Determinar OrderType (RESERVATION/ENQUIRY)
    
    S->>DB: BEGIN TRANSACTION
    S->>DB: INSERT Order
    S->>DB: UPDATE TourDeparture (seatsHeld++)
    S->>DB: INSERT Booking
    S->>DB: INSERT Passenger[]
    S->>DB: COMMIT TRANSACTION
    
    DB-->>S: Order creada
    S->>S: Crear notificaciones (PENDING)
    S-->>C: Order + Booking
    C->>C: toOrderResponse(order)
    C-->>EH: OrderResponse
    EH-->>RL: 201 Created
    RL-->>API: Response
    API-->>F: JSON Response
    F->>F: Guardar en sessionStorage
    F-->>U: Redirige a /checkout
```

---

## Estructura de Módulos (Actualizada - Sin Handler Layer)

```mermaid
graph TB
    subgraph "src/modules - Organización por Dominio"
        subgraph "tours"
            T1[api/controllers/toursController.ts]
            T2[api/client/toursClient.ts]
            T3[api/server/toursServer.ts]
            T4[domain/tourService.ts]
            T5[domain/tourPriceService.ts]
            T6[infra/tourRepository.ts]
            T7[infra/tourPriceRepository.ts]
            T8[components/ToursGrid]
        end
        
        subgraph "orders"
            O1[api/controllers/ordersController.ts]
            O2[api/client/ordersClient.ts]
            O3[domain/orderService.ts]
            O4[infra/orderRepository.ts]
            O5[api/dto/ordersDto.ts]
            O6[api/validators/ordersValidators.ts]
        end
        
        subgraph "booking"
            B1[components/Calendar]
            B2[components/MiniCart]
            B3[components/CheckoutForm]
            B4[hooks/useBookingFlow.ts]
            B5[hooks/useCalendarState.ts]
        end
        
        subgraph "payments"
            P1[api/client/paymentsClient.ts]
            P2[domain/paymentService.ts]
            P3[infra/paymentRepository.ts]
            P4[infra/paypalService.ts]
            P5[infra/paywayService.ts]
        end
        
        subgraph "notifications"
            N1[api/controllers/notificationsController.ts]
            N2[domain/notificationService.ts]
            N3[domain/emailService.ts]
            N4[infra/notificationRepository.ts]
            N5[templates/reservationEmail.ts]
        end
    end
    
    subgraph "src/lib"
        L1[db.ts - PrismaClient Singleton]
        L2[middleware/rateLimiter.ts]
        L3[api/controllerWrapper.ts]
        L4[api/swagger.ts]
    end
    
    T1 --> T4
    T4 --> T6
    T6 --> L1
    
    O1 --> O3
    O3 --> O4
    O4 --> L1
    
    P2 --> P3
    P3 --> L1
    
    N1 --> N2
    N2 --> N3
    N2 --> N4
    N4 --> L1
```

**Cambios clave:**
- ✅ Handler layer eliminado (diciembre 2024)
- ✅ Controllers llaman directamente a Domain Services
- ✅ API clients organizados por dominio
- ✅ Domain services contienen lógica de negocio
- ✅ Repositories solo acceden a datos

---

## Flujo de Autenticación (JWT + Refresh Tokens)

```mermaid
sequenceDiagram
    participant U as Usuario
    participant F as Frontend
    participant API as API Route
    participant C as AuthController
    participant S as AuthService
    participant DB as PostgreSQL
    
    U->>F: Ingresa email/password
    F->>API: POST /api/auth/login
    API->>C: AuthController.login()
    
    C->>C: validateBody(loginSchema)
    C->>S: authenticateUser(email, password)
    
    S->>DB: SELECT User WHERE email
    DB-->>S: User (passwordHash)
    S->>S: bcrypt.compare(password, passwordHash)
    
    alt Credenciales válidas
        S->>S: Generar JWT access token
        S->>S: Generar refresh token
        S->>DB: INSERT RefreshToken
        S-->>C: { accessToken, refreshToken, user }
        C-->>API: 200 OK
        API-->>F: Tokens + User
        F->>F: Guardar tokens en httpOnly cookies
        F-->>U: Redirige a /admin
    else Credenciales inválidas
        S-->>C: Error 401
        C-->>API: 401 Unauthorized
        API-->>F: Error message
        F-->>U: Muestra error
    end
    
    Note over F,DB: Refresh token flow
    F->>API: POST /api/auth/refresh
    API->>C: AuthController.refresh()
    C->>S: refreshAccessToken(refreshToken)
    S->>DB: SELECT RefreshToken WHERE token AND expiresAt > now
    alt Token válido
        S->>S: Generar nuevo access token
        S-->>C: { accessToken }
        C-->>API: 200 OK
        API-->>F: Nuevo access token
    else Token inválido/expirado
        S-->>C: Error 401
        C-->>API: 401 Unauthorized
        API-->>F: Error - requiere login
    end
```

---

## Flujo de Pago - PayPal

```mermaid
sequenceDiagram
    participant U as Usuario
    participant F as Frontend
    participant API as API Route
    participant C as PaymentsController
    participant S as PaymentService
    participant PS as PayPalService
    participant PG as PayPal Gateway
    participant DB as PostgreSQL
    
    U->>F: Selecciona PayPal en checkout
    F->>API: POST /api/payments/paypal/create
    API->>C: PaymentsController.createPayPalPayment()
    
    C->>C: validateBody(paypalCreateSchema)
    C->>S: createPayPalPayment(orderId, amount)
    
    S->>DB: SELECT Order WHERE id
    DB-->>S: Order
    S->>S: Validar que order.status = PENDING_PAYMENT
    
    S->>PS: createOrder(amount, currency, returnUrl)
    PS->>PG: POST /v2/checkout/orders
    PG-->>PS: { id: "PAYPAL_ORDER_ID", links: [...] }
    PS-->>S: PayPalOrder
    
    S->>DB: INSERT Payment (status: PENDING)
    S-->>C: { paymentId, approvalUrl }
    C-->>API: 200 OK
    API-->>F: { paymentId, approvalUrl }
    
    F->>F: window.location.href = approvalUrl
    F-->>U: Redirige a PayPal
    
    U->>PG: Completa pago en PayPal
    PG->>API: POST /api/payments/webhook/paypal
    API->>C: PaymentsController.handlePayPalWebhook()
    
    C->>C: Validar firma del webhook
    C->>S: processPayPalWebhook(webhookData)
    
    S->>PS: verifyWebhook(webhookData)
    PS->>PG: GET /v2/notifications/verify-webhook-signature
    PG-->>PS: Verified
    
    S->>DB: SELECT Payment WHERE providerPaymentId
    S->>DB: UPDATE Payment (status: APPROVED)
    S->>DB: UPDATE Order (status: PAID)
    S->>DB: UPDATE Booking (status: CONFIRMED)
    S->>DB: UPDATE TourDeparture (seatsConfirmed++, seatsHeld--)
    
    S->>S: Crear notificación de confirmación
    S-->>C: Success
    C-->>API: 200 OK
    API-->>PG: Webhook procesado
```

---

## Flujo de Pago - Payway

```mermaid
sequenceDiagram
    participant U as Usuario
    participant F as Frontend
    participant API as API Route
    participant C as PaymentsController
    participant S as PaymentService
    participant PS as PaywayService
    participant PW as Payway Gateway
    participant DB as PostgreSQL
    
    U->>F: Selecciona Payway en checkout
    F->>API: POST /api/payments/payway/create
    API->>C: PaymentsController.createPaywayPayment()
    
    C->>C: validateBody(paywayCreateSchema)
    C->>S: createPaywayPayment(orderId, amount)
    
    S->>DB: SELECT Order WHERE id
    DB-->>S: Order
    S->>S: Validar que order.status = PENDING_PAYMENT
    
    S->>PS: createPayment(amount, currency, orderCode)
    PS->>PW: POST /api/v1/payments
    PW-->>PS: { id: "PAYWAY_PAYMENT_ID", formToken, url }
    PS-->>S: PaywayPayment
    
    S->>DB: INSERT Payment (status: PENDING)
    S-->>C: { paymentId, formToken, url }
    C-->>API: 200 OK
    API-->>F: { paymentId, formToken, url }
    
    F->>F: Redirigir a Payway con formToken
    F-->>U: Redirige a Payway
    
    U->>PW: Completa pago en Payway
    PW->>API: POST /api/payments/webhook/payway
    API->>C: PaymentsController.handlePaywayWebhook()
    
    C->>C: Validar firma del webhook
    C->>S: processPaywayWebhook(webhookData)
    
    S->>PS: verifyWebhook(webhookData)
    PS->>PW: Verificar firma
    PW-->>PS: Verified
    
    S->>DB: SELECT Payment WHERE providerPaymentId
    S->>DB: UPDATE Payment (status: APPROVED)
    S->>DB: UPDATE Order (status: PAID)
    S->>DB: UPDATE Booking (status: CONFIRMED)
    S->>DB: UPDATE TourDeparture (seatsConfirmed++, seatsHeld--)
    
    S->>S: Crear notificación de confirmación
    S-->>C: Success
    C-->>API: 200 OK
    API-->>PW: Webhook procesado
```

---

## Flujo de Pago - Transferencia Bancaria

```mermaid
sequenceDiagram
    participant U as Usuario
    participant F as Frontend
    participant API as API Route
    participant C as OrdersController
    participant S as OrderService
    participant DB as PostgreSQL
    
    U->>F: Selecciona Transferencia en checkout
    F->>API: POST /api/orders
    API->>C: OrdersController.create()
    
    C->>C: validateBody(createOrderSchema)
    C->>S: createReservation(input)
    
    S->>DB: BEGIN TRANSACTION
    S->>DB: INSERT Order (type: RESERVATION, status: PENDING_PAYMENT)
    S->>DB: INSERT Booking (status: HELD)
    S->>DB: UPDATE TourDeparture (seatsHeld++)
    S->>DB: COMMIT TRANSACTION
    
    S-->>C: Order creada
    C-->>API: 201 Created
    API-->>F: Order + code
    
    F->>F: Guardar order code
    F-->>U: Redirige a /checkout/transfer
    
    Note over U,DB: Usuario realiza transferencia manualmente
    
    U->>U: Transfiere dinero a cuenta bancaria
    U->>U: Envía comprobante por email
    
    Note over U,DB: Admin verifica y aprueba manualmente
    
    Admin->>DB: UPDATE Order (status: PAID)
    DB->>DB: UPDATE Booking (status: CONFIRMED)
    DB->>DB: UPDATE TourDeparture (seatsConfirmed++, seatsHeld--)
    
    Note over U,DB: Sistema envía notificación
    
    System->>System: Crear Notification (PENDING)
    System->>System: Enviar email de confirmación
    System->>System: UPDATE Notification (status: SENT)
```

---

## Flujo de Notificaciones con Reintentos

```mermaid
sequenceDiagram
    participant OS as OrderService
    participant NS as NotificationService
    participant ES as EmailService
    participant DB as PostgreSQL
    participant SMTP as SMTP Server
    participant Cron as Cron Job
    
    OS->>NS: createNotification(orderId, type, templateKey)
    NS->>DB: INSERT Notification (status: PENDING)
    NS->>ES: sendEmail(notification)
    
    ES->>SMTP: Enviar email
    alt Email enviado exitosamente
        SMTP-->>ES: 200 OK
        ES->>DB: UPDATE Notification (status: SENT, sentAt: now)
        ES-->>NS: Success
    else Error al enviar
        SMTP-->>ES: Error 500
        ES->>DB: UPDATE Notification (status: ERROR, errorMessage, retryCount++)
        ES->>DB: UPDATE Notification (nextRetryAt: now + backoff)
        ES-->>NS: Error
    end
    
    Note over Cron,DB: Cron job ejecuta cada 15 minutos
    
    Cron->>DB: SELECT Notification WHERE status = ERROR AND nextRetryAt <= now LIMIT 100
    DB-->>Cron: Notifications pendientes
    
    loop Para cada notificación
        Cron->>NS: retryNotification(notificationId)
        NS->>DB: SELECT Notification WHERE id
        NS->>NS: Validar retryCount < maxRetries
        
        alt Retries disponibles
            NS->>ES: sendEmail(notification)
            ES->>SMTP: Enviar email
            alt Éxito
                SMTP-->>ES: 200 OK
                ES->>DB: UPDATE Notification (status: SENT, sentAt: now)
            else Error
                SMTP-->>ES: Error
                ES->>DB: UPDATE Notification (retryCount++, nextRetryAt: now + backoff)
                alt RetryCount >= maxRetries
                    ES->>DB: UPDATE Notification (status: ERROR permanente)
                end
            end
        else Sin retries disponibles
            NS->>DB: UPDATE Notification (status: ERROR permanente)
        end
    end
```

---

## Flujo de Expiración de Órdenes

```mermaid
sequenceDiagram
    participant Cron as Cron Job
    participant API as API Route
    participant C as AdminController
    participant S as OrderService
    participant NS as NotificationService
    participant DB as PostgreSQL
    
    Note over Cron,DB: Cron job ejecuta cada hora
    
    Cron->>API: GET /api/cron/cancel-expired-orders?secret=CRON_SECRET
    API->>API: Validar CRON_SECRET
    API->>C: AdminController.cancelExpiredOrders()
    
    C->>S: cancelExpiredOrders()
    S->>DB: SELECT Order WHERE status = PENDING_PAYMENT AND expiresAt <= now
    DB-->>S: Orders expiradas
    
    loop Para cada orden expirada
        S->>DB: BEGIN TRANSACTION
        S->>DB: UPDATE Order (status: EXPIRED)
        
        S->>DB: SELECT Booking WHERE orderId
        loop Para cada booking
            S->>DB: UPDATE Booking (status: CANCELLED)
            S->>DB: UPDATE TourDeparture (seatsHeld -= booking.totalSeats)
        end
        
        S->>DB: COMMIT TRANSACTION
        
        S->>NS: createNotification(orderId, "order-expired")
        NS->>DB: INSERT Notification (status: PENDING)
    end
    
    S-->>C: { cancelled: count }
    C-->>API: 200 OK
    API-->>Cron: { success: true, cancelled: count }
```

---

## Arquitectura de Capas

```mermaid
graph TB
    subgraph "Presentation Layer"
        P1[Pages - Next.js App Router]
        P2[Components - React]
        P3[Client Components]
        P4[Server Components]
    end
    
    subgraph "API Layer"
        A1[API Routes - route.ts]
        A2[Rate Limiter Middleware]
        A3[Error Handler Middleware]
    end
    
    subgraph "Controller Layer"
        C1[Controllers]
        C2[Validators - Zod]
        C3[DTOs - Data Transformation]
    end
    
    subgraph "Domain Layer"
        D1[Domain Services]
        D2[Business Logic]
        D3[Domain Types]
    end
    
    subgraph "Infrastructure Layer"
        I1[Repositories]
        I2[External Services]
        I3[Email Service]
        I4[Payment Services]
    end
    
    subgraph "Data Layer"
        DA1[Prisma ORM]
        DA2[PostgreSQL]
    end
    
    P1 --> A1
    P2 --> A1
    P3 --> A1
    P4 --> A1
    
    A1 --> A2
    A2 --> A3
    A3 --> C1
    
    C1 --> C2
    C1 --> D1
    C1 --> C3
    
    D1 --> I1
    D1 --> I2
    D1 --> I3
    D1 --> I4
    
    I1 --> DA1
    I2 --> DA1
    I3 --> DA1
    I4 --> DA1
    
    DA1 --> DA2
```

**Principios:**
- **Separación de responsabilidades**: Cada capa tiene una responsabilidad clara
- **Dependencias unidireccionales**: Las capas superiores dependen de las inferiores
- **Domain-driven**: La lógica de negocio está en Domain Services
- **Infrastructure agnostic**: Domain no conoce detalles de implementación

---

## Flujo de Precios por Moneda (Frontend)

```mermaid
sequenceDiagram
    participant U as Usuario
    participant CS as CurrencySwitcher
    participant CC as CurrencyContext
    participant TC as TourCard
    participant BC as BannerBooking
    participant API as API
    
    U->>CS: Click en USD
    CS->>CC: setCurrency('USD')
    CC->>CC: localStorage.setItem('currency', 'USD')
    CC->>CC: Actualizar estado global
    
    TC->>CC: useCurrency()
    CC-->>TC: currency = 'USD'
    TC->>TC: getDisplayPrice() usando prices.USD
    TC->>TC: formatPriceByCurrency(amount, 'USD')
    TC-->>U: Muestra "USD 233"
    
    BC->>CC: useCurrency()
    CC-->>BC: currency = 'USD'
    BC->>BC: getPriceByCurrency(prices, 'USD')
    BC->>API: GET /api/tours/:id/availability?currency=USD
    API-->>BC: Precios en USD
    BC-->>U: Muestra precios en USD
    
    Note over U,API: Al cambiar moneda, todos los componentes se actualizan automáticamente
```

---

## Rate Limiting por Endpoint

```mermaid
graph LR
    subgraph "Rate Limit Configs"
        RL1[public - 200 req/hour]
        RL2[write - 50 req/hour]
        RL3[admin - 500 req/hour]
        RL4[contact - 10 req/hour]
        RL5[notifications - 30 req/hour]
        RL6[webhooks - 100 req/hour]
    end
    
    subgraph "Endpoints"
        E1[Tours - public]
        E2[Orders - write]
        E3[Admin - admin]
        E4[Contact - contact]
        E5[Notifications - notifications]
        E6[Webhooks - webhooks]
    end
    
    E1 --> RL1
    E2 --> RL2
    E3 --> RL3
    E4 --> RL4
    E5 --> RL5
    E6 --> RL6
```

**Configuración:**
- **public**: Endpoints de lectura (tours, availability) - 200 req/hour
- **write**: Endpoints de escritura (orders, bookings) - 50 req/hour
- **admin**: Endpoints administrativos - 500 req/hour
- **contact**: Formulario de contacto - 10 req/hour
- **notifications**: Endpoints de notificaciones - 30 req/hour
- **webhooks**: Webhooks de pagos - 100 req/hour

---

## Consideraciones de Arquitectura

### Ventajas de la Arquitectura Actual

1. **Sin Handler Layer**: Menos capas, código más directo
2. **Domain Services**: Lógica de negocio centralizada y testeable
3. **Repositories**: Acceso a datos abstracto, fácil de mockear
4. **Rate Limiting**: Protección en todos los endpoints
5. **Error Handling**: Centralizado en `controllerWrapper`
6. **Type Safety**: TypeScript estricto en todas las capas

### Mejoras Futuras

1. **Caching Layer**: Redis para queries frecuentes
2. **Event Bus**: Para desacoplar notificaciones
3. **Queue System**: Para procesar notificaciones asíncronas
4. **API Versioning**: Para cambios sin romper clientes

---

**Documento actualizado:** Enero 2025  
**Próxima revisión:** Cuando se agreguen nuevas capas o servicios significativos
