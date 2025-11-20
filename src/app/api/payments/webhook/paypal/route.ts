/**
 * API Route: PayPal Webhook
 * POST /api/payments/webhook/paypal - Webhook de PayPal
 */

import { paymentsHandler } from "@/modules/payments/api/handlers/paymentsHandler";

export const POST = paymentsHandler.paypalWebhook;

