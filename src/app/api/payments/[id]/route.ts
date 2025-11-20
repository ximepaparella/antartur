/**
 * API Route: Payment por ID
 * GET /api/payments/:id - Obtener payment por ID
 */

import { paymentsHandler } from "@/modules/payments/api/handlers/paymentsHandler";

export const GET = paymentsHandler.getById;

