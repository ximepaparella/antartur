-- Drop existing unique constraint (tourId, departureDate, startTime)
ALTER TABLE "TourDeparture" DROP CONSTRAINT IF EXISTS "TourDeparture_tourId_departureDate_startTime_key";

-- Point any Booking that references a duplicate departure to the kept row (MIN id per tourId, departureDate)
UPDATE "Booking" b
SET "tourDepartureId" = k.kept_id
FROM (
  SELECT t.id AS dup_id, MIN(t.id) OVER (PARTITION BY t."tourId", t."departureDate") AS kept_id
  FROM "TourDeparture" t
) k
WHERE b."tourDepartureId" = k.dup_id
  AND b."tourDepartureId" != k.kept_id;

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
