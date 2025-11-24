/**
 * Singleton de Prisma Client para uso en toda la aplicación
 * Previene múltiples instancias en desarrollo con hot-reload
 * 
 * IMPORTANTE: Prisma Client se crea de forma lazy para evitar conexiones
 * durante el build o cuando la DB no está disponible.
 */

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    // Evitar conexión automática durante inicialización
    // La conexión se establecerá cuando se ejecute la primera query
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
}

export const prisma: PrismaClient =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// No hacer conexión automática - Prisma se conectará cuando se ejecute la primera query
