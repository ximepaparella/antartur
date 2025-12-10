-- CreateTable
CREATE TABLE "TourRestriction" (
    "id" TEXT NOT NULL,
    "tourId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TourRestriction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TourRestriction_tourId_idx" ON "TourRestriction"("tourId");

-- CreateIndex
CREATE INDEX "TourRestriction_tourId_sortOrder_idx" ON "TourRestriction"("tourId", "sortOrder");

-- AddForeignKey
ALTER TABLE "TourRestriction" ADD CONSTRAINT "TourRestriction_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "Tour"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Migrate existing restrictionText to TourRestriction
-- Solo migrar si restrictionText no está vacío
INSERT INTO "TourRestriction" ("id", "tourId", "text", "sortOrder", "createdAt", "updatedAt")
SELECT 
    gen_random_uuid()::text as "id",
    "id" as "tourId",
    "restrictionText" as "text",
    0 as "sortOrder",
    NOW() as "createdAt",
    NOW() as "updatedAt"
FROM "Tour"
WHERE "restrictionText" IS NOT NULL 
  AND "restrictionText" != ''
  AND TRIM("restrictionText") != '';
