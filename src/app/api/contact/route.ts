import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

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

    // Si no hay configuración de email (modo desarrollo), solo loguear
    if (!transporter) {
      console.log("=".repeat(60));
      console.log("📧 EMAIL DE CONTACTO (MODO DESARROLLO - NO ENVIADO)");
      console.log("=".repeat(60));
      console.log(`Para: ximenapaparella@gmail.com`);
      console.log(`Asunto: Nueva consulta de contacto - ${body.nombreCompleto} ${body.apellidos}`);
      console.log(`\n${emailContent}`);
      console.log("=".repeat(60));
      console.log("\n💡 Para enviar emails reales, configura las variables de entorno:");
      console.log("   - GMAIL_USER y GMAIL_APP_PASSWORD (para Gmail)");
      console.log("   - O SMTP_HOST, SMTP_USER, SMTP_PASSWORD (para SMTP)");
      console.log("=".repeat(60));

      return NextResponse.json(
        { message: "Consulta recibida exitosamente (modo desarrollo - email no enviado)" },
        { status: 200 }
      );
    }

    // Enviar email real
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.GMAIL_USER || "noreply@antartur.tur.ar",
      to: "ximenapaparella@gmail.com",
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

