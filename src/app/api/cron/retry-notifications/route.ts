/**
 * @swagger
 * /api/cron/retry-notifications:
 *   get:
 *     summary: Reintentar notificaciones fallidas (Cron Job)
 *     tags: [Cron Jobs]
 *     description: Reintenta automáticamente el envío de notificaciones que fallaron. Ejecutar cada 15 minutos. Requiere header Authorization Bearer con CRON_SECRET. Procesa hasta 100 notificaciones por ejecución.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notificaciones procesadas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: "Processed 10 notifications"
 *                 processed:
 *                   type: number
 *                   example: 10
 *                 successful:
 *                   type: number
 *                   example: 8
 *                 failed:
 *                   type: number
 *                   example: 2
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: No autorizado (CRON_SECRET inválido)
 *   post:
 *     summary: Reintentar notificaciones fallidas (método POST alternativo)
 *     tags: [Cron Jobs]
 *     description: Versión POST. Misma autenticación (Authorization Bearer CRON_SECRET).
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notificaciones procesadas exitosamente
 *       401:
 *         description: No autorizado
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getFailedNotifications,
  incrementRetryCount,
  updateNotificationStatus,
} from "@/modules/notifications/domain/notificationService";
import { sendEmail } from "@/modules/notifications/domain/emailService";
import { logger } from "@/lib/services/logger";
import { withRateLimitHandler } from "@/lib/middleware/rateLimiter";

export const dynamic = "force-dynamic";

/**
 * Verifica que la request viene de un cron job autorizado
 */
function isAuthorized(request: NextRequest): boolean {
  // Verificar header Authorization con Bearer token
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
    return true;
  }

  // En desarrollo sin CRON_SECRET configurado, permitir (solo para pruebas locales)
  if (process.env.NODE_ENV === "development" && !cronSecret) {
    return true;
  }

  return false;
}

/**
 * Reintenta enviar una notificación fallida
 */
async function retryNotification(notification: {
  id: string;
  recipient: string;
  subject: string | null;
  body: string | null;
  templateKey: string;
  orderId: string | null;
}): Promise<{ success: boolean; error?: string }> {
  try {
    // Incrementar contador de reintentos
    const { retryCount, canRetry } = await incrementRetryCount(notification.id);

    if (!canRetry) {
      logger.warn("Notification exceeded max retries", {
        notificationId: notification.id,
        retryCount,
      });
      return { success: false, error: "Max retries exceeded" };
    }

    // Reintentar envío
    if (!notification.subject || !notification.body) {
      throw new Error("Notification missing subject or body");
    }

    // Reintentar envío directamente sin crear nuevo registro
    const { sendEmailDirect } = await import("@/modules/notifications/domain/emailService");
    
    await sendEmailDirect({
      to: notification.recipient,
      subject: notification.subject,
      html: notification.body,
      text: notification.body,
    });

    // Actualizar estado a SENT manualmente
    await updateNotificationStatus({
      notificationId: notification.id,
      status: "SENT",
    });

    logger.info("Notification retry successful", {
      notificationId: notification.id,
      retryCount,
      recipient: notification.recipient,
    });

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Actualizar estado a ERROR con el nuevo mensaje
    try {
      await updateNotificationStatus({
        notificationId: notification.id,
        status: "ERROR",
        errorMessage: `Retry failed: ${errorMessage}`,
      });
    } catch (updateError) {
      logger.error("Error updating notification status after retry failure", updateError);
    }

    logger.error("Notification retry failed", {
      notificationId: notification.id,
      recipient: notification.recipient,
      error: errorMessage,
    });

    return { success: false, error: errorMessage };
  }
}

async function handleRetryNotifications(request: NextRequest) {
  // Verificar autorización
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    // Obtener notificaciones fallidas listas para reintento
    const failedNotifications = await getFailedNotifications();

    if (failedNotifications.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No notifications to retry",
        processed: 0,
        successful: 0,
        failed: 0,
        timestamp: new Date().toISOString(),
      });
    }

    logger.info("Starting notification retry process", {
      count: failedNotifications.length,
    });

    // Procesar cada notificación
    const results = await Promise.allSettled(
      failedNotifications.map((notification) => retryNotification(notification))
    );

    const successful = results.filter(
      (r) => r.status === "fulfilled" && r.value.success
    ).length;
    const failed = results.length - successful;

    logger.info("Notification retry process completed", {
      processed: results.length,
      successful,
      failed,
    });

    return NextResponse.json({
      success: true,
      message: `Processed ${results.length} notifications`,
      processed: results.length,
      successful,
      failed,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("Error in notification retry cron", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Wrapper con rate limiting
export const GET = withRateLimitHandler("admin", handleRetryNotifications);
// También permitir POST para compatibilidad con algunos sistemas de cron
export const POST = GET;
