/**
 * Middleware de rate limiting reutilizable
 * Usa rate-limiter-flexible para limitar requests por IP
 */

import { NextRequest, NextResponse } from "next/server";
import { RateLimiterMemory } from "rate-limiter-flexible";

export interface RateLimitConfig {
  points: number; // Número de requests permitidos
  duration: number; // Período en segundos
  blockDuration?: number; // Duración del bloqueo en segundos (opcional)
}

/**
 * Configuraciones predefinidas para diferentes tipos de endpoints
 */
export const rateLimitConfigs = {
  public: {
    points: 100,
    duration: 3600, // 1 hora
  },
  write: {
    points: 20,
    duration: 3600, // 1 hora
  },
  admin: {
    points: 1000,
    duration: 3600, // 1 hora
  },
  contact: {
    points: 5,
    duration: 900, // 15 minutos
  },
  notifications: {
    points: 50,
    duration: 3600, // 1 hora
  },
} as const;

/**
 * Obtiene la IP del cliente desde el request
 */
function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    // x-forwarded-for puede contener múltiples IPs, tomar la primera
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  // Fallback para desarrollo local
  return "unknown";
}

/**
 * Crea un rate limiter con la configuración especificada
 */
function createRateLimiter(config: RateLimitConfig): RateLimiterMemory {
  return new RateLimiterMemory({
    points: config.points,
    duration: config.duration,
    blockDuration: config.blockDuration || config.duration,
  });
}

/**
 * Middleware de rate limiting
 * Retorna una función que puede ser usada en route handlers
 */
export function withRateLimit(
  config: RateLimitConfig | keyof typeof rateLimitConfigs
) {
  const rateLimitConfig =
    typeof config === "string" ? rateLimitConfigs[config] : config;
  const rateLimiter = createRateLimiter(rateLimitConfig);

  return async (request: NextRequest) => {
    const clientIp = getClientIp(request);

    try {
      await rateLimiter.consume(clientIp);
      // Request permitido, continuar
      return null;
    } catch (rateLimiterError) {
      // Request bloqueado por rate limit
      return NextResponse.json(
        {
          error: "Demasiadas solicitudes. Por favor, intentá nuevamente más tarde.",
        },
        { status: 429 }
      );
    }
  };
}

/**
 * Tipo helper para asegurar que el segundo parámetro sea requerido
 */
type RouteHandler = (
  request: NextRequest,
  context: { params: Promise<Record<string, string>> }
) => Promise<NextResponse | Response>;

/**
 * Helper para aplicar rate limiting en route handlers
 * Uso: export const GET = withRateLimitHandler("public", handler);
 */
export function withRateLimitHandler(
  config: RateLimitConfig | keyof typeof rateLimitConfigs,
  handler: RouteHandler
): RouteHandler {
  const rateLimitMiddleware = withRateLimit(config);

  return async (request: NextRequest, context: { params: Promise<Record<string, string>> }) => {
    const rateLimitResponse = await rateLimitMiddleware(request);

    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    return handler(request, context);
  };
}

