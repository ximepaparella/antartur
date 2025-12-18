/**
 * Seed script para datos iniciales de la base de datos
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/** Número de rondas de salt para bcrypt */
const SALT_ROUNDS = 12;

/**
 * Genera un hash seguro de una contraseña
 */
async function hashPassword(plainPassword: string): Promise<string> {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

async function main() {
  console.log("🌱 Seeding database...");

  // 1. Crear monedas
  console.log("Creating currencies...");
  
  // Ensure only one currency is default: first, set all existing currencies to false
  await prisma.currency.updateMany({
    where: { isDefault: true },
    data: { isDefault: false },
  });
  
  const ars = await prisma.currency.upsert({
    where: { code: "ARS" },
    update: {
      isDefault: true, // Ensure ARS is set as default
    },
    create: {
      code: "ARS",
      name: "Peso Argentino",
      symbol: "$",
      isDefault: true,
    },
  });

  const usd = await prisma.currency.upsert({
    where: { code: "USD" },
    update: {
      isDefault: false, // Explicitly set to false
    },
    create: {
      code: "USD",
      name: "Dólar Estadounidense",
      symbol: "US$",
      isDefault: false,
    },
  });

  const eur = await prisma.currency.upsert({
    where: { code: "EUR" },
    update: {
      isDefault: false, // Explicitly set to false
    },
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

  // 2. Crear Payment Gateways
  console.log("Creating payment gateways...");

  const paypal = await prisma.paymentGateway.upsert({
    where: { provider: "PAYPAL" },
    update: {},
    create: {
      provider: "PAYPAL",
      displayName: "PayPal",
      currency: "USD",
      isActive: false,
      isSandbox: true,
      config: {
        description: "Pagos en dólares vía PayPal",
      },
    },
  });

  const payway = await prisma.paymentGateway.upsert({
    where: { provider: "PAYWAY" },
    update: {},
    create: {
      provider: "PAYWAY",
      displayName: "Payway",
      currency: "ARS",
      isActive: false,
      isSandbox: true,
      config: {
        description: "Pagos en pesos vía Payway (Tarjetas de crédito/débito)",
      },
    },
  });

  console.log("✅ Payment gateways created:", { paypal: paypal.provider, payway: payway.provider });

  // 3. Crear configuración de transferencia bancaria
  console.log("Creating bank transfer configuration...");

  const bankTransfer = await prisma.bankTransfer.upsert({
    where: { id: "default" },
    update: {
      alias: "NUNATAK.SAS",
      cbu: "0070346620000005303580",
      cuit: "30-71678173-5",
    },
    create: {
      id: "default",
      isActive: false,
      accountName: "NUNATAK S.A.S.",
      accountNumber: "",
      bank: "",
      cuit: "30-71678173-5",
      cbu: "0070346620000005303580",
      alias: "NUNATAK.SAS",
    },
  });

  console.log("✅ Bank transfer configuration created");

  // 4. Crear usuario administrador
  console.log("Creating admin user...");

  const adminPasswordHash = await hashPassword("admin123");
  
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@antartur.com" },
    update: {
      // Actualizar password si el usuario ya existe
      passwordHash: adminPasswordHash,
    },
    create: {
      email: "admin@antartur.com",
      passwordHash: adminPasswordHash,
      name: "Administrador",
      role: "ADMIN",
      isActive: true,
    },
  });

  console.log("✅ Admin user created:", { id: adminUser.id, email: adminUser.email });

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

