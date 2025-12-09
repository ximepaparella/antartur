-- AlterTable
ALTER TABLE "Tour" ADD COLUMN "mondayAvailable" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "tuesdayAvailable" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "wednesdayAvailable" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "thursdayAvailable" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "fridayAvailable" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "saturdayAvailable" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "sundayAvailable" BOOLEAN NOT NULL DEFAULT true;

