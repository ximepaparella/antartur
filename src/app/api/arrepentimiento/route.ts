import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { RateLimiterMemory } from "rate-limiter-flexible";

const rateLimiter = new RateLimiterMemory({
  points: 5,
  duration: 900,
});

interface ArrepentimientoFormData {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  codigoReserva: string;
  comentarios: string;
}

function createTransporter() {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASSWORD || process.env.SMTP_PASS;

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

  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }

  return null;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: NextRequest) {
  try {
    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    try {
      await rateLimiter.consume(clientIp);
    } catch {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Por favor, intentá nuevamente más tarde." },
        { status: 429 }
      );
    }

    const body: ArrepentimientoFormData = await request.json();

    if (
      !body.nombre?.trim() ||
      !body.apellido?.trim() ||
      !body.email?.trim() ||
      !body.telefono?.trim() ||
      !body.codigoReserva?.trim() ||
      !body.comentarios?.trim()
    ) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    if (!isValidEmail(body.email)) {
      return NextResponse.json(
        { error: "El email ingresado no es válido" },
        { status: 400 }
      );
    }

    const emailContent = `
Nueva solicitud de Botón de Arrepentimiento:

Nombre: ${body.nombre}
Apellido: ${body.apellido}
Email: ${body.email}
Teléfono: ${body.telefono}
Código de Reserva: ${body.codigoReserva}

Comentarios:
${body.comentarios}

---
Este mensaje fue enviado desde el formulario de Botón de Arrepentimiento de Antartur.
    `.trim();

    const transporter = createTransporter();
    const recipientEmail = process.env.CONTACT_RECIPIENT_EMAIL;

    if (!recipientEmail) {
      console.error("CONTACT_RECIPIENT_EMAIL no está configurada");
      if (process.env.NODE_ENV === "development") {
        console.warn("⚠️  En desarrollo, el email no se enviará sin CONTACT_RECIPIENT_EMAIL configurado");
      } else {
        return NextResponse.json(
          { error: "Error de configuración del servidor" },
          { status: 500 }
        );
      }
    }

    if (!transporter) {
      if (process.env.NODE_ENV === "development") {
        console.warn("⚠️  Email no enviado - Modo desarrollo sin configuración SMTP");
        console.warn(`Para: ${recipientEmail || "CONTACT_RECIPIENT_EMAIL no configurado"}`);
        console.warn(`Asunto: Botón de Arrepentimiento - ${body.nombre} ${body.apellido}`);
      }

      return NextResponse.json(
        { message: "Solicitud recibida exitosamente (modo desarrollo - email no enviado)" },
        { status: 200 }
      );
    }

    if (!recipientEmail) {
      return NextResponse.json(
        { error: "Error de configuración: email destinatario no configurado" },
        { status: 500 }
      );
    }

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.GMAIL_USER || "reservas@antartur.tur.ar",
      to: recipientEmail,
      subject: `Botón de Arrepentimiento - ${body.nombre} ${body.apellido}`,
      text: emailContent,
      replyTo: body.email,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { message: "Solicitud enviada exitosamente" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error enviando email de arrepentimiento:", error);
    return NextResponse.json(
      { error: "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
}
