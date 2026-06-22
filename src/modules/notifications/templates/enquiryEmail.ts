/**
 * Template HTML para email de consulta
 */

import { getSiteUrl } from "../utils/siteUrl";
import { formatOrderStatusLabel } from "../utils/formatOrderStatus";

export interface EnquiryEmailData {
  orderCode: string;
  status: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  tourName: string;
  departureDate: string;
  startTime: string;
  numAdults: number;
  numChildren: number;
  totalAmount: number;
  currency: string;
  reason: string; // Motivo de consulta (exceedsAvailability, hasRestrictionViolations, etc.)
  passengers: Array<{
    firstName: string;
    lastName: string;
    type: string;
  }>;
}

export function generateEnquiryEmailHTML(data: EnquiryEmailData): string {
  const logoUrl = getSiteUrl() + "/images/logo-color-2.svg";
  const primaryColor = "#24384d"; // Azul primario de Antartur
  const currencySymbol = data.currency === "USD" ? "$" : "$";
  const formattedAmount = `${currencySymbol} ${data.totalAmount.toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  const reasonText = data.reason.includes("exceedsAvailability")
    ? "La cantidad de pasajeros excede la disponibilidad disponible"
    : data.reason.includes("hasRestrictionViolations")
    ? "Algunos pasajeros no cumplen con las restricciones del tour"
    : "Consulta general";
  const statusLabel = formatOrderStatusLabel(data.status);

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Consulta Recibida - ${data.orderCode}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background-color: ${primaryColor}; padding: 30px; text-align: center;">
              <img src="${logoUrl}" alt="Antartur" style="max-width: 200px; height: auto;" />
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h1 style="color: ${primaryColor}; font-size: 24px; margin: 0 0 20px 0;">Consulta Recibida</h1>
              
              <p style="color: ${primaryColor}; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Hola ${data.customerName},
              </p>
              
              <p style="color: ${primaryColor}; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                Hemos recibido tu consulta. Nuestro equipo la revisará y se contactará contigo a la brevedad.
              </p>
              
              <!-- Info Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px; padding: 15px; margin-bottom: 30px;">
                <tr>
                  <td>
                    <p style="color: #856404; font-size: 14px; margin: 0; line-height: 1.6;">
                      <strong>Motivo de consulta:</strong> ${reasonText}
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- Order Details -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9f9f9; border-radius: 4px; padding: 20px; margin-bottom: 30px;">
                <tr>
                  <td style="padding-bottom: 10px;">
                    <strong style="color: ${primaryColor};">Código de Consulta:</strong>
                    <span style="color: ${primaryColor}; font-family: monospace;">${data.orderCode}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom: 10px;">
                    <strong style="color: ${primaryColor};">Estado:</strong>
                    <span style="color: ${primaryColor};">${statusLabel}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom: 10px;">
                    <strong style="color: ${primaryColor};">Excursión:</strong>
                    <span style="color: ${primaryColor};">${data.tourName}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom: 10px;">
                    <strong style="color: ${primaryColor};">Fecha solicitada:</strong>
                    <span style="color: ${primaryColor};">${data.departureDate}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom: 10px;">
                    <strong style="color: ${primaryColor};">Hora solicitada:</strong>
                    <span style="color: ${primaryColor};">${data.startTime}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom: 10px;">
                    <strong style="color: ${primaryColor};">Pasajeros:</strong>
                    <span style="color: ${primaryColor};">${data.numAdults} adulto${data.numAdults !== 1 ? "s" : ""}${data.numChildren > 0 ? `, ${data.numChildren} menor${data.numChildren !== 1 ? "es" : ""}` : ""}</span>
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong style="color: ${primaryColor};">Total estimado:</strong>
                    <span style="color: ${primaryColor};">${formattedAmount}</span>
                  </td>
                </tr>
              </table>
              
              <!-- Contact Info -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td>
                    <strong style="color: ${primaryColor};">Datos de contacto:</strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 5px;">
                    Email: <a href="mailto:${data.customerEmail}" style="color: ${primaryColor};">${data.customerEmail}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 5px;">
                    Teléfono: ${data.customerPhone}
                  </td>
                </tr>
              </table>
              
              <p style="color: ${primaryColor}; font-size: 16px; line-height: 1.6; margin: 30px 0 0 0;">
                Te contactaremos pronto al correo <strong>${data.customerEmail}</strong> o al teléfono <strong>${data.customerPhone}</strong>.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: ${primaryColor}; padding: 30px; text-align: center; color: #ffffff;">
              <p style="margin: 0 0 10px 0; font-size: 14px;">Antartur - Turismo de Aventura</p>
              <p style="margin: 0; font-size: 12px; color: #cccccc;">
                <a href="mailto:agencias@antartur.tur.ar" style="color: #ffffff;">agencias@antartur.tur.ar</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export function generateEnquiryEmailText(data: EnquiryEmailData): string {
  const reasonText = data.reason.includes("exceedsAvailability")
    ? "La cantidad de pasajeros excede la disponibilidad disponible"
    : data.reason.includes("hasRestrictionViolations")
    ? "Algunos pasajeros no cumplen con las restricciones del tour"
    : "Consulta general";
  const statusLabel = formatOrderStatusLabel(data.status);

  return `
Consulta Recibida - ${data.orderCode}

Hola ${data.customerName},

Hemos recibido tu consulta. Nuestro equipo la revisará y se contactará contigo a la brevedad.

Motivo de consulta: ${reasonText}

Detalles:
- Código de Consulta: ${data.orderCode}
- Estado: ${statusLabel}
- Excursión: ${data.tourName}
- Fecha solicitada: ${data.departureDate}
- Hora solicitada: ${data.startTime}
- Pasajeros: ${data.numAdults} adulto${data.numAdults !== 1 ? "s" : ""}${data.numChildren > 0 ? `, ${data.numChildren} menor${data.numChildren !== 1 ? "es" : ""}` : ""}
- Total estimado: ${data.currency === "USD" ? "$" : "$"} ${data.totalAmount.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}

Datos de contacto:
- Email: ${data.customerEmail}
- Teléfono: ${data.customerPhone}

Te contactaremos pronto.

Antartur - Turismo de Aventura
agencias@antartur.tur.ar
  `.trim();
}

