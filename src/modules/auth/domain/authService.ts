/**
 * Servicio de autenticación
 * Maneja login, refresh y logout
 */

import { prisma } from "@/lib/db";
import { logger } from "@/lib/services/logger";
import {
  signAccessToken,
  signRefreshToken,
  verifyToken,
  verifyPassword,
  getRefreshTokenExpiryDate,
} from "@/lib/auth";
import type { LoginResponse, RefreshResponse, AuthUser } from "@/lib/auth";
import { AuthenticationError, InvalidTokenError } from "@/lib/api/errorHandler";
import crypto from "crypto";

/**
 * Genera un token único para refresh
 */
function generateUniqueToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Autentica un usuario con email y password
 */
export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  // Buscar usuario por email
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    logger.warn("Login attempt for non-existent user", { email });
    throw new AuthenticationError("Credenciales inválidas");
  }

  if (!user.isActive) {
    logger.warn("Login attempt for inactive user", { email });
    throw new AuthenticationError("Usuario desactivado");
  }

  // Verificar password
  const isValidPassword = await verifyPassword(password, user.passwordHash);
  if (!isValidPassword) {
    logger.warn("Invalid password attempt", { email });
    throw new AuthenticationError("Credenciales inválidas");
  }

  // Crear auth user para tokens
  const authUser: AuthUser = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  // Generar tokens
  const accessToken = await signAccessToken(authUser);
  const refreshTokenValue = generateUniqueToken();
  const refreshToken = await signRefreshToken(authUser);

  // Guardar refresh token en BD
  await prisma.refreshToken.create({
    data: {
      token: refreshTokenValue,
      userId: user.id,
      expiresAt: getRefreshTokenExpiryDate(),
    },
  });

  // Actualizar último login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  logger.info("User logged in successfully", { userId: user.id, email });

  return {
    accessToken,
    refreshToken: refreshTokenValue,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  };
}

/**
 * Renueva los tokens usando un refresh token válido
 */
export async function refresh(refreshTokenValue: string): Promise<RefreshResponse> {
  // Buscar el token en BD
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: refreshTokenValue },
    include: { user: true },
  });

  if (!storedToken) {
    throw new InvalidTokenError("Refresh token inválido");
  }

  // Verificar expiración
  if (storedToken.expiresAt < new Date()) {
    // Eliminar token expirado
    await prisma.refreshToken.delete({
      where: { id: storedToken.id },
    });
    throw new InvalidTokenError("Refresh token expirado");
  }

  // Verificar que el usuario sigue activo
  if (!storedToken.user.isActive) {
    throw new AuthenticationError("Usuario desactivado");
  }

  // Eliminar el token usado (rotation)
  await prisma.refreshToken.delete({
    where: { id: storedToken.id },
  });

  // Crear auth user para nuevos tokens
  const authUser: AuthUser = {
    id: storedToken.user.id,
    email: storedToken.user.email,
    role: storedToken.user.role,
  };

  // Generar nuevos tokens
  const newAccessToken = await signAccessToken(authUser);
  const newRefreshTokenValue = generateUniqueToken();

  // Guardar nuevo refresh token
  await prisma.refreshToken.create({
    data: {
      token: newRefreshTokenValue,
      userId: storedToken.user.id,
      expiresAt: getRefreshTokenExpiryDate(),
    },
  });

  logger.debug("Tokens refreshed", { userId: storedToken.user.id });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshTokenValue,
  };
}

/**
 * Invalida un refresh token (logout)
 */
export async function logout(refreshTokenValue: string): Promise<void> {
  // Eliminar el token si existe
  const result = await prisma.refreshToken.deleteMany({
    where: { token: refreshTokenValue },
  });

  if (result.count > 0) {
    logger.debug("User logged out - token invalidated");
  }
}

/**
 * Invalida todos los refresh tokens de un usuario (logout de todas las sesiones)
 */
export async function logoutAll(userId: string): Promise<number> {
  const result = await prisma.refreshToken.deleteMany({
    where: { userId },
  });

  logger.info("All sessions invalidated", { userId, count: result.count });
  
  return result.count;
}

/**
 * Obtiene el usuario actual por ID
 */
export async function getCurrentUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
    },
  });

  if (!user || !user.isActive) {
    return null;
  }

  return user;
}

/**
 * Limpia tokens expirados de la BD (para cron job)
 */
export async function cleanupExpiredTokens(): Promise<number> {
  const result = await prisma.refreshToken.deleteMany({
    where: {
      expiresAt: { lt: new Date() },
    },
  });

  if (result.count > 0) {
    logger.info("Cleaned up expired refresh tokens", { count: result.count });
  }

  return result.count;
}
