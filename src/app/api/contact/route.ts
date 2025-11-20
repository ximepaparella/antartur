import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { RateLimiterMemory } from "rate-limiter-flexible";

// Rate limiter: máximo 5 requests por IP cada 15 minutos
const rateLimiter = new RateLimiterMemory({
  points: 5, // Número de requests
  duration: 900, // Período en segundos (15 minutos)
});

interface ContactFormData {
  nombreCompleto: string;
  apellidos: string;
  email: string;
  codigoPais: string;
  codigoCiudad: string;
  celular: string;
  codigoReserva: string;
  mensaje: string;
  recaptchaToken?: string; // Optional for localhost development
}

// Validar reCAPTCHA
async function verifyRecaptcha(token: string): Promise<boolean> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  
  if (!secretKey) {
    console.error("RECAPTCHA_SECRET_KEY no está configurada");
    return false;
  }

  try {
    const response = await fetch(
      `https://www.google.com/recaptcha/api/siteverify`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `secret=${secretKey}&response=${token}`,
      }
    );

    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error("Error verificando reCAPTCHA:", error);
    return false;
  }
}

// Configurar transporter de nodemailer
function createTransporter() {
  // Para desarrollo, puedes usar un servicio como Gmail o un servicio SMTP
  // Aquí usamos variables de entorno para configuración flexible
  
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
      secure: smtpPort === 465, // true para 465, false para otros puertos
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
        pass: process.env.GMAIL_APP_PASSWORD, // Contraseña de aplicación de Gmail
      },
    });
  }

  // Si no hay configuración, retornar null (modo desarrollo - solo loguear)
  return null;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: obtener IP del cliente
    const clientIp = 
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    try {
      await rateLimiter.consume(clientIp);
    } catch (rateLimiterError) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Por favor, intentá nuevamente más tarde." },
        { status: 429 }
      );
    }

    const body: ContactFormData = await request.json();

    // Validar campos requeridos
    if (
      !body.nombreCompleto ||
      !body.apellidos ||
      !body.email ||
      !body.codigoPais ||
      !body.celular ||
      !body.mensaje
      // !body.recaptchaToken // Commented out for localhost development
    ) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    // Validar reCAPTCHA - Commented out for localhost development
    // const isValidRecaptcha = await verifyRecaptcha(body.recaptchaToken || "");
    // if (!isValidRecaptcha) {
    //   return NextResponse.json(
    //     { error: "Validación de reCAPTCHA fallida" },
    //     { status: 400 }
    //   );
    // }

    // Construir el mensaje de email
    const emailContent = `
Nueva consulta desde el formulario de contacto:

Nombre Completo: ${body.nombreCompleto}
Apellidos: ${body.apellidos}
Email: ${body.email}
Código de País: ${body.codigoPais}
Código de Ciudad: ${body.codigoCiudad || "No especificado"}
Celular/Móvil: ${body.celular}
Código de Reserva: ${body.codigoReserva || "No especificado"}

Mensaje:
${body.mensaje}

---
Este mensaje fue enviado desde el formulario de contacto de Antartur.
    `.trim();

    // Crear transporter
    const transporter = createTransporter();

    // Obtener email destinatario de variable de entorno
    const recipientEmail = process.env.CONTACT_RECIPIENT_EMAIL;

    // El email destinatario es requerido (tanto en desarrollo como en producción)
    if (!recipientEmail) {
      console.error("CONTACT_RECIPIENT_EMAIL no está configurada");
      // En desarrollo, permitimos continuar pero mostramos advertencia
      if (process.env.NODE_ENV === "development") {
        console.warn("⚠️  En desarrollo, el email no se enviará sin CONTACT_RECIPIENT_EMAIL configurado");
      } else {
        // En producción, fallar rápido
        return NextResponse.json(
          { error: "Error de configuración del servidor" },
          { status: 500 }
        );
      }
    }

    // Si no hay configuración de email (modo desarrollo), solo loguear
    if (!transporter) {
      // En desarrollo, loguear información útil pero de forma más limpia
      if (process.env.NODE_ENV === 'development') {
        console.warn("⚠️  Email no enviado - Modo desarrollo sin configuración SMTP");
        console.warn(`Para: ${recipientEmail || "CONTACT_RECIPIENT_EMAIL no configurado"}`);
        console.warn(`Asunto: Nueva consulta de contacto - ${body.nombreCompleto} ${body.apellidos}`);
      }

      return NextResponse.json(
        { message: "Consulta recibida exitosamente (modo desarrollo - email no enviado)" },
        { status: 200 }
      );
    }

    // Si no hay email destinatario configurado, no podemos enviar
    if (!recipientEmail) {
      console.error("No se puede enviar email: CONTACT_RECIPIENT_EMAIL no está configurada");
      return NextResponse.json(
        { error: "Error de configuración: email destinatario no configurado" },
        { status: 500 }
      );
    }

    // Enviar email real
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.GMAIL_USER || "noreply@antartur.tur.ar",
      to: recipientEmail,
      subject: `Nueva consulta de contacto - ${body.nombreCompleto} ${body.apellidos}`,
      text: emailContent,
      replyTo: body.email,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { message: "Consulta enviada exitosamente" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error enviando email:", error);
    return NextResponse.json(
      { error: "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
}

