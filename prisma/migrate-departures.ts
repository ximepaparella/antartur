/**
 * Script de migración de disponibilidad (departures) desde JSON mockup a base de datos
 * Crea TourDeparture records desde booking.availability de tourExample.json
 */

import { PrismaClient } from "@prisma/client";
// Este archivo fue eliminado después de migrar a la base de datos
// Si necesitas ejecutar este script nuevamente, restaura el archivo JSON primero
// import tourExampleJson from "../src/modules/tours/components/ToursGrid/tourExample.json";
import type { Tour as MockupTour } from "../src/modules/tours/types/tourTypes";

const prisma = new PrismaClient();

/**
 * Normaliza formato de hora de "9:00 am" a "09:00"
 */
function normalizeTime(time: string): string {
  if (!time) return "09:00";

  // Remover espacios y convertir a minúsculas
  const cleaned = time.trim().toLowerCase();

  // Si ya está en formato HH:mm, retornar
  if (/^\d{2}:\d{2}$/.test(cleaned)) {
    return cleaned;
  }

  // Parsear formato "9:00 am" o "9:00am"
  const match = cleaned.match(/(\d{1,2}):(\d{2})\s*(am|pm)?/);
  if (!match) return "09:00";

  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const period = match[3];

  if (period === "pm" && hours !== 12) {
    hours += 12;
  } else if (period === "am" && hours === 12) {
    hours = 0;
  }

  return `${hours.toString().padStart(2, "0")}:${minutes}`;
}

/**
 * Genera fechas futuras desde hoy hasta 3 meses adelante
 */
function generateFutureDates(startDate: Date, count: number): Date[] {
  const dates: Date[] = [];
  const current = new Date(startDate);

  for (let i = 0; i < count; i++) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

async function main() {
  console.log("🌱 Iniciando migración de disponibilidad (departures)...");

  // const toursFullData = tourExampleJson as Record<string, MockupTour>;
  const toursFullData = {} as Record<string, MockupTour>; // Empty - migration already completed
  const today = new Date();
  const futureDates = generateFutureDates(today, 90); // Próximos 3 meses

  let migrated = 0;
  let skipped = 0;
  let errors = 0;

  for (const [tourId, fullTour] of Object.entries(toursFullData)) {
    try {
      // Buscar tour en DB por slug
      const tour = await prisma.tour.findUnique({
        where: { slug: tourId },
      });

      if (!tour) {
        console.log(`⏭️  Tour ${tourId} no encontrado en DB, saltando...`);
        skipped++;
        continue;
      }

      // Verificar si ya tiene departures
      const existingDepartures = await prisma.tourDeparture.count({
        where: { tourId: tour.id },
      });

      if (existingDepartures > 0) {
        console.log(`⏭️  Tour ${tourId} ya tiene ${existingDepartures} departures, saltando...`);
        skipped++;
        continue;
      }

      const availability = fullTour.booking?.availability;
      if (!availability || availability.length === 0) {
        console.log(`⏭️  Tour ${tourId} no tiene disponibilidad en mockup, saltando...`);
        skipped++;
        continue;
      }

      // Obtener el primer item de availability para obtener el patrón de horarios
      const firstAvailability = availability[0];
      const startTime = normalizeTime(firstAvailability.timeSlot.start);
      const endTime = firstAvailability.timeSlot.end
        ? normalizeTime(firstAvailability.timeSlot.end)
        : null;
      const seatsTotal = firstAvailability.available || 20; // Default 20 si no está especificado

      // Crear departures para las fechas futuras
      const departuresToCreate = futureDates.map((date) => ({
        tourId: tour.id,
        departureDate: date,
        startTime,
        endTime,
        seatsTotal,
        seatsHeld: 0,
        seatsConfirmed: 0,
        isActive: true,
      }));

      await prisma.tourDeparture.createMany({
        data: departuresToCreate,
      });

      migrated += departuresToCreate.length;
      console.log(
        `✅ Creados ${departuresToCreate.length} departures para tour: ${tourId} (${tour.name})`
      );
    } catch (error) {
      errors++;
      console.error(`❌ Error migrando departures para tour ${tourId}:`, error);
    }
  }

  console.log("\n📊 Resumen de migración:");
  console.log(`✅ Departures creados: ${migrated}`);
  console.log(`⏭️  Tours saltados: ${skipped}`);
  console.log(`❌ Errores: ${errors}`);
}

main()
  .catch((e) => {
    console.error("❌ Error en migración:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

