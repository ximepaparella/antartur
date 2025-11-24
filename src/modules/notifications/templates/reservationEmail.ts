/**
 * Template HTML para email de reserva confirmada
 */

import { getSiteUrl } from "../utils/siteUrl";

export interface ReservationEmailData {
  orderCode: string;
  customerName: string;
  tourName: string;
  departureDate: string;
  startTime: string;
  numAdults: number;
  numChildren: number;
  totalAmount: number;
  currency: string;
  passengers: Array<{
    firstName: string;
    lastName: string;
    type: string;
  }>;
  additionals?: Array<{
    name: string;
  }>;
}

export function generateReservationEmailHTML(data: ReservationEmailData): string {
  const siteUrl = getSiteUrl();
  const logoUrl = `${siteUrl}/images/logo-color.svg`;
  const currencySymbol = data.currency === "USD" ? "$" : "$";
  const formattedAmount = `${currencySymbol} ${data.totalAmount.toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmación de Reserva - ${data.orderCode}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background-color: #1a1a1a; padding: 30px; text-align: center;">
              <img src="${logoUrl}" alt="Antartur" style="max-width: 200px; height: auto;" />
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h1 style="color: #1a1a1a; font-size: 24px; margin: 0 0 20px 0;">¡Reserva Confirmada!</h1>
              
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Hola ${data.customerName},
              </p>
              
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                Tu reserva ha sido confirmada exitosamente. A continuación encontrarás los detalles:
              </p>
              
              <!-- Order Details -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9f9f9; border-radius: 4px; padding: 20px; margin-bottom: 30px;">
                <tr>
                  <td style="padding-bottom: 10px;">
                    <strong style="color: #1a1a1a;">Código de Orden:</strong>
                    <span style="color: #333333; font-family: monospace;">${data.orderCode}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom: 10px;">
                    <strong style="color: #1a1a1a;">Excursión:</strong>
                    <span style="color: #333333;">${data.tourName}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom: 10px;">
                    <strong style="color: #1a1a1a;">Fecha:</strong>
                    <span style="color: #333333;">${data.departureDate}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom: 10px;">
                    <strong style="color: #1a1a1a;">Hora de inicio:</strong>
                    <span style="color: #333333;">${data.startTime}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom: 10px;">
                    <strong style="color: #1a1a1a;">Pasajeros:</strong>
                    <span style="color: #333333;">${data.numAdults} adulto${data.numAdults !== 1 ? "s" : ""}${data.numChildren > 0 ? `, ${data.numChildren} menor${data.numChildren !== 1 ? "es" : ""}` : ""}</span>
                  </td>
                </tr>
                ${data.additionals && data.additionals.length > 0 ? `
                <tr>
                  <td style="padding-bottom: 10px;">
                    <strong style="color: #1a1a1a;">Adicionales:</strong>
                    <span style="color: #333333;">${data.additionals.map(a => a.name).join(", ")}</span>
                  </td>
                </tr>
                ` : ""}
                <tr>
                  <td>
                    <strong style="color: #1a1a1a; font-size: 18px;">Total:</strong>
                    <span style="color: #1a1a1a; font-size: 18px; font-weight: bold;">${formattedAmount}</span>
                  </td>
                </tr>
              </table>
              
              <!-- Passengers List -->
              <h2 style="color: #1a1a1a; font-size: 20px; margin: 30px 0 15px 0;">Pasajeros</h2>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                ${data.passengers.map((passenger, index) => `
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;">
                    <strong>${index + 1}.</strong> ${passenger.firstName} ${passenger.lastName} (${passenger.type})
                  </td>
                </tr>
                `).join("")}
              </table>
              
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 30px 0 0 0;">
                Si tienes alguna pregunta o necesitas modificar tu reserva, no dudes en contactarnos.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #1a1a1a; padding: 30px; text-align: center; color: #ffffff;">
              <p style="margin: 0 0 10px 0; font-size: 14px;">Antartur - Turismo de Aventura</p>
              <p style="margin: 0; font-size: 12px; color: #999999;">
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

export function generateReservationEmailText(data: ReservationEmailData): string {
  return `
Confirmación de Reserva - ${data.orderCode}

Hola ${data.customerName},

Tu reserva ha sido confirmada exitosamente.

Detalles:
- Código de Orden: ${data.orderCode}
- Excursión: ${data.tourName}
- Fecha: ${data.departureDate}
- Hora de inicio: ${data.startTime}
- Pasajeros: ${data.numAdults} adulto${data.numAdults !== 1 ? "s" : ""}${data.numChildren > 0 ? `, ${data.numChildren} menor${data.numChildren !== 1 ? "es" : ""}` : ""}
${data.additionals && data.additionals.length > 0 ? `- Adicionales: ${data.additionals.map(a => a.name).join(", ")}\n` : ""}- Total: ${data.currency === "USD" ? "$" : "$"} ${data.totalAmount.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}

Pasajeros:
${data.passengers.map((p, i) => `${i + 1}. ${p.firstName} ${p.lastName} (${p.type})`).join("\n")}

Si tienes alguna pregunta, contacta a agencias@antartur.tur.ar

Antartur - Turismo de Aventura
  `.trim();
}

