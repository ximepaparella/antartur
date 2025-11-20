/**
 * API Route: Notifications
 * POST /api/notifications - Crear notification
 */

import { notificationsHandler } from "@/modules/notifications/api/handlers/notificationsHandler";

export const POST = notificationsHandler.create;

