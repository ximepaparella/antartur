-- CreateEnum
CREATE TYPE "ChildPriceType" AS ENUM ('FULL_CHILD_PRICE', 'HALF_ADULT_PRICE', 'ADULT_PRICE');

-- AlterTable: Add new fields to Tour
ALTER TABLE "Tour" ADD COLUMN "minAge" INTEGER,
ADD COLUMN "minPassengers" INTEGER;

-- AlterTable: Add new fields to TourPrice
ALTER TABLE "TourPrice" ADD COLUMN "priceInfantFree" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "childAgeRange" TEXT,
ADD COLUMN "childPriceType" "ChildPriceType" NOT NULL DEFAULT 'FULL_CHILD_PRICE',
ADD COLUMN "infantMaxAge" INTEGER NOT NULL DEFAULT 3;

-- CreateTable: TourAdditional
CREATE TABLE "TourAdditional" (
    "id" TEXT NOT NULL,
    "tourId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TourAdditional_pkey" PRIMARY KEY ("id")
);

-- CreateTable: TourAdditionalPrice
CREATE TABLE "TourAdditionalPrice" (
    "id" TEXT NOT NULL,
    "tourAdditionalId" TEXT NOT NULL,
    "currency" VARCHAR(3) NOT NULL,
    "priceAdult" DECIMAL(10,2) NOT NULL,
    "priceChild" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TourAdditionalPrice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TourAdditional_tourId_idx" ON "TourAdditional"("tourId");
CREATE INDEX "TourAdditional_tourId_isActive_idx" ON "TourAdditional"("tourId", "isActive");
CREATE INDEX "TourAdditional_sortOrder_idx" ON "TourAdditional"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "TourAdditionalPrice_tourAdditionalId_currency_key" ON "TourAdditionalPrice"("tourAdditionalId", "currency");
CREATE INDEX "TourAdditionalPrice_tourAdditionalId_idx" ON "TourAdditionalPrice"("tourAdditionalId");
CREATE INDEX "TourAdditionalPrice_currency_idx" ON "TourAdditionalPrice"("currency");

-- AddForeignKey
ALTER TABLE "TourAdditional" ADD CONSTRAINT "TourAdditional_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "Tour"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TourAdditionalPrice" ADD CONSTRAINT "TourAdditionalPrice_tourAdditionalId_fkey" FOREIGN KEY ("tourAdditionalId") REFERENCES "TourAdditional"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TourAdditionalPrice" ADD CONSTRAINT "TourAdditionalPrice_currency_fkey" FOREIGN KEY ("currency") REFERENCES "Currency"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

