/**
 * Endpoint de prueba para verificar configuración SMTP y envío de emails
 * Solo disponible en desarrollo
 */

import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/modules/notifications/domain/emailService";
import { logger } from "@/lib/services/logger";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  // Solo permitir en desarrollo
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "This endpoint is only available in development" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { to, subject, html, text } = body;

    if (!to || !subject) {
      return NextResponse.json(
        { error: "Missing required fields: to, subject" },
        { status: 400 }
      );
    }

    // Verificar configuración SMTP
    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    // Soportar tanto SMTP_PASSWORD como SMTP_PASS para compatibilidad
    const smtpPass = process.env.SMTP_PASSWORD || process.env.SMTP_PASS;
    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_APP_PASSWORD;

    const config = {
      smtp: {
        host: smtpHost || "NOT SET",
        port: process.env.SMTP_PORT || "NOT SET",
        user: smtpUser ? "SET" : "NOT SET",
        password: smtpPass ? "SET" : "NOT SET",
        from: process.env.SMTP_FROM || "NOT SET",
        // Debug info (sin exponer contraseñas)
        passwordEnvVar: process.env.SMTP_PASSWORD ? "SMTP_PASSWORD" : (process.env.SMTP_PASS ? "SMTP_PASS" : "NOT SET"),
      },
      gmail: {
        user: gmailUser ? "SET" : "NOT SET",
        password: gmailPass ? "SET" : "NOT SET",
      },
      dryRun: process.env.NOTIFICATION_DRY_RUN === "true",
    };

    logger.info("Testing email configuration", config);

    // Intentar enviar email
    await sendEmail({
      to,
      subject,
      html: html || text || "<p>Test email</p>",
      text: text || "Test email",
    });

    return NextResponse.json({
      success: true,
      message: "Email sent successfully",
      config,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error("Error testing email", { error });

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        config: {
          smtp: {
            host: process.env.SMTP_HOST || "NOT SET",
            port: process.env.SMTP_PORT || "NOT SET",
            user: process.env.SMTP_USER ? "SET" : "NOT SET",
            password: (process.env.SMTP_PASSWORD || process.env.SMTP_PASS) ? "SET" : "NOT SET",
            passwordEnvVar: process.env.SMTP_PASSWORD ? "SMTP_PASSWORD" : (process.env.SMTP_PASS ? "SMTP_PASS" : "NOT SET"),
          },
          gmail: {
            user: process.env.GMAIL_USER ? "SET" : "NOT SET",
            password: process.env.GMAIL_APP_PASSWORD ? "SET" : "NOT SET",
          },
        },
      },
      { status: 500 }
    );
  }
}

