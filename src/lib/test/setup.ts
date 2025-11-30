/**
 * Setup de tests con Vitest
 */

import { beforeAll, afterAll, beforeEach, afterEach } from "vitest";
import { prisma } from "../db";

/**
 * Limpiar base de datos antes de cada test
 */
beforeEach(async () => {
  // En un entorno de test real, aquí limpiarías las tablas
  // Por ahora, solo verificamos conexión
  await prisma.$connect();
});

/**
 * Desconectar Prisma después de cada test
 */
afterEach(async () => {
  await prisma.$disconnect();
});

/**
 * Setup global antes de todos los tests
 */
beforeAll(async () => {
  // Configuración global si es necesaria
});

/**
 * Cleanup global después de todos los tests
 */
afterAll(async () => {
  await prisma.$disconnect();
});

