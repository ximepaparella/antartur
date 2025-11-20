/**
 * Script de migración de datos para TourPrice
 * Convierte precios existentes de Tour a TourPrice (asumiendo ARS)
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function migrateTourPrices() {
  console.log("🔄 Iniciando migración de precios...");

  try {
    // Obtener todos los tours con precios existentes
    const tours = await prisma.$queryRaw<Array<{
      id: string;
      baseCurrency: string;
      basePriceAdult: number;
      basePriceChild: number;
    }>>`
      SELECT id, "baseCurrency", "basePriceAdult", "basePriceChild"
      FROM "Tour"
      WHERE "baseCurrency" IS NOT NULL
        AND "basePriceAdult" IS NOT NULL
        AND "basePriceChild" IS NOT NULL
    `;

    console.log(`📊 Encontrados ${tours.length} tours con precios`);

    let migrated = 0;
    let skipped = 0;

    for (const tour of tours) {
      // Verificar si ya existe un precio para este tour y moneda
      const existingPrice = await prisma.tourPrice.findFirst({
        where: {
          tourId: tour.id,
          currency: tour.baseCurrency,
        },
      });

      if (existingPrice) {
        console.log(`⏭️  Tour ${tour.id} ya tiene precio en ${tour.baseCurrency}, saltando...`);
        skipped++;
        continue;
      }

      // Crear TourPrice
      await prisma.tourPrice.create({
        data: {
          tourId: tour.id,
          currency: tour.baseCurrency,
          priceAdult: tour.basePriceAdult,
          priceChild: tour.basePriceChild,
        },
      });

      migrated++;
      console.log(`✅ Migrado tour ${tour.id} - ${tour.baseCurrency}: Adulto ${tour.basePriceAdult}, Niño ${tour.basePriceChild}`);
    }

    console.log(`\n✅ Migración completada:`);
    console.log(`   - Migrados: ${migrated}`);
    console.log(`   - Saltados: ${skipped}`);
    console.log(`   - Total: ${tours.length}`);
  } catch (error) {
    console.error("❌ Error durante la migración:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migrateTourPrices()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

