/**
 * Módulo de autenticación
 * Exports centralizados para uso en la aplicación
 */

// Types
export type {
  JWTPayload,
  AuthUser,
  LoginResponse,
  RefreshResponse,
  LoginInput,
  AuthMiddlewareOptions,
  UserRole,
} from "./types";

// Password utilities
export { hashPassword, verifyPassword } from "./password";

// JWT utilities
export {
  signAccessToken,
  signRefreshToken,
  verifyToken,
  getRefreshTokenExpiryDate,
} from "./jwt";
export type { TokenVerificationResult } from "./jwt";

// Middleware
export { withAuth, getAuthUser, getUserFromRequest } from "./middleware";
