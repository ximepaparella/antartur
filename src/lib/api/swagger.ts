/**
 * Configuración de Swagger/OpenAPI
 */

import swaggerJsdoc from "swagger-jsdoc";
import type { Options as SwaggerOptions } from "swagger-jsdoc";

const options: SwaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Antartur API",
      version: "1.0.0",
      description: "API REST para el sistema de reservas de Antartur",
      contact: {
        name: "Antartur Support",
        email: "agencias@antartur.tur.ar",
      },
    },
    servers: [
      {
        url: (() => {
          // Usar SITE_URL (servidor) o NEXT_PUBLIC_SITE_URL (cliente), con fallback apropiado
          const siteUrl = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL;
          if (siteUrl) {
            return siteUrl;
          }
          // Fallback a localhost para desarrollo, o URL de producción si estamos en producción
          return process.env.NODE_ENV === "production" ? "https://coderoots.tech" : "http://localhost:3000";
        })(),
        description: (() => {
          const siteUrl = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL;
          if (siteUrl) {
            try {
              const hostname = new URL(siteUrl).hostname;
              return `Production server (${hostname})`;
            } catch {
              return "Production server";
            }
          }
          return process.env.NODE_ENV === "production" ? "Production server (coderoots.tech)" : "Development server";
        })(),
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        Error: {
          type: "object",
          properties: {
            type: { type: "string" },
            title: { type: "string" },
            status: { type: "number" },
            detail: { type: "string" },
            code: { type: "string" },
            details: { type: "object" },
          },
        },
        PaginationMeta: {
          type: "object",
          properties: {
            page: { type: "number" },
            limit: { type: "number" },
            total: { type: "number" },
            totalPages: { type: "number" },
            hasNext: { type: "boolean" },
            hasPrev: { type: "boolean" },
          },
        },
        ApiResponse: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            data: { type: "object" },
            meta: { $ref: "#/components/schemas/PaginationMeta" },
            timestamp: { type: "string", format: "date-time" },
          },
        },
        Tour: {
          type: "object",
          properties: {
            id: { type: "string" },
            slug: { type: "string" },
            name: { type: "string" },
            subtitle: { type: "string", nullable: true },
            category: { type: "string" },
            difficulty: { type: "string" },
            durationHours: { type: "number" },
            prices: {
              type: "array",
              items: { $ref: "#/components/schemas/TourPrice" },
            },
            featuredImage: { type: "string" },
            heroImage: { type: "string" },
            shortDescription: { type: "string" },
            longDescription: { type: "string" },
            restrictionText: { type: "string" },
            isActive: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        TourPrice: {
          type: "object",
          properties: {
            id: { type: "string" },
            tourId: { type: "string" },
            currency: { type: "string", example: "ARS" },
            priceAdult: { type: "number", example: 100000 },
            priceChild: { type: "number", example: 50000 },
            priceInfantFree: { type: "boolean", default: false },
            childAgeRange: { type: "string", nullable: true, example: "4-11" },
            childPriceType: { type: "string", enum: ["FULL_CHILD_PRICE", "HALF_ADULT_PRICE", "ADULT_PRICE"], default: "FULL_CHILD_PRICE" },
            infantMaxAge: { type: "number", default: 3 },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        TourAdditional: {
          type: "object",
          properties: {
            id: { type: "string" },
            tourId: { type: "string" },
            name: { type: "string", example: "Con Canoas" },
            description: { type: "string", nullable: true },
            isActive: { type: "boolean", default: true },
            sortOrder: { type: "number", default: 0 },
            prices: {
              type: "array",
              items: { $ref: "#/components/schemas/TourAdditionalPrice" },
            },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        TourAdditionalPrice: {
          type: "object",
          properties: {
            id: { type: "string" },
            tourAdditionalId: { type: "string" },
            currency: { type: "string", example: "ARS" },
            priceAdult: { type: "number", example: 20000 },
            priceChild: { type: "number", example: 10000 },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        CreateTourInput: {
          type: "object",
          required: [
            "slug",
            "name",
            "category",
            "difficulty",
            "durationHours",
            "featuredImage",
            "heroImage",
            "shortDescription",
            "longDescription",
          ],
          properties: {
            slug: { type: "string", example: "tour-ushuaia" },
            name: { type: "string", example: "Tour Ushuaia" },
            subtitle: { type: "string", example: "Descubre Ushuaia" },
            category: { type: "string", example: "summer" },
            difficulty: { type: "string", example: "Baja" },
            durationHours: { type: "number", example: 4 },
            featuredImage: { type: "string", example: "/images/tour.jpg" },
            heroImage: { type: "string", example: "/images/tour-hero.jpg" },
            shortDescription: { type: "string" },
            longDescription: { type: "string" },
            restrictionText: { type: "string" },
            isActive: { type: "boolean", default: true },
          },
        },
        CreateTourPriceInput: {
          type: "object",
          required: ["tourId", "currency", "priceAdult", "priceChild"],
          properties: {
            tourId: { type: "string" },
            currency: { type: "string", example: "ARS" },
            priceAdult: { type: "number", example: 100000 },
            priceChild: { type: "number", example: 50000 },
          },
        },
        Order: {
          type: "object",
          properties: {
            id: { type: "string" },
            code: { type: "string" },
            type: { type: "string", enum: ["RESERVATION", "ENQUIRY"] },
            status: {
              type: "string",
              enum: ["PENDING_PAYMENT", "PAID", "CANCELLED", "EXPIRED", "COMPLETED"],
            },
            customerName: { type: "string" },
            customerEmail: { type: "string" },
            customerPhone: { type: "string" },
            currency: { type: "string" },
            totalAmount: { type: "number" },
            expiresAt: { type: "string", format: "date-time", nullable: true },
            notes: { type: "string", nullable: true },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        CreateOrderInput: {
          type: "object",
          required: [
            "tourId",
            "departureId",
            "numAdults",
            "numChildren",
            "currency",
            "customerName",
            "customerEmail",
            "customerPhone",
            "passengers",
          ],
          properties: {
            tourId: { type: "string" },
            departureId: { type: "string" },
            numAdults: { type: "number", minimum: 1 },
            numChildren: { type: "number", minimum: 0 },
            currency: { type: "string", example: "ARS" },
            customerName: { type: "string" },
            customerEmail: { type: "string", format: "email" },
            customerPhone: { type: "string" },
            passengers: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { type: "string", enum: ["ADULT", "CHILD", "INFANT"] },
                  firstName: { type: "string" },
                  lastName: { type: "string" },
                  birthDate: { type: "string", format: "date" },
                  documentType: { type: "string" },
                  documentNumber: { type: "string" },
                  nationality: { type: "string" },
                  email: { type: "string", format: "email" },
                  phone: { type: "string" },
                },
              },
            },
            notes: { type: "string" },
          },
        },
        Availability: {
          type: "object",
          properties: {
            id: { type: "string" },
            tourId: { type: "string" },
            date: { type: "string", format: "date" },
            startTime: { type: "string", example: "09:00" },
            endTime: { type: "string", example: "13:00", nullable: true },
            available: { type: "number" },
            seatsTotal: { type: "number" },
            seatsHeld: { type: "number" },
            seatsConfirmed: { type: "number" },
            isActive: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Booking: {
          type: "object",
          properties: {
            id: { type: "string" },
            orderId: { type: "string" },
            tourDepartureId: { type: "string" },
            status: { type: "string", enum: ["HELD", "CONFIRMED", "CANCELLED"] },
            numAdults: { type: "number" },
            numChildren: { type: "number" },
            totalSeats: { type: "number" },
            unitPriceAdult: { type: "number" },
            unitPriceChild: { type: "number" },
            currency: { type: "string" },
            tourNameSnapshot: { type: "string" },
            departureDateSnapshot: { type: "string", format: "date" },
            startTimeSnapshot: { type: "string", example: "09:00" },
            meetingPointSnapshot: { type: "string", nullable: true },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Passenger: {
          type: "object",
          properties: {
            id: { type: "string" },
            bookingId: { type: "string" },
            type: { type: "string", enum: ["ADULT", "CHILD", "INFANT"] },
            firstName: { type: "string" },
            lastName: { type: "string" },
            birthDate: { type: "string", format: "date", nullable: true },
            documentType: { type: "string", nullable: true },
            documentNumber: { type: "string", nullable: true },
            nationality: { type: "string", nullable: true },
            email: { type: "string", format: "email", nullable: true },
            phone: { type: "string", nullable: true },
            restrictions: { type: "object", nullable: true },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Payment: {
          type: "object",
          properties: {
            id: { type: "string" },
            orderId: { type: "string" },
            provider: { type: "string", example: "PAYPAL" },
            providerPaymentId: { type: "string", nullable: true },
            status: { type: "string", enum: ["PENDING", "APPROVED", "DECLINED", "REFUNDED"] },
            amount: { type: "number" },
            currency: { type: "string" },
            paidAt: { type: "string", format: "date-time", nullable: true },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Notification: {
          type: "object",
          properties: {
            id: { type: "string" },
            orderId: { type: "string", nullable: true },
            type: { type: "string", enum: ["EMAIL", "WHATSAPP"] },
            recipient: { type: "string" },
            templateKey: { type: "string", example: "reservation-confirmation" },
            subject: { type: "string", nullable: true },
            body: { type: "string", nullable: true },
            status: { type: "string", enum: ["PENDING", "SENT", "ERROR"] },
            errorMessage: { type: "string", nullable: true },
            sentAt: { type: "string", format: "date-time", nullable: true },
            retryCount: { type: "number", default: 0 },
            maxRetries: { type: "number", default: 5 },
            nextRetryAt: { type: "string", format: "date-time", nullable: true },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        User: {
          type: "object",
          properties: {
            id: { type: "string" },
            email: { type: "string", format: "email" },
            name: { type: "string", nullable: true },
            role: { type: "string", enum: ["ADMIN", "OPERATOR"] },
            isActive: { type: "boolean", default: true },
            lastLoginAt: { type: "string", format: "date-time", nullable: true },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        PaymentGateway: {
          type: "object",
          properties: {
            id: { type: "string" },
            provider: { type: "string", example: "PAYPAL" },
            isActive: { type: "boolean", default: false },
            isSandbox: { type: "boolean", default: true },
            displayName: { type: "string", example: "PayPal" },
            currency: { type: "string", example: "USD" },
            config: { type: "object", nullable: true },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        BankTransfer: {
          type: "object",
          properties: {
            id: { type: "string" },
            isActive: { type: "boolean", default: false },
            accountName: { type: "string" },
            accountNumber: { type: "string" },
            bank: { type: "string" },
            cuit: { type: "string" },
            cbu: { type: "string" },
            alias: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        LoginInput: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email", example: "admin@antartur.tur.ar" },
            password: { type: "string", format: "password" },
          },
        },
        LoginResponse: {
          type: "object",
          properties: {
            accessToken: { type: "string" },
            refreshToken: { type: "string" },
            user: { $ref: "#/components/schemas/User" },
          },
        },
        CreatePayPalPaymentInput: {
          type: "object",
          required: ["orderId", "amount", "currency"],
          properties: {
            orderId: { type: "string" },
            amount: { type: "number", example: 180.00 },
            currency: { type: "string", enum: ["USD"], example: "USD" },
          },
        },
        CreatePaywayPaymentInput: {
          type: "object",
          required: ["orderId", "amount", "currency"],
          properties: {
            orderId: { type: "string" },
            amount: { type: "number", example: 180000 },
            currency: { type: "string", enum: ["ARS"], example: "ARS" },
          },
        },
        UpdateOrderStatusInput: {
          type: "object",
          required: ["status"],
          properties: {
            status: {
              type: "string",
              enum: ["PENDING_PAYMENT", "PAID", "CANCELLED", "EXPIRED", "COMPLETED"],
            },
          },
        },
        UpdateBookingStatusInput: {
          type: "object",
          required: ["status"],
          properties: {
            status: {
              type: "string",
              enum: ["HELD", "CONFIRMED", "CANCELLED"],
            },
          },
        },
        CreateNotificationInput: {
          type: "object",
          required: ["type", "recipient", "templateKey"],
          properties: {
            orderId: { type: "string", nullable: true },
            type: { type: "string", enum: ["EMAIL", "WHATSAPP"] },
            recipient: { type: "string", format: "email" },
            templateKey: {
              type: "string",
              enum: [
                "reservation-confirmation",
                "reservation-notification",
                "enquiry-confirmation",
                "enquiry-notification",
                "payment-confirmation",
                "order-expired",
              ],
            },
            subject: { type: "string", nullable: true },
            body: { type: "string", nullable: true },
          },
        },
        UpdatePaymentGatewayInput: {
          type: "object",
          properties: {
            isActive: { type: "boolean" },
            isSandbox: { type: "boolean" },
            displayName: { type: "string" },
          },
        },
        UpdateBankTransferInput: {
          type: "object",
          required: ["accountName", "cuit", "cbu", "alias"],
          properties: {
            isActive: { type: "boolean" },
            accountName: { type: "string" },
            accountNumber: { type: "string", nullable: true },
            bank: { type: "string", nullable: true },
            cuit: { type: "string" },
            cbu: { type: "string" },
            alias: { type: "string" },
          },
        },
        AvailablePaymentMethodsResponse: {
          type: "object",
          properties: {
            methods: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  provider: { type: "string", example: "paypal" },
                  displayName: { type: "string", example: "PayPal" },
                  currency: { type: "string", example: "USD" },
                },
              },
            },
            hasOnlinePayment: { type: "boolean" },
          },
        },
        BankDetailsResponse: {
          type: "object",
          properties: {
            accountName: { type: "string" },
            accountNumber: { type: "string", nullable: true },
            bank: { type: "string", nullable: true },
            cuit: { type: "string" },
            cbu: { type: "string" },
            alias: { type: "string" },
          },
        },
      },
      responses: {
        NotFoundError: {
          description: "Recurso no encontrado",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
              example: {
                type: "NotFoundError",
                title: "Not Found",
                status: 404,
                detail: "El recurso solicitado no fue encontrado",
                code: "NOT_FOUND",
              },
            },
          },
        },
        BadRequestError: {
          description: "Solicitud inválida",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
              example: {
                type: "ValidationError",
                title: "Bad Request",
                status: 400,
                detail: "Los datos proporcionados son inválidos",
                code: "VALIDATION_ERROR",
              },
            },
          },
        },
      },
    } as any,
    tags: [
      { name: "Tours", description: "Operaciones relacionadas con tours" },
      { name: "Availability", description: "Operaciones relacionadas con disponibilidad de tours" },
      { name: "Orders", description: "Operaciones relacionadas con órdenes y reservas" },
      { name: "Bookings", description: "Operaciones relacionadas con bookings" },
      { name: "Passengers", description: "Operaciones relacionadas con pasajeros" },
      { name: "Payments", description: "Operaciones relacionadas con pagos" },
      { name: "Notifications", description: "Operaciones relacionadas con notificaciones" },
      { name: "Auth", description: "Autenticación y autorización" },
      { name: "Admin", description: "Operaciones administrativas" },
      { name: "Admin Settings", description: "Configuración administrativa (gateways, transferencias)" },
      { name: "Contact", description: "Formulario de contacto" },
      { name: "Cron Jobs", description: "Tareas programadas (requieren CRON_SECRET)" },
    ],
  },
  apis: [
    "./src/app/api/**/*.ts",
    "./src/modules/**/api/**/*.ts",
  ],
};

export const swaggerSpec = swaggerJsdoc(options);

