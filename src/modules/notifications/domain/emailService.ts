/**
 * Servicio de email reutilizable
 * Reutiliza la configuración de nodemailer del formulario de contacto
 * Integrado con NotificationService para tracking completo
 */

import nodemailer from "nodemailer";
import { logger } from "@/lib/services/logger";
import {
  createNotification,
  updateNotificationStatus,
} from "./notificationService";

/**
 * Crea el transporter de nodemailer usando la configuración de variables de entorno
 */
function createTransporter() {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
  const smtpUser = process.env.SMTP_USER;
  // Soportar tanto SMTP_PASSWORD como SMTP_PASS para compatibilidad
  const smtpPass = process.env.SMTP_PASSWORD || process.env.SMTP_PASS;
  const smtpFrom = process.env.SMTP_FROM || smtpUser;

  // Si hay configuración SMTP, usarla
  if (smtpHost && smtpUser && smtpPass) {
    return nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });
  }

  // Si hay configuración de Gmail, usarla
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }

  // Si no hay configuración, retornar null (modo desarrollo - solo loguear)
  return null;
}

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  // Parámetros opcionales para tracking
  orderId?: string;
  templateKey?: string;
}

/**
 * Valida que la configuración SMTP esté disponible
 */
function validateSMTPConfig(): void {
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  // Soportar tanto SMTP_PASSWORD como SMTP_PASS para compatibilidad
  const smtpPass = process.env.SMTP_PASSWORD || process.env.SMTP_PASS;
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;
  const dryRun = process.env.NOTIFICATION_DRY_RUN === "true";

  // Si está en modo dry-run, permitir continuar
  if (dryRun) {
    logger.info("Email service in dry-run mode - emails will not be sent");
    return;
  }

  // Verificar que haya configuración SMTP o Gmail
  const hasSMTP = smtpHost && smtpUser && smtpPass;
  const hasGmail = gmailUser && gmailPass;

  if (!hasSMTP && !hasGmail) {
    const error = new Error(
      "SMTP configuration not found. Please set SMTP_HOST, SMTP_USER, SMTP_PASSWORD (or SMTP_PASS) or GMAIL_USER, GMAIL_APP_PASSWORD environment variables."
    );
    logger.error("SMTP configuration missing", {
      smtpHost: smtpHost ? "SET" : "NOT SET",
      smtpUser: smtpUser ? "SET" : "NOT SET",
      smtpPass: smtpPass ? "SET" : "NOT SET",
      smtpPasswordEnv: process.env.SMTP_PASSWORD ? "SET" : "NOT SET",
      smtpPassEnv: process.env.SMTP_PASS ? "SET" : "NOT SET",
    });
    throw error;
  }
}

/**
 * Envía un email directamente sin crear registro de notificación
 * Usado para reintentos donde el registro ya existe
 */
export async function sendEmailDirect(options: Omit<SendEmailOptions, "orderId" | "templateKey">): Promise<void> {
  const dryRun = process.env.NOTIFICATION_DRY_RUN === "true";
  const transporter = createTransporter();
  const fromEmail = process.env.SMTP_FROM || process.env.GMAIL_USER || "agencias@antartur.tur.ar";

  // Validar configuración (excepto en dry-run)
  if (!dryRun) {
    validateSMTPConfig();
  }

  // En modo dry-run, solo loguear
  if (dryRun) {
    logger.info("Email not sent (dry-run mode)", {
      to: Array.isArray(options.to) ? options.to.join(", ") : options.to,
      subject: options.subject,
    });
    return;
  }

  // Si no hay transporter después de validar, lanzar error
  if (!transporter) {
    const errorMessage = "No SMTP transporter available. Email cannot be sent.";
    logger.error("Email sending failed - no transporter", {
      to: Array.isArray(options.to) ? options.to.join(", ") : options.to,
      subject: options.subject,
    });
    throw new Error(errorMessage);
  }

  // Enviar email real
  await transporter.sendMail({
    from: fromEmail,
    to: Array.isArray(options.to) ? options.to.join(", ") : options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
    replyTo: options.replyTo,
  });

  logger.info("Email sent successfully (direct)", {
    to: Array.isArray(options.to) ? options.to.join(", ") : options.to,
    subject: options.subject,
  });
}

/**
 * Envía un email usando la configuración del sistema
 * Crea registro de notificación antes de enviar y actualiza estado después
 * @returns notificationId si se creó registro, null si no
 */
export async function sendEmail(options: SendEmailOptions): Promise<string | null> {
  const dryRun = process.env.NOTIFICATION_DRY_RUN === "true";
  const transporter = createTransporter();
  const fromEmail = process.env.SMTP_FROM || process.env.GMAIL_USER || "agencias@antartur.tur.ar";

  // Validar configuración (excepto en dry-run)
  if (!dryRun) {
    validateSMTPConfig();
  }

  // Crear registro de notificación si se proporciona orderId y templateKey
  let notificationId: string | null = null;
  if (options.orderId && options.templateKey) {
    try {
      notificationId = await createNotification({
        orderId: options.orderId,
        type: "EMAIL",
        recipient: Array.isArray(options.to) ? options.to.join(", ") : options.to,
        templateKey: options.templateKey,
        subject: options.subject,
        body: options.text || options.html,
      });
    } catch (error) {
      logger.error("Error creating notification record", error);
      // Continuar con el envío aunque falle el registro
    }
  }

  // En modo dry-run, solo loguear y actualizar estado
  if (dryRun) {
    logger.info("Email not sent (dry-run mode)", {
      to: Array.isArray(options.to) ? options.to.join(", ") : options.to,
      subject: options.subject,
      notificationId,
    });

    if (notificationId) {
      try {
        await updateNotificationStatus({
          notificationId,
          status: "SENT",
          errorMessage: "Email sent in dry-run mode",
        });
      } catch (error) {
        logger.error("Error updating notification status", error);
      }
    }

    return notificationId;
  }

  // Si no hay transporter después de validar, lanzar error
  if (!transporter) {
    const errorMessage = "No SMTP transporter available. Email cannot be sent.";
    logger.error("Email sending failed - no transporter", {
      to: Array.isArray(options.to) ? options.to.join(", ") : options.to,
      subject: options.subject,
      notificationId,
    });

    if (notificationId) {
      try {
        await updateNotificationStatus({
          notificationId,
          status: "ERROR",
          errorMessage,
        });
      } catch (updateError) {
        logger.error("Error updating notification status to ERROR", updateError);
      }
    }

    throw new Error(errorMessage);
  }

  // Enviar email real
  try {
    await transporter.sendMail({
      from: fromEmail,
      to: Array.isArray(options.to) ? options.to.join(", ") : options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo,
    });

    logger.info("Email sent successfully", {
      to: Array.isArray(options.to) ? options.to.join(", ") : options.to,
      subject: options.subject,
      notificationId,
    });

    // Actualizar estado a SENT
    if (notificationId) {
      try {
        await updateNotificationStatus({
          notificationId,
          status: "SENT",
        });
      } catch (error) {
        logger.error("Error updating notification status to SENT", error);
      }
    }

    return notificationId;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error("Error sending email", {
      error,
      to: Array.isArray(options.to) ? options.to.join(", ") : options.to,
      subject: options.subject,
      notificationId,
    });

    // Actualizar estado a ERROR
    if (notificationId) {
      try {
        await updateNotificationStatus({
          notificationId,
          status: "ERROR",
          errorMessage,
        });
      } catch (updateError) {
        logger.error("Error updating notification status to ERROR", updateError);
      }
    }

    // Re-lanzar error para que el caller pueda manejarlo
    throw new Error(`Failed to send email: ${errorMessage}`);
  }
}

/**
 * Obtiene la URL base del sitio para usar en emails
 * Re-exporta desde utils para mantener compatibilidad
 */
export { getSiteUrl } from "../utils/siteUrl";

