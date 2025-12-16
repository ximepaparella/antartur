/**
 * Utilidades para hash y verificación de passwords
 * Usa bcryptjs (versión JS pura, compatible con Edge Runtime)
 */

import bcrypt from "bcryptjs";

/** Número de rondas de salt para bcrypt */
const SALT_ROUNDS = 12;

/**
 * Genera un hash seguro de una contraseña
 */
export async function hashPassword(plainPassword: string): Promise<string> {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

/**
 * Verifica una contraseña contra su hash
 */
export async function verifyPassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}
