/**
 * Template HTML para email de reserva confirmada
 */

import { getSiteUrl } from "../utils/siteUrl";
import { calculateAge } from "@/lib/utils/pricing";
import { formatRestrictions } from "../utils/formatRestrictions";

export interface ReservationEmailData {
  orderCode: string;
  customerName: string;
  tourName: string;
  departureDate: string;
  startTime: string;
  meetingPoint?: string | null;
  numAdults: number;
  numChildren: number;
  totalAmount: number;
  currency: string;
  passengers: Array<{
    firstName: string;
    lastName: string;
    type: string;
    birthDate?: string | null;
    documentType?: string | null;
    documentNumber?: string | null;
    nationality?: string | null;
    email?: string | null;
    phone?: string | null;
    restrictions?: Record<string, any> | null;
  }>;
  additionals?: Array<{
    name: string;
  }>;
}

export function generateReservationEmailHTML(data: ReservationEmailData): string {
  const logoUrl = "https://antartur.tur.ar/_next/image?url=%2Fimages%2Flogo-color-2.svg&w=384&q=75";
  const primaryColor = "#24384d"; // Azul primario de Antartur
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
            <td style="background-color: ${primaryColor}; padding: 30px; text-align: center;">
              <img src="${logoUrl}" alt="Antartur" style="max-width: 200px; height: auto;" />
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h1 style="color: ${primaryColor}; font-size: 24px; margin: 0 0 20px 0;">¡Reserva Confirmada!</h1>
              
              <p style="color: ${primaryColor}; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Hola ${data.customerName},
              </p>
              
              <p style="color: ${primaryColor}; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                Tu reserva ha sido confirmada exitosamente. A continuación encontrarás los detalles:
              </p>
              
              <!-- Order Details -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9f9f9; border-radius: 4px; padding: 20px; margin-bottom: 30px;">
                <tr>
                  <td style="padding-bottom: 10px;">
                    <strong style="color: ${primaryColor};">Código de Orden:</strong>
                    <span style="color: ${primaryColor}; font-family: monospace;">${data.orderCode}</span>
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
                    <strong style="color: ${primaryColor};">Fecha:</strong>
                    <span style="color: ${primaryColor};">${data.departureDate}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom: 10px;">
                    <strong style="color: ${primaryColor};">Hora de inicio:</strong>
                    <span style="color: ${primaryColor};">${data.startTime}</span>
                  </td>
                </tr>
                ${data.meetingPoint ? `
                <tr>
                  <td style="padding-bottom: 10px;">
                    <strong style="color: ${primaryColor};">Punto de encuentro:</strong>
                    <span style="color: ${primaryColor};">${data.meetingPoint}</span>
                  </td>
                </tr>
                ` : ""}
                <tr>
                  <td style="padding-bottom: 10px;">
                    <strong style="color: ${primaryColor};">Pasajeros:</strong>
                    <span style="color: ${primaryColor};">${data.numAdults} adulto${data.numAdults !== 1 ? "s" : ""}${data.numChildren > 0 ? `, ${data.numChildren} menor${data.numChildren !== 1 ? "es" : ""}` : ""}</span>
                  </td>
                </tr>
                ${data.additionals && data.additionals.length > 0 ? `
                <tr>
                  <td style="padding-bottom: 10px;">
                    <strong style="color: ${primaryColor};">Adicionales:</strong>
                    <span style="color: ${primaryColor};">${data.additionals.map(a => a.name).join(", ")}</span>
                  </td>
                </tr>
                ` : ""}
                <tr>
                  <td>
                    <strong style="color: ${primaryColor}; font-size: 18px;">Total:</strong>
                    <span style="color: ${primaryColor}; font-size: 18px; font-weight: bold;">${formattedAmount}</span>
                  </td>
                </tr>
              </table>
              
              <!-- Passengers List -->
              <h2 style="color: ${primaryColor}; font-size: 20px; margin: 30px 0 15px 0;">Pasajeros</h2>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                ${data.passengers.map((passenger, index) => {
                  const age = passenger.birthDate ? calculateAge(passenger.birthDate) : null;
                  const typeLabel = passenger.type === "ADULT" ? "Adulto" : 
                                   passenger.type === "CHILD" ? "Niño" : "Infante";
                  const ageText = age !== null ? `, ${age} años` : "";
                  const documentText = passenger.documentType && passenger.documentNumber 
                    ? `, ${passenger.documentType} ${passenger.documentNumber}` : "";
                  const nationalityText = passenger.nationality ? `, ${passenger.nationality}` : "";
                  
                  const restrictionsText = formatRestrictions(passenger.restrictions);
                  
                  return `
                <tr>
                  <td style="padding: 15px 0; border-bottom: 1px solid #e0e0e0;">
                    <strong style="color: ${primaryColor};">${index + 1}.</strong> ${passenger.firstName} ${passenger.lastName} (${typeLabel}${ageText})
                    ${documentText ? `<br><span style="color: ${primaryColor}; font-size: 14px;">Documento: ${documentText.substring(2)}</span>` : ""}
                    ${nationalityText ? `<br><span style="color: ${primaryColor}; font-size: 14px;">Nacionalidad: ${nationalityText.substring(2)}</span>` : ""}
                    ${passenger.email ? `<br><span style="color: ${primaryColor}; font-size: 14px;">Email: ${passenger.email}</span>` : ""}
                    ${passenger.phone ? `<br><span style="color: ${primaryColor}; font-size: 14px;">Teléfono: ${passenger.phone}</span>` : ""}
                    ${restrictionsText ? `<br><span style="color: #d32f2f; font-size: 14px;"><strong>Restricciones:</strong> ${restrictionsText}</span>` : ""}
                  </td>
                </tr>
                `;
                }).join("")}
              </table>
              
              <p style="color: ${primaryColor}; font-size: 16px; line-height: 1.6; margin: 30px 0 0 0;">
                Si tienes alguna pregunta o necesitas modificar tu reserva, no dudes en contactarnos.
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
${data.passengers.map((p, i) => {
  const age = p.birthDate ? calculateAge(p.birthDate) : null;
  const typeLabel = p.type === "ADULT" ? "Adulto" : p.type === "CHILD" ? "Niño" : "Infante";
  const ageText = age !== null ? `, ${age} años` : "";
  const documentText = p.documentType && p.documentNumber ? `, ${p.documentType} ${p.documentNumber}` : "";
  const nationalityText = p.nationality ? `, ${p.nationality}` : "";
  const restrictionsText = formatRestrictions(p.restrictions);
  let passengerInfo = `${i + 1}. ${p.firstName} ${p.lastName} (${typeLabel}${ageText})`;
  if (documentText) passengerInfo += `\n   Documento: ${documentText.substring(2)}`;
  if (nationalityText) passengerInfo += `\n   Nacionalidad: ${nationalityText.substring(2)}`;
  if (p.email) passengerInfo += `\n   Email: ${p.email}`;
  if (p.phone) passengerInfo += `\n   Teléfono: ${p.phone}`;
  if (restrictionsText) passengerInfo += `\n   Restricciones: ${restrictionsText}`;
  return passengerInfo;
}).join("\n\n")}

Si tienes alguna pregunta, contacta a agencias@antartur.tur.ar

Antartur - Turismo de Aventura
  `.trim();
}

