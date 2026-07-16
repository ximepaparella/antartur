/**
 * Template HTML para email de reserva (confirmada o pendiente de pago)
 */

import { getSiteUrl } from "../utils/siteUrl";
import { calculateAge } from "@/lib/utils/pricing";
import { formatRestrictions } from "../utils/formatRestrictions";
import { formatOrderStatusLabel } from "../utils/formatOrderStatus";

export interface BankDetailsForEmail {
  accountName: string;
  accountNumber?: string | null;
  bank?: string | null;
  cuit: string;
  cbu: string;
  alias: string;
}

export interface ReservationEmailData {
  orderCode: string;
  status: string;
  customerName: string;
  tourName: string;
  departureDate: string;
  startTime: string;
  meetingPoint?: string | null;
  numAdults: number;
  numChildren: number;
  totalAmount: number;
  currency: string;
  /** Si true, se muestran instrucciones de transferencia bancaria */
  isBankTransfer?: boolean;
  bankDetails?: BankDetailsForEmail | null;
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

function isReservationConfirmed(status: string): boolean {
  return status === "PAID" || status === "COMPLETED";
}

function renderBankDetailsHTML(
  data: ReservationEmailData,
  primaryColor: string,
  formattedAmount: string
): string {
  if (!data.isBankTransfer || isReservationConfirmed(data.status) || !data.bankDetails) {
    return "";
  }

  const bank = data.bankDetails;
  const optionalRows = [
    bank.accountNumber
      ? `<tr>
                  <td style="padding-bottom: 8px;">
                    <strong style="color: ${primaryColor};">Número de cuenta:</strong>
                    <span style="color: ${primaryColor};">${bank.accountNumber}</span>
                  </td>
                </tr>`
      : "",
    bank.bank
      ? `<tr>
                  <td style="padding-bottom: 8px;">
                    <strong style="color: ${primaryColor};">Banco:</strong>
                    <span style="color: ${primaryColor};">${bank.bank}</span>
                  </td>
                </tr>`
      : "",
  ]
    .filter(Boolean)
    .join("");

  return `
              <h2 style="color: ${primaryColor}; font-size: 20px; margin: 0 0 15px 0;">Instrucciones de pago</h2>
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fff8e1; border-left: 4px solid #ffc107; border-radius: 4px; padding: 20px; margin-bottom: 30px;">
                <tr>
                  <td style="padding-bottom: 12px;">
                    <p style="color: ${primaryColor}; font-size: 14px; line-height: 1.6; margin: 0;">
                      Tu reserva está <strong>pendiente de confirmación</strong> hasta que se acredite el pago.
                      Realizá una transferencia por <strong>${formattedAmount}</strong> usando el código
                      <strong>${data.orderCode}</strong> como referencia, y enviá el comprobante a
                      <a href="mailto:agencias@antartur.tur.ar" style="color: ${primaryColor};">agencias@antartur.tur.ar</a>.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom: 8px;">
                    <strong style="color: ${primaryColor};">Titular:</strong>
                    <span style="color: ${primaryColor};">${bank.accountName}</span>
                  </td>
                </tr>
                ${optionalRows}
                <tr>
                  <td style="padding-bottom: 8px;">
                    <strong style="color: ${primaryColor};">CUIT:</strong>
                    <span style="color: ${primaryColor};">${bank.cuit}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom: 8px;">
                    <strong style="color: ${primaryColor};">CBU:</strong>
                    <span style="color: ${primaryColor}; font-family: monospace;">${bank.cbu}</span>
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong style="color: ${primaryColor};">Alias:</strong>
                    <span style="color: ${primaryColor};">${bank.alias}</span>
                  </td>
                </tr>
              </table>
`;
}

function renderBankDetailsText(data: ReservationEmailData, formattedAmount: string): string {
  if (!data.isBankTransfer || isReservationConfirmed(data.status) || !data.bankDetails) {
    return "";
  }

  const bank = data.bankDetails;
  const optionalLines = [
    bank.accountNumber ? `- Número de cuenta: ${bank.accountNumber}` : "",
    bank.bank ? `- Banco: ${bank.bank}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  return `
Instrucciones de pago:
Tu reserva está pendiente de confirmación hasta que se acredite el pago.
Realizá una transferencia por ${formattedAmount} usando el código ${data.orderCode} como referencia,
y enviá el comprobante a agencias@antartur.tur.ar.

Datos bancarios:
- Titular: ${bank.accountName}
${optionalLines ? optionalLines + "\n" : ""}- CUIT: ${bank.cuit}
- CBU: ${bank.cbu}
- Alias: ${bank.alias}
`;
}

export function generateReservationEmailHTML(data: ReservationEmailData): string {
  const logoUrl = getSiteUrl() + "/images/logo-color-2.svg";
  const primaryColor = "#24384d"; // Azul primario de Antartur
  const currencySymbol = data.currency === "USD" ? "$" : "$";
  const formattedAmount = `${currencySymbol} ${data.totalAmount.toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
  const statusLabel = formatOrderStatusLabel(data.status);
  const isConfirmed = isReservationConfirmed(data.status);
  const headingText = isConfirmed ? "¡Reserva Confirmada!" : "¡Reserva recibida! Pendiente de pago";
  const introText = isConfirmed
    ? "Tu reserva ha sido confirmada exitosamente. A continuación encontrarás los detalles:"
    : "Hemos recibido tu reserva. Está pendiente de confirmación hasta que se acredite el pago. A continuación encontrarás los detalles:";
  const emailTitle = isConfirmed
    ? `Confirmación de Reserva - ${data.orderCode}`
    : `Reserva recibida (pendiente de pago) - ${data.orderCode}`;
  const totalLabel = isConfirmed ? "Total:" : "Total a pagar:";

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${emailTitle}</title>
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
              <h1 style="color: ${primaryColor}; font-size: 24px; margin: 0 0 20px 0;">${headingText}</h1>
              
              <p style="color: ${primaryColor}; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Hola ${data.customerName},
              </p>
              
              <p style="color: ${primaryColor}; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                ${introText}
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
                    <strong style="color: ${primaryColor}; font-size: 18px;">${totalLabel}</strong>
                    <span style="color: ${primaryColor}; font-size: 18px; font-weight: bold;">${formattedAmount}</span>
                  </td>
                </tr>
              </table>

              ${renderBankDetailsHTML(data, primaryColor, formattedAmount)}
              
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
  const statusLabel = formatOrderStatusLabel(data.status);
  const isConfirmed = isReservationConfirmed(data.status);
  const headingText = isConfirmed
    ? `Confirmación de Reserva - ${data.orderCode}`
    : `Reserva recibida (pendiente de pago) - ${data.orderCode}`;
  const introText = isConfirmed
    ? "Tu reserva ha sido confirmada exitosamente."
    : "Hemos recibido tu reserva. Está pendiente de confirmación hasta que se acredite el pago.";
  const totalLabel = isConfirmed ? "Total" : "Total a pagar";
  const formattedAmount = `${data.currency === "USD" ? "$" : "$"} ${data.totalAmount.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return `
${headingText}

Hola ${data.customerName},

${introText}

Detalles:
- Código de Orden: ${data.orderCode}
- Estado: ${statusLabel}
- Excursión: ${data.tourName}
- Fecha: ${data.departureDate}
- Hora de inicio: ${data.startTime}
- Pasajeros: ${data.numAdults} adulto${data.numAdults !== 1 ? "s" : ""}${data.numChildren > 0 ? `, ${data.numChildren} menor${data.numChildren !== 1 ? "es" : ""}` : ""}
${data.additionals && data.additionals.length > 0 ? `- Adicionales: ${data.additionals.map(a => a.name).join(", ")}\n` : ""}- ${totalLabel}: ${formattedAmount}
${renderBankDetailsText(data, formattedAmount)}
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
