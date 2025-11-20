/**
 * API Route: Expirar órdenes pendientes
 * POST /api/admin/orders/expire-pending - Expirar órdenes pendientes (cron job)
 */

import { adminHandler } from "@/modules/orders/api/handlers/adminHandler";

export const POST = adminHandler.expirePendingOrders;

