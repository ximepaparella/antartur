/**
 * API Route: Payments por Order
 * GET /api/payments/order/:orderId - Obtener payments de una orden
 */

import { paymentsHandler } from "@/modules/payments/api/handlers/paymentsHandler";

export const GET = paymentsHandler.getByOrderId;

