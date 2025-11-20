/**
 * API Route: Orders
 * GET /api/orders - Listar órdenes
 * POST /api/orders - Crear orden/reserva
 */

import { ordersHandler } from "@/modules/orders/api/handlers/ordersHandler";

export const GET = ordersHandler.list;
export const POST = ordersHandler.create;

