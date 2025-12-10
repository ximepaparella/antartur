/**
 * Script de migración de datos para convertir restrictionText a TourRestriction
 * 
 * Este script migra los datos existentes de restrictionText a la nueva tabla TourRestriction.
 * Se ejecuta después de aplicar la migración SQL.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔄 Iniciando migración de restrictionText a TourRestriction...");

  // Obtener todos los tours que tienen restrictionText
  const tours = await prisma.tour.findMany({
    where: {
      restrictionText: {
        not: "",
      },
    },
    select: {
      id: true,
      restrictionText: true,
    },
  });

  console.log(`📊 Encontrados ${tours.length} tours con restrictionText`);

  let migrated = 0;
  let skipped = 0;

  for (const tour of tours) {
    if (!tour.restrictionText || tour.restrictionText.trim() === "") {
      skipped++;
      continue;
    }

    // Verificar si ya existe una restricción para este tour
    const existingRestriction = await prisma.tourRestriction.findFirst({
      where: { tourId: tour.id },
    });

    if (existingRestriction) {
      console.log(`⏭️  Tour ${tour.id} ya tiene restricciones, saltando...`);
      skipped++;
      continue;
    }

    // Crear restricción desde restrictionText
    await prisma.tourRestriction.create({
      data: {
        tourId: tour.id,
        text: tour.restrictionText.trim(),
        sortOrder: 0,
      },
    });

    migrated++;
    console.log(`✅ Migrado tour ${tour.id}: "${tour.restrictionText.substring(0, 50)}..."`);
  }

  console.log(`\n✨ Migración completada:`);
  console.log(`   - Migrados: ${migrated}`);
  console.log(`   - Omitidos: ${skipped}`);
  console.log(`   - Total procesados: ${tours.length}`);
}

main()
  .catch((e) => {
    console.error("❌ Error en la migración:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
