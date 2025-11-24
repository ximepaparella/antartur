/**
 * Servicio de email reutilizable
 * Reutiliza la configuración de nodemailer del formulario de contacto
 */

import nodemailer from "nodemailer";

/**
 * Crea el transporter de nodemailer usando la configuración de variables de entorno
 */
function createTransporter() {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASSWORD;
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
}

/**
 * Envía un email usando la configuración del sistema
 */
export async function sendEmail(options: SendEmailOptions): Promise<void> {
  const transporter = createTransporter();
  const fromEmail = process.env.SMTP_FROM || process.env.GMAIL_USER || "agencias@antartur.tur.ar";

  if (!transporter) {
    // Modo desarrollo: solo loguear
    if (process.env.NODE_ENV === "development") {
      console.warn("⚠️  Email no enviado - Modo desarrollo sin configuración SMTP");
      console.warn(`Para: ${Array.isArray(options.to) ? options.to.join(", ") : options.to}`);
      console.warn(`Asunto: ${options.subject}`);
      console.warn(`HTML: ${options.html.substring(0, 200)}...`);
    }
    return;
  }

  await transporter.sendMail({
    from: fromEmail,
    to: Array.isArray(options.to) ? options.to.join(", ") : options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
    replyTo: options.replyTo,
  });
}

/**
 * Obtiene la URL base del sitio para usar en emails
 * Re-exporta desde utils para mantener compatibilidad
 */
export { getSiteUrl } from "../utils/siteUrl";

