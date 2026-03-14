-- Drop existing unique constraint (tourId, departureDate, startTime)
ALTER TABLE "TourDeparture" DROP CONSTRAINT IF EXISTS "TourDeparture_tourId_departureDate_startTime_key";

-- Remove duplicate rows: keep one row per (tourId, departureDate), the one with smallest id
DELETE FROM "TourDeparture" a
USING "TourDeparture" b
WHERE a."tourId" = b."tourId"
  AND a."departureDate" = b."departureDate"
  AND a.id > b.id;

-- Drop time columns (horario único por tour)
ALTER TABLE "TourDeparture" DROP COLUMN IF EXISTS "startTime";
ALTER TABLE "TourDeparture" DROP COLUMN IF EXISTS "endTime";

-- One departure per tour per day
ALTER TABLE "TourDeparture" ADD CONSTRAINT "TourDeparture_tourId_departureDate_key" UNIQUE ("tourId", "departureDate");
