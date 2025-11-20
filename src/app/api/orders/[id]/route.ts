/**
 * API Route: Order por ID
 * GET /api/orders/:id - Obtener orden por ID
 */

import { ordersHandler } from "@/modules/orders/api/handlers/ordersHandler";

export const GET = ordersHandler.getById;

