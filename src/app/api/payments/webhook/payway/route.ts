/**
 * API Route: Payway Webhook
 * POST /api/payments/webhook/payway - Webhook de Payway
 */

import { paymentsHandler } from "@/modules/payments/api/handlers/paymentsHandler";

export const POST = paymentsHandler.paywayWebhook;

