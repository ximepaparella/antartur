/**
 * Tipos para el sistema de autenticación JWT
 */

import type { UserRole } from "@prisma/client";

export type { UserRole };

/**
 * Payload del JWT
 */
export interface JWTPayload {
  sub: string;         // userId
  email: string;
  role: UserRole;
  type: "access" | "refresh";
  iat: number;
  exp: number;
}

/**
 * Usuario autenticado (extraído del token)
 */
export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}

/**
 * Respuesta de login
 */
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    role: UserRole;
  };
}

/**
 * Respuesta de refresh
 */
export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

/**
 * Input para login
 */
export interface LoginInput {
  email: string;
  password: string;
}

/**
 * Opciones para el middleware de auth
 */
export interface AuthMiddlewareOptions {
  roles?: UserRole[];
}
