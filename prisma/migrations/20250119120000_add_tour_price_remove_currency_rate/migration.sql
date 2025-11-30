-- CreateTable
CREATE TABLE "TourPrice" (
    "id" TEXT NOT NULL,
    "tourId" TEXT NOT NULL,
    "currency" VARCHAR(3) NOT NULL,
    "priceAdult" DECIMAL(10,2) NOT NULL,
    "priceChild" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TourPrice_pkey" PRIMARY KEY ("id")
);

-- Migrate existing prices to TourPrice (assuming ARS)
INSERT INTO "TourPrice" ("id", "tourId", "currency", "priceAdult", "priceChild", "createdAt", "updatedAt")
SELECT 
    gen_random_uuid()::text as "id",
    "id" as "tourId",
    "baseCurrency" as "currency",
    "basePriceAdult" as "priceAdult",
    "basePriceChild" as "priceChild",
    NOW() as "createdAt",
    NOW() as "updatedAt"
FROM "Tour"
WHERE "baseCurrency" IS NOT NULL AND "basePriceAdult" IS NOT NULL AND "basePriceChild" IS NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "TourPrice_tourId_currency_key" ON "TourPrice"("tourId", "currency");

-- CreateIndex
CREATE INDEX "TourPrice_tourId_idx" ON "TourPrice"("tourId");

-- CreateIndex
CREATE INDEX "TourPrice_currency_idx" ON "TourPrice"("currency");

-- AddForeignKey
ALTER TABLE "TourPrice" ADD CONSTRAINT "TourPrice_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "Tour"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TourPrice" ADD CONSTRAINT "TourPrice_currency_fkey" FOREIGN KEY ("currency") REFERENCES "Currency"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- DropForeignKey
ALTER TABLE "Tour" DROP CONSTRAINT IF EXISTS "Tour_baseCurrency_fkey";

-- DropIndex
DROP INDEX IF EXISTS "Tour_baseCurrency_idx";

-- AlterTable
ALTER TABLE "Tour" DROP COLUMN "baseCurrency",
DROP COLUMN "basePriceAdult",
DROP COLUMN "basePriceChild";

-- DropTable
DROP TABLE IF EXISTS "CurrencyRate";

-- Update Currency model relations (remove old relations)
-- Note: This is handled by Prisma schema changes

