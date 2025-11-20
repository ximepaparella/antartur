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
      },
    },
    tags: [
      { name: "Tours", description: "Operaciones relacionadas con tours" },
      { name: "Availability", description: "Operaciones relacionadas con disponibilidad de tours" },
      { name: "Orders", description: "Operaciones relacionadas con órdenes y reservas" },
      { name: "Bookings", description: "Operaciones relacionadas con bookings" },
      { name: "Passengers", description: "Operaciones relacionadas con pasajeros" },
      { name: "Payments", description: "Operaciones relacionadas con pagos" },
      { name: "Notifications", description: "Operaciones relacionadas con notificaciones" },
      { name: "Admin", description: "Operaciones administrativas" },
    ],
  },
  apis: [
    "./src/app/api/**/*.ts",
    "./src/modules/**/api/**/*.ts",
  ],
};

export const swaggerSpec = swaggerJsdoc(options);

