/**
 * Configuraciones de rate limiting para endpoints específicos de la API
 * Centraliza las configuraciones para fácil mantenimiento
 */

import type { RateLimitConfig } from "./rateLimiter";

export const apiRateLimits: Record<string, RateLimitConfig | string> = {
  // Tours endpoints - lectura pública
  "/api/tours": "public",
  "/api/tours/[id]": "public",
  "/api/tours/slug": "public",
  "/api/tours/[id]/availability": "public",
  "/api/tours/[id]/prices": "public",

  // Availability endpoints - lectura pública
  "/api/availability": "public",

  // Orders endpoints - escritura limitada
  "/api/orders": "write",
  "/api/orders/[id]": "write",
  "/api/orders/code": "write",

  // Bookings endpoints - escritura limitada
  "/api/bookings": "write",
  "/api/bookings/[id]": "write",

  // Payments endpoints - escritura limitada
  "/api/payments": "write",
  "/api/payments/[id]": "write",
  "/api/payments/webhook": {
    points: 100, // Webhooks pueden recibir más requests
    duration: 3600,
  },

  // Passengers endpoints - lectura pública
  "/api/passengers": "public",

  // Notifications endpoints
  "/api/notifications": "notifications",
  "/api/notifications/[id]": "notifications",

  // Admin endpoints - alto límite
  "/api/admin": "admin",
  "/api/admin/stats": "admin",
  "/api/admin/orders": "admin",

  // Contact form - límite estricto (ya implementado en route)
  "/api/contact": "contact",
};

/**
 * Obtiene la configuración de rate limiting para una ruta específica
 */
export function getRateLimitForRoute(route: string): RateLimitConfig | string {
  // Buscar coincidencia exacta primero
  if (apiRateLimits[route]) {
    return apiRateLimits[route];
  }

  // Buscar coincidencia parcial (para rutas dinámicas)
  for (const [pattern, config] of Object.entries(apiRateLimits)) {
    if (route.startsWith(pattern.replace(/\[.*?\]/g, ""))) {
      return config;
    }
  }

  // Default: rate limiting público
  return "public";
}

