/**
 * API Route: Payments
 * POST /api/payments - Crear registro de pago (admin)
 */

import { paymentsHandler } from "@/modules/payments/api/handlers/paymentsHandler";

export const POST = paymentsHandler.create;

