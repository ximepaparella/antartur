/**
 * API Route: Notification por ID
 * GET /api/notifications/:id - Obtener notification por ID
 */

import { notificationsHandler } from "@/modules/notifications/api/handlers/notificationsHandler";

export const GET = notificationsHandler.getById;

