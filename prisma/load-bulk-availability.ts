/**
 * Script para cargar disponibilidad masiva de tours
 * 
 * Tours de verano: 20 personas de Octubre 2025 a Mayo 2026
 * Tours de invierno: 20 personas de Mayo 2026 a Octubre 2026
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Genera todas las fechas entre dos fechas (inclusive)
 */
function generateDatesBetween(startDate: Date, endDate: Date): Date[] {
  const dates: Date[] = [];
  const current = new Date(startDate);
  
  while (current <= endDate) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  
  return dates;
}

/**
 * Normaliza el formato de hora a HH:mm
 */
function normalizeTime(time: string): string {
  // Si ya está en formato HH:mm, retornar
  if (/^\d{2}:\d{2}$/.test(time)) {
    return time;
  }
  
  // Intentar parsear otros formatos comunes
  const match = time.match(/(\d{1,2}):(\d{2})/);
  if (match) {
    const hours = match[1].padStart(2, "0");
    const minutes = match[2];
    return `${hours}:${minutes}`;
  }
  
  // Default: 09:00
  return "09:00";
}

async function main() {
  console.log("🌱 Iniciando carga masiva de disponibilidad...\n");

  // Fechas para tours de verano: Octubre 2025 a Mayo 2026
  const summerStartDate = new Date("2025-10-01");
  const summerEndDate = new Date("2026-05-31");
  
  // Fechas para tours de invierno: Mayo 2026 a Octubre 2026
  const winterStartDate = new Date("2026-05-01");
  const winterEndDate = new Date("2026-10-31");

  // Horario por defecto (puedes ajustar según necesites)
  const defaultStartTime = "09:00";
  const defaultEndTime = "17:00";
  const defaultSeats = 20;

  try {
    // Obtener todos los tours de verano activos
    const summerTours = await prisma.tour.findMany({
      where: {
        category: "summer",
        isActive: true,
      },
      select: {
        id: true,
        slug: true,
        name: true,
      },
    });

    console.log(`📅 Tours de verano encontrados: ${summerTours.length}`);
    
    // Obtener todos los tours de invierno activos
    const winterTours = await prisma.tour.findMany({
      where: {
        category: "winter",
        isActive: true,
      },
      select: {
        id: true,
        slug: true,
        name: true,
      },
    });

    console.log(`❄️  Tours de invierno encontrados: ${winterTours.length}\n`);

    // Generar fechas para verano
    const summerDates = generateDatesBetween(summerStartDate, summerEndDate);
    console.log(`📆 Fechas de verano: ${summerDates.length} días (${summerStartDate.toISOString().split('T')[0]} a ${summerEndDate.toISOString().split('T')[0]})`);

    // Generar fechas para invierno
    const winterDates = generateDatesBetween(winterStartDate, winterEndDate);
    console.log(`📆 Fechas de invierno: ${winterDates.length} días (${winterStartDate.toISOString().split('T')[0]} a ${winterEndDate.toISOString().split('T')[0]})\n`);

    let totalCreated = 0;
    let totalSkipped = 0;
    let totalErrors = 0;

    // Procesar tours de verano
    console.log("🌞 Procesando tours de verano...\n");
    for (const tour of summerTours) {
      try {
        // Obtener fechas existentes en el rango
        const existingDepartures = await prisma.tourDeparture.findMany({
          where: {
            tourId: tour.id,
            departureDate: {
              gte: summerStartDate,
              lte: summerEndDate,
            },
          },
          select: {
            departureDate: true,
          },
        });

        // Crear un Set de fechas existentes (formato YYYY-MM-DD)
        const existingDatesSet = new Set(
          existingDepartures.map(d => {
            const date = new Date(d.departureDate);
            return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
          })
        );

        // Filtrar fechas que no existen aún
        const datesToCreate = summerDates.filter(date => {
          const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
          return !existingDatesSet.has(dateStr);
        });

        if (datesToCreate.length === 0) {
          console.log(`⏭️  ${tour.name} ya tiene todas las fechas (${existingDepartures.length} departures), saltando...`);
          totalSkipped++;
          continue;
        }

        // Crear departures solo para fechas faltantes (horario viene del tour defaultStartTime/defaultEndTime)
        const departures = datesToCreate.map((date) => ({
          tourId: tour.id,
          departureDate: date,
          seatsTotal: defaultSeats,
          seatsHeld: 0,
          seatsConfirmed: 0,
          isActive: true,
        }));

        // Usar createMany para mejor performance
        await prisma.tourDeparture.createMany({
          data: departures,
          skipDuplicates: true,
        });

        console.log(`✅ ${tour.name}: ${departures.length} departures creados (${existingDepartures.length} ya existían)`);
        totalCreated += departures.length;
      } catch (error) {
        console.error(`❌ Error procesando ${tour.name}:`, error);
        totalErrors++;
      }
    }

    // Procesar tours de invierno
    console.log("\n❄️  Procesando tours de invierno...\n");
    for (const tour of winterTours) {
      try {
        // Obtener fechas existentes en el rango
        const existingDepartures = await prisma.tourDeparture.findMany({
          where: {
            tourId: tour.id,
            departureDate: {
              gte: winterStartDate,
              lte: winterEndDate,
            },
          },
          select: {
            departureDate: true,
          },
        });

        // Crear un Set de fechas existentes (formato YYYY-MM-DD)
        const existingDatesSet = new Set(
          existingDepartures.map(d => {
            const date = new Date(d.departureDate);
            return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
          })
        );

        // Filtrar fechas que no existen aún
        const datesToCreate = winterDates.filter(date => {
          const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
          return !existingDatesSet.has(dateStr);
        });

        if (datesToCreate.length === 0) {
          console.log(`⏭️  ${tour.name} ya tiene todas las fechas (${existingDepartures.length} departures), saltando...`);
          totalSkipped++;
          continue;
        }

        // Crear departures solo para fechas faltantes (horario viene del tour defaultStartTime/defaultEndTime)
        const departures = datesToCreate.map((date) => ({
          tourId: tour.id,
          departureDate: date,
          seatsTotal: defaultSeats,
          seatsHeld: 0,
          seatsConfirmed: 0,
          isActive: true,
        }));

        // Usar createMany para mejor performance
        await prisma.tourDeparture.createMany({
          data: departures,
          skipDuplicates: true,
        });

        console.log(`✅ ${tour.name}: ${departures.length} departures creados (${existingDepartures.length} ya existían)`);
        totalCreated += departures.length;
      } catch (error) {
        console.error(`❌ Error procesando ${tour.name}:`, error);
        totalErrors++;
      }
    }

    console.log("\n" + "=".repeat(50));
    console.log("📊 Resumen:");
    console.log(`   ✅ Total creados: ${totalCreated}`);
    console.log(`   ⏭️  Total saltados: ${totalSkipped}`);
    console.log(`   ❌ Total errores: ${totalErrors}`);
    console.log("=".repeat(50));
  } catch (error) {
    console.error("❌ Error fatal:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

