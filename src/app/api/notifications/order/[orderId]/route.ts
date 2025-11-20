/**
 * API Route: Notifications por Order
 * GET /api/notifications/order/:orderId - Obtener notifications de una orden
 */

import { notificationsHandler } from "@/modules/notifications/api/handlers/notificationsHandler";

export const GET = notificationsHandler.getByOrderId;

