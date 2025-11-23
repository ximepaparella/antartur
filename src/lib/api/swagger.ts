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
        email: "info@antartur.tur.ar",
      },
    },
    servers: [
      {
        url: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
        description: "Development server",
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
            date: { type: "string", format: "date" },
            startTime: { type: "string", example: "09:00" },
            endTime: { type: "string", example: "13:00", nullable: true },
            available: { type: "number" },
            seatsTotal: { type: "number" },
            seatsHeld: { type: "number" },
            seatsConfirmed: { type: "number" },
            isActive: { type: "boolean" },
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
      { name: "Admin", description: "Operaciones administrativas" },
      { name: "Contact", description: "Formulario de contacto" },
    ],
  },
  apis: [
    "./src/app/api/**/*.ts",
    "./src/modules/**/api/**/*.ts",
  ],
};

export const swaggerSpec = swaggerJsdoc(options);

