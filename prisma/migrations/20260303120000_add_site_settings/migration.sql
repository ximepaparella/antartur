-- CreateEnum
CREATE TYPE "HomePrimarySeason" AS ENUM ('SUMMER', 'WINTER', 'AUTO');

-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "homePrimarySeason" "HomePrimarySeason" NOT NULL DEFAULT 'SUMMER',

    -- Analytics (opcionalmente pueden sobreescribir los valores de entorno)
    "gtmId" TEXT,
    "ga4Id" TEXT,

    -- Datos de contacto
    "phone" TEXT,
    "whatsappNumber" TEXT,
    "email" TEXT,
    "address" TEXT,
    "city" TEXT,
    "country" TEXT,

    -- Redes sociales
    "facebookUrl" TEXT,
    "instagramUrl" TEXT,
    "whatsappUrl" TEXT,

    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

