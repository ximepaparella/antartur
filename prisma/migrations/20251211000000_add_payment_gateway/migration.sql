-- CreateTable
CREATE TABLE "PaymentGateway" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "isSandbox" BOOLEAN NOT NULL DEFAULT true,
    "displayName" TEXT NOT NULL,
    "currency" VARCHAR(3) NOT NULL,
    "config" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentGateway_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PaymentGateway_provider_key" ON "PaymentGateway"("provider");

-- CreateIndex
CREATE INDEX "PaymentGateway_provider_idx" ON "PaymentGateway"("provider");

-- CreateIndex
CREATE INDEX "PaymentGateway_isActive_idx" ON "PaymentGateway"("isActive");
