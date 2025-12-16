/**
 * Utilidades para generación y verificación de JWT
 * Usa jose (compatible con Edge Runtime de Next.js)
 */

import { SignJWT, jwtVerify, errors as joseErrors } from "jose";
import type { JWTPayload, AuthUser } from "./types";
import type { UserRole } from "@prisma/client";

/** Obtiene el secret como Uint8Array para jose */
function getJWTSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not set");
  }
  if (secret.length < 32) {
    throw new Error("JWT_SECRET must be at least 32 characters");
  }
  return new TextEncoder().encode(secret);
}

/** Parsea duración como "15m", "7d" a segundos */
function parseDuration(duration: string): number {
  const match = duration.match(/^(\d+)([smhd])$/);
  if (!match) {
    throw new Error(`Invalid duration format: ${duration}`);
  }
  
  const value = parseInt(match[1], 10);
  const unit = match[2];
  
  switch (unit) {
    case "s": return value;
    case "m": return value * 60;
    case "h": return value * 60 * 60;
    case "d": return value * 60 * 60 * 24;
    default: throw new Error(`Unknown time unit: ${unit}`);
  }
}

/** Obtiene el tiempo de expiración del access token en segundos */
function getAccessTokenExpiry(): number {
  const expiry = process.env.JWT_ACCESS_EXPIRY || "15m";
  return parseDuration(expiry);
}

/** Obtiene el tiempo de expiración del refresh token en segundos */
function getRefreshTokenExpiry(): number {
  const expiry = process.env.JWT_REFRESH_EXPIRY || "7d";
  return parseDuration(expiry);
}

/**
 * Genera un access token (corta duración)
 */
export async function signAccessToken(user: AuthUser): Promise<string> {
  const secret = getJWTSecret();
  const expirySeconds = getAccessTokenExpiry();
  
  const token = await new SignJWT({
    email: user.email,
    role: user.role,
    type: "access",
  } as Omit<JWTPayload, "sub" | "iat" | "exp">)
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${expirySeconds}s`)
    .sign(secret);

  return token;
}

/**
 * Genera un refresh token (larga duración)
 */
export async function signRefreshToken(user: AuthUser): Promise<string> {
  const secret = getJWTSecret();
  const expirySeconds = getRefreshTokenExpiry();
  
  const token = await new SignJWT({
    email: user.email,
    role: user.role,
    type: "refresh",
  } as Omit<JWTPayload, "sub" | "iat" | "exp">)
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${expirySeconds}s`)
    .sign(secret);

  return token;
}

/**
 * Resultado de verificación de token
 */
export type TokenVerificationResult = 
  | { valid: true; payload: JWTPayload }
  | { valid: false; error: "expired" | "invalid" | "malformed" };

/**
 * Verifica un token JWT y retorna su payload
 */
export async function verifyToken(token: string): Promise<TokenVerificationResult> {
  try {
    const secret = getJWTSecret();
    const { payload } = await jwtVerify(token, secret);
    
    // Validar que tenga los campos requeridos
    if (!payload.sub || !payload.email || !payload.role || !payload.type) {
      return { valid: false, error: "malformed" };
    }

    return {
      valid: true,
      payload: {
        sub: payload.sub as string,
        email: payload.email as string,
        role: payload.role as UserRole,
        type: payload.type as "access" | "refresh",
        iat: payload.iat as number,
        exp: payload.exp as number,
      },
    };
  } catch (error) {
    if (error instanceof joseErrors.JWTExpired) {
      return { valid: false, error: "expired" };
    }
    return { valid: false, error: "invalid" };
  }
}

/**
 * Obtiene el tiempo de expiración del refresh token como Date
 */
export function getRefreshTokenExpiryDate(): Date {
  const expirySeconds = getRefreshTokenExpiry();
  return new Date(Date.now() + expirySeconds * 1000);
}
