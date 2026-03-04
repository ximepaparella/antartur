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
  // Durante el build de Next.js (page data collection) DATABASE_URL puede no estar definida.
  // Prisma requiere una URL válida en el constructor; usamos un placeholder solo para el build.
  const url =
    process.env.DATABASE_URL || "postgresql://dummy:dummy@localhost:5432/dummy";
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    datasources: {
      db: { url },
    },
  });
}

export const prisma: PrismaClient =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// No hacer conexión automática - Prisma se conectará cuando se ejecute la primera query
