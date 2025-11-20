/**
 * Prisma Client para tests
 * Puede usar una base de datos de test separada
 */

import { PrismaClient } from "@prisma/client";

const testDatabaseUrl = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;

export const testPrisma = new PrismaClient({
  datasources: {
    db: {
      url: testDatabaseUrl,
    },
  },
  log: process.env.NODE_ENV === "test" ? [] : ["error"],
});

