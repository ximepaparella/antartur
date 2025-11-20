/**
 * Seed script para datos iniciales de la base de datos
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // 1. Crear monedas
  console.log("Creating currencies...");
  
  const ars = await prisma.currency.upsert({
    where: { code: "ARS" },
    update: {},
    create: {
      code: "ARS",
      name: "Peso Argentino",
      symbol: "$",
      isDefault: true,
    },
  });

  const usd = await prisma.currency.upsert({
    where: { code: "USD" },
    update: {},
    create: {
      code: "USD",
      name: "Dólar Estadounidense",
      symbol: "US$",
      isDefault: false,
    },
  });

  const eur = await prisma.currency.upsert({
    where: { code: "EUR" },
    update: {},
    create: {
      code: "EUR",
      name: "Euro",
      symbol: "€",
      isDefault: false,
    },
  });

  console.log("✅ Currencies created:", { ars: ars.code, usd: usd.code, eur: eur.code });

  // Nota: Ya no se crean tipos de cambio (CurrencyRate) porque cada tour
  // tiene precios individuales por moneda en la tabla TourPrice

  console.log("✅ Seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

