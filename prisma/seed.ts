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

  // 2. Crear tipos de cambio iniciales
  console.log("Creating currency rates...");

  // Tipo de cambio ARS/USD (ejemplo: 1000 ARS = 1 USD)
  // Ajustar según el tipo de cambio real cuando se implemente
  const arsToUsdRate = await prisma.currencyRate.upsert({
    where: {
      id: "seed-ars-usd-1",
    },
    update: {},
    create: {
      baseCurrency: "ARS",
      quoteCurrency: "USD",
      rate: 1000.0, // 1 USD = 1000 ARS (ejemplo)
      source: "seed",
      validFrom: new Date(),
    },
  });

  // Tipo de cambio USD/ARS (inverso)
  const usdToArsRate = await prisma.currencyRate.upsert({
    where: {
      id: "seed-usd-ars-1",
    },
    update: {},
    create: {
      baseCurrency: "USD",
      quoteCurrency: "ARS",
      rate: 0.001, // 1 ARS = 0.001 USD
      source: "seed",
      validFrom: new Date(),
    },
  });

  console.log("✅ Currency rates created");

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

