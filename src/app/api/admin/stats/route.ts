/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Obtener estadísticas generales
 *     tags: [Admin]
 *     description: Endpoint para obtener estadísticas administrativas del sistema
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalOrders:
 *                       type: number
 *                     totalRevenue:
 *                       type: number
 *                     pendingOrders:
 *                       type: number
 *                     completedOrders:
 *                       type: number
 */

import { adminHandler } from "@/modules/orders/api/handlers/adminHandler";

export const GET = adminHandler.getStats;

