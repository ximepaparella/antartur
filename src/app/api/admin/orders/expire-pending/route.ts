/**
 * @swagger
 * /api/admin/orders/expire-pending:
 *   post:
 *     summary: Expirar órdenes pendientes (cron job)
 *     tags: [Admin]
 *     description: Endpoint para expirar automáticamente órdenes pendientes que han excedido su tiempo de expiración. Debe ser llamado por un cron job.
 *     responses:
 *       200:
 *         description: Proceso completado exitosamente
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
 *                     expiredCount:
 *                       type: number
 *                     message:
 *                       type: string
 */

import { adminHandler } from "@/modules/orders/api/handlers/adminHandler";

export const POST = adminHandler.expirePendingOrders;

