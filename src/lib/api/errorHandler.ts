/**
 * Manejo centralizado de errores para API
 * Implementa RFC 7807 (Problem Details for HTTP APIs)
 */

import { NextResponse } from "next/server";

export class ApiError extends Error {
  statusCode: number;
  code?: string;
  details?: Record<string, unknown>;

  constructor(
    message: string,
    statusCode: number = 500,
    code?: string,
    details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 400, "VALIDATION_ERROR", details);
    this.name = "ValidationError";
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string, id?: string) {
    const message = id
      ? `${resource} with id '${id}' not found`
      : `${resource} not found`;
    super(message, 404, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string = "Unauthorized") {
    super(message, 401, "UNAUTHORIZED");
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends ApiError {
  constructor(message: string = "Forbidden") {
    super(message, 403, "FORBIDDEN");
    this.name = "ForbiddenError";
  }
}

export class ConflictError extends ApiError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 409, "CONFLICT", details);
    this.name = "ConflictError";
  }
}

export class BadRequestError extends ApiError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 400, "BAD_REQUEST", details);
    this.name = "BadRequestError";
  }
}

/**
 * Error de autenticación - credenciales inválidas
 */
export class AuthenticationError extends ApiError {
  constructor(message: string = "Invalid credentials") {
    super(message, 401, "AUTHENTICATION_FAILED");
    this.name = "AuthenticationError";
  }
}

/**
 * Error de token expirado
 */
export class TokenExpiredError extends ApiError {
  constructor(message: string = "Token expired") {
    super(message, 401, "TOKEN_EXPIRED");
    this.name = "TokenExpiredError";
  }
}

/**
 * Error de token inválido
 */
export class InvalidTokenError extends ApiError {
  constructor(message: string = "Invalid token") {
    super(message, 401, "INVALID_TOKEN");
    this.name = "InvalidTokenError";
  }
}

/**
 * Formatea un error según RFC 7807
 */
export function formatError(error: unknown): {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
  code?: string;
  details?: Record<string, unknown>;
} {
  if (error instanceof ApiError) {
    return {
      type: `https://antartur.tur.ar/errors/${error.code || "INTERNAL_ERROR"}`,
      title: error.name,
      status: error.statusCode,
      detail: error.message,
      code: error.code,
      details: error.details,
    };
  }

  if (error instanceof Error) {
    return {
      type: "https://antartur.tur.ar/errors/INTERNAL_ERROR",
      title: "Internal Server Error",
      status: 500,
      detail:
        process.env.NODE_ENV === "development"
          ? error.message
          : "An unexpected error occurred",
    };
  }

  return {
    type: "https://antartur.tur.ar/errors/UNKNOWN_ERROR",
    title: "Unknown Error",
    status: 500,
    detail: "An unknown error occurred",
  };
}

/**
 * Middleware para manejar errores en route handlers
 */
export function handleApiError(error: unknown): NextResponse {
  const formattedError = formatError(error);
  const status = formattedError.status;

  // Log error en desarrollo
  if (process.env.NODE_ENV === "development") {
    console.error("API Error:", formattedError);
    if (error instanceof Error && error.stack) {
      console.error("Stack:", error.stack);
    }
  }

  return NextResponse.json(formattedError, { status });
}

/**
 * Wrapper para route handlers que maneja errores automáticamente
 */
export function withErrorHandler<
  T extends (...args: Parameters<T>) => Promise<NextResponse>,
>(handler: T): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleApiError(error);
    }
  }) as T;
}
