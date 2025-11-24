/**
 * Wrapper para controllers que maneja errores automáticamente
 * Permite que los controllers se enfoquen solo en orquestación
 */

import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/services/logger";
import {
  NotFoundError,
  ValidationError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
} from "./errorHandler";

type ControllerHandler = (
  request: NextRequest,
  context?: { params?: Promise<Record<string, string>> }
) => Promise<NextResponse | Response>;

/**
 * Wrapper que maneja errores automáticamente en controllers
 * Convierte errores de dominio a respuestas HTTP apropiadas
 */
export function withControllerErrorHandler(handler: ControllerHandler) {
  return async (
    request: NextRequest,
    context?: { params?: Promise<Record<string, string>> }
  ): Promise<NextResponse | Response> => {
    try {
      return await handler(request, context);
    } catch (error) {
      // Log del error
      logger.error("Controller error", error, {
        method: request.method,
        url: request.url,
      });

      // Manejar errores conocidos
      if (error instanceof NotFoundError) {
        return NextResponse.json(
          {
            success: false,
            error: error.message,
            code: "NOT_FOUND",
          },
          { status: 404 }
        );
      }

      if (error instanceof ValidationError) {
        return NextResponse.json(
          {
            success: false,
            error: error.message,
            code: "VALIDATION_ERROR",
            details: error.details,
          },
          { status: 400 }
        );
      }

      if (error instanceof BadRequestError) {
        return NextResponse.json(
          {
            success: false,
            error: error.message,
            code: "BAD_REQUEST",
          },
          { status: 400 }
        );
      }

      if (error instanceof UnauthorizedError) {
        return NextResponse.json(
          {
            success: false,
            error: error.message,
            code: "UNAUTHORIZED",
          },
          { status: 401 }
        );
      }

      if (error instanceof ForbiddenError) {
        return NextResponse.json(
          {
            success: false,
            error: error.message,
            code: "FORBIDDEN",
          },
          { status: 403 }
        );
      }

      if (error instanceof ConflictError) {
        return NextResponse.json(
          {
            success: false,
            error: error.message,
            code: "CONFLICT",
          },
          { status: 409 }
        );
      }

      // Error desconocido
      const errorMessage =
        error instanceof Error ? error.message : "Internal server error";
      const errorStack =
        process.env.NODE_ENV === "development" && error instanceof Error
          ? error.stack
          : undefined;

      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
          code: "INTERNAL_ERROR",
          ...(errorStack && { stack: errorStack }),
        },
        { status: 500 }
      );
    }
  };
}

/**
 * Helper para combinar rate limiting y error handling
 */
export function withRateLimitAndErrorHandler(
  rateLimitConfig: string | import("../middleware/rateLimiter").RateLimitConfig,
  handler: ControllerHandler
) {
  const { withRateLimitHandler } = require("../middleware/rateLimiter");
  const rateLimitedHandler = withRateLimitHandler(rateLimitConfig, handler);
  return withControllerErrorHandler(rateLimitedHandler);
}

