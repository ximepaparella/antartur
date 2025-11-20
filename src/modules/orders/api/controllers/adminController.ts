/**
 * Controller para endpoints administrativos
 */

import { expirePendingOrders } from "../../domain/orderService";
import { prisma } from "@/lib/db";

export class AdminController {
  /**
   * Expirar órdenes pendientes
   * Endpoint para ser llamado por cron job
   */
  async expirePendingOrders() {
    const results = await expirePendingOrders();
    return {
      processed: results.length,
      expired: results.filter((r) => r.status === "expired").length,
      errors: results.filter((r) => r.status === "error").length,
      details: results,
    };
  }

  /**
   * Obtener estadísticas generales
   */
  async getStats() {
    const [
      totalTours,
      activeTours,
      totalOrders,
      pendingOrders,
      paidOrders,
      totalBookings,
      confirmedBookings,
      totalRevenue,
    ] = await Promise.all([
      prisma.tour.count(),
      prisma.tour.count({ where: { isActive: true } }),
      prisma.order.count(),
      prisma.order.count({ where: { status: "PENDING_PAYMENT" } }),
      prisma.order.count({ where: { status: "PAID" } }),
      prisma.booking.count(),
      prisma.booking.count({ where: { status: "CONFIRMED" } }),
      prisma.order.aggregate({
        where: { status: "PAID" },
        _sum: { totalAmount: true },
      }),
    ]);

    return {
      tours: {
        total: totalTours,
        active: activeTours,
      },
      orders: {
        total: totalOrders,
        pending: pendingOrders,
        paid: paidOrders,
      },
      bookings: {
        total: totalBookings,
        confirmed: confirmedBookings,
      },
      revenue: {
        total: Number(totalRevenue._sum.totalAmount || 0),
      },
    };
  }
}

