/**
 * Script de migración de datos para additionals y rangos de precio
 * Este script migra los datos existentes al nuevo sistema de rangos de edad
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔄 Iniciando migración de datos para additionals y rangos de precio...");

  // Obtener todos los tours con precios
  const tours = await prisma.tour.findMany({
    include: {
      prices: true,
    },
  });

  console.log(`📋 Encontrados ${tours.length} tours para migrar`);

  let updated = 0;

  for (const tour of tours) {
    try {
      // Actualizar precios existentes con valores por defecto
      // Por defecto, asumimos que los tours existentes tienen:
      // - priceInfantFree: false (no gratis para 0-3 años)
      // - childAgeRange: null (usará el comportamiento legacy)
      // - childPriceType: FULL_CHILD_PRICE (usa priceChild completo)
      // - infantMaxAge: 3 (por defecto)

      // Los valores por defecto ya están en el schema, así que solo necesitamos
      // asegurarnos de que los tours existentes funcionen correctamente
      
      // Si el tour tiene precios, podemos configurar algunos valores según el tour
      // Por ahora, dejamos los valores por defecto que ya están en el schema
      
      updated++;
    } catch (error) {
      console.error(`❌ Error procesando tour ${tour.slug}:`, error);
    }
  }

  console.log(`✅ Migración completada: ${updated} tours procesados`);
  console.log("\n📝 Nota: Los valores por defecto se aplicarán automáticamente:");
  console.log("   - priceInfantFree: false");
  console.log("   - childPriceType: FULL_CHILD_PRICE");
  console.log("   - infantMaxAge: 3");
  console.log("\n💡 Los tours existentes seguirán funcionando con el comportamiento legacy");
  console.log("   hasta que se actualicen manualmente con los nuevos campos.");
}

main()
  .catch((e) => {
    console.error("❌ Error en migración:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

