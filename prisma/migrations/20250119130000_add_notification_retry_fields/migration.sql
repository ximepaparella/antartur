-- AlterTable
ALTER TABLE "Notification" ADD COLUMN "retryCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Notification" ADD COLUMN "maxRetries" INTEGER NOT NULL DEFAULT 5;
ALTER TABLE "Notification" ADD COLUMN "nextRetryAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Notification_status_nextRetryAt_idx" ON "Notification"("status", "nextRetryAt");

