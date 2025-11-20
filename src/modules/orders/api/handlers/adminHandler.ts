/**
 * HTTP Handlers para endpoints administrativos
 */

import { NextRequest } from "next/server";
import { AdminController } from "../controllers/adminController";
import { successResponse } from "@/lib/api/response";
import { withErrorHandler } from "@/lib/api/errorHandler";

const controller = new AdminController();

export const adminHandler = {
  /**
   * POST /api/admin/orders/expire-pending - Expirar órdenes pendientes
   */
  expirePendingOrders: withErrorHandler(async (request: NextRequest) => {
    const result = await controller.expirePendingOrders();
    return successResponse(result);
  }),

  /**
   * GET /api/admin/stats - Obtener estadísticas generales
   */
  getStats: withErrorHandler(async (request: NextRequest) => {
    const stats = await controller.getStats();
    return successResponse(stats);
  }),
};

