/**
 * Middleware de autenticación para proteger rutas API
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./jwt";
import type { AuthUser, AuthMiddlewareOptions } from "./types";
import type { UserRole } from "@prisma/client";

/**
 * Extrae el token del header Authorization
 */
function extractBearerToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader) return null;
  
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") {
    return null;
  }
  
  return parts[1];
}

/**
 * Obtiene el usuario autenticado del request
 * Retorna null si no hay token válido
 */
export async function getAuthUser(request: NextRequest): Promise<AuthUser | null> {
  const token = extractBearerToken(request);
  if (!token) return null;

  const result = await verifyToken(token);
  if (!result.valid) return null;

  // Solo aceptar access tokens
  if (result.payload.type !== "access") return null;

  return {
    id: result.payload.sub,
    email: result.payload.email,
    role: result.payload.role,
  };
}

/**
 * Tipo para route handlers
 */
type RouteContext = {
  params: Promise<Record<string, string>>;
};

type RouteHandler = (
  request: NextRequest,
  context: RouteContext
) => Promise<NextResponse | Response>;

/**
 * Respuesta de error de autenticación
 */
function unauthorizedResponse(message: string, code: string): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: message,
      code,
    },
    { status: 401 }
  );
}

/**
 * Respuesta de error de autorización
 */
function forbiddenResponse(message: string): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: message,
      code: "FORBIDDEN",
    },
    { status: 403 }
  );
}

/**
 * Middleware wrapper para proteger rutas
 * 
 * @example
 * // Proteger ruta para cualquier usuario autenticado
 * export const GET = withAuth(handler);
 * 
 * @example
 * // Proteger ruta solo para admins
 * export const DELETE = withAuth(handler, { roles: ["ADMIN"] });
 */
export function withAuth(
  handler: RouteHandler,
  options: AuthMiddlewareOptions = {}
): RouteHandler {
  return async (request: NextRequest, context: RouteContext) => {
    const token = extractBearerToken(request);
    
    // Verificar que haya token
    if (!token) {
      return unauthorizedResponse(
        "Authentication required",
        "MISSING_TOKEN"
      );
    }

    // Verificar el token
    const result = await verifyToken(token);
    
    if (!result.valid) {
      if (result.error === "expired") {
        return unauthorizedResponse(
          "Token expired",
          "TOKEN_EXPIRED"
        );
      }
      return unauthorizedResponse(
        "Invalid token",
        "INVALID_TOKEN"
      );
    }

    // Solo aceptar access tokens
    if (result.payload.type !== "access") {
      return unauthorizedResponse(
        "Invalid token type",
        "INVALID_TOKEN_TYPE"
      );
    }

    // Verificar rol si se especificó
    if (options.roles && options.roles.length > 0) {
      if (!options.roles.includes(result.payload.role)) {
        return forbiddenResponse(
          `Access denied. Required role: ${options.roles.join(" or ")}`
        );
      }
    }

    // Agregar usuario al request para acceso en el handler
    // Usamos un header custom para pasar la info (pattern común en Next.js)
    const requestWithUser = new NextRequest(request.url, {
      method: request.method,
      headers: new Headers(request.headers),
      body: request.body,
    });
    requestWithUser.headers.set("x-user-id", result.payload.sub);
    requestWithUser.headers.set("x-user-email", result.payload.email);
    requestWithUser.headers.set("x-user-role", result.payload.role);

    return handler(requestWithUser, context);
  };
}

/**
 * Helper para obtener el usuario del request en un handler protegido
 */
export function getUserFromRequest(request: NextRequest): AuthUser | null {
  const id = request.headers.get("x-user-id");
  const email = request.headers.get("x-user-email");
  const role = request.headers.get("x-user-role") as UserRole | null;

  if (!id || !email || !role) return null;

  return { id, email, role };
}
