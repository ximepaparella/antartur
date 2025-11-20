/**
 * API Route: Actualizar estado de Order
 * PUT /api/orders/:id/status - Actualizar estado de orden
 */

import { ordersHandler } from "@/modules/orders/api/handlers/ordersHandler";

export const PUT = ordersHandler.updateStatus;

