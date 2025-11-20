/**
 * API Route: Order por código
 * GET /api/orders/code/:code - Obtener orden por código
 */

import { ordersHandler } from "@/modules/orders/api/handlers/ordersHandler";

export const GET = ordersHandler.getByCode;

