/**
 * Template HTML y texto para email de confirmación de pago
 */

import { getSiteUrl } from "../utils/siteUrl";

export interface PaymentConfirmationEmailData {
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
  paymentMethod: string;
  transactionId?: string;
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
}

export function generatePaymentConfirmationEmailHTML(data: PaymentConfirmationEmailData): string {
  const siteUrl = getSiteUrl();
  const formattedAmount = data.totalAmount.toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const currencySymbol = data.currency === "USD" ? "$" : "$";
  const paymentMethodName = data.paymentMethod === "PAYPAL" ? "PayPal" : data.paymentMethod === "PAYWAY" ? "Payway" : "Transferencia Bancaria";

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pago Confirmado - ${data.orderCode}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: #2c5f7c; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Pago Confirmado</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 30px;">
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Hola ${data.customerName},
              </p>
              
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                ¡Excelente noticia! Hemos recibido tu pago y tu reserva ha sido confirmada.
              </p>
              
              <!-- Order Details -->
              <div style="background-color: #f9f9f9; border-left: 4px solid #2c5f7c; padding: 20px; margin: 20px 0;">
                <h2 style="color: #2c5f7c; font-size: 18px; margin: 0 0 15px 0;">Detalles de tu Reserva</h2>
                <table width="100%" cellpadding="5" cellspacing="0">
                  <tr>
                    <td style="color: #666666; font-size: 14px; padding: 5px 0;"><strong>Código de Orden:</strong></td>
                    <td style="color: #333333; font-size: 14px; padding: 5px 0; text-align: right;"><strong>${data.orderCode}</strong></td>
                  </tr>
                  <tr>
                    <td style="color: #666666; font-size: 14px; padding: 5px 0;">Excursión:</td>
                    <td style="color: #333333; font-size: 14px; padding: 5px 0; text-align: right;">${data.tourName}</td>
                  </tr>
                  <tr>
                    <td style="color: #666666; font-size: 14px; padding: 5px 0;">Fecha:</td>
                    <td style="color: #333333; font-size: 14px; padding: 5px 0; text-align: right;">${data.departureDate}</td>
                  </tr>
                  <tr>
                    <td style="color: #666666; font-size: 14px; padding: 5px 0;">Hora:</td>
                    <td style="color: #333333; font-size: 14px; padding: 5px 0; text-align: right;">${data.startTime}</td>
                  </tr>
                  ${data.meetingPoint ? `
                  <tr>
                    <td style="color: #666666; font-size: 14px; padding: 5px 0;">Punto de encuentro:</td>
                    <td style="color: #333333; font-size: 14px; padding: 5px 0; text-align: right;">${data.meetingPoint}</td>
                  </tr>
                  ` : ""}
                  <tr>
                    <td style="color: #666666; font-size: 14px; padding: 5px 0;">Pasajeros:</td>
                    <td style="color: #333333; font-size: 14px; padding: 5px 0; text-align: right;">${data.numAdults} adultos, ${data.numChildren} menores</td>
                  </tr>
                  <tr>
                    <td style="color: #666666; font-size: 14px; padding: 5px 0;">Método de Pago:</td>
                    <td style="color: #333333; font-size: 14px; padding: 5px 0; text-align: right;">${paymentMethodName}</td>
                  </tr>
                  ${data.transactionId ? `
                  <tr>
                    <td style="color: #666666; font-size: 14px; padding: 5px 0;">ID de Transacción:</td>
                    <td style="color: #333333; font-size: 14px; padding: 5px 0; text-align: right;">${data.transactionId}</td>
                  </tr>
                  ` : ""}
                  <tr style="border-top: 2px solid #2c5f7c; margin-top: 10px;">
                    <td style="color: #2c5f7c; font-size: 16px; font-weight: bold; padding: 10px 0;"><strong>Total Pagado:</strong></td>
                    <td style="color: #2c5f7c; font-size: 16px; font-weight: bold; padding: 10px 0; text-align: right;"><strong>${currencySymbol} ${formattedAmount} ${data.currency}</strong></td>
                  </tr>
                </table>
              </div>
              
              <!-- Passengers List -->
              ${data.passengers.length > 0 ? `
              <div style="margin: 20px 0;">
                <h3 style="color: #2c5f7c; font-size: 16px; margin: 0 0 15px 0;">Pasajeros:</h3>
                <div style="background-color: #f9f9f9; border-left: 4px solid #2c5f7c; padding: 15px; margin-bottom: 10px;">
                  ${data.passengers.map((p, index) => {
                    const calculateAge = (birthDate: string | null | undefined): number | null => {
                      if (!birthDate) return null;
                      const birth = new Date(birthDate);
                      const today = new Date();
                      let age = today.getFullYear() - birth.getFullYear();
                      const monthDiff = today.getMonth() - birth.getMonth();
                      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
                        age--;
                      }
                      return age;
                    };
                    
                    const age = calculateAge(p.birthDate);
                    const typeLabel = p.type === "ADULT" ? "Adulto" : 
                                     p.type === "CHILD" ? "Niño" : "Infante";
                    const ageText = age !== null ? `, ${age} años` : "";
                    const documentText = p.documentType && p.documentNumber 
                      ? `<br><span style="color: #666; font-size: 13px;">Documento: ${p.documentType} ${p.documentNumber}</span>` : "";
                    const nationalityText = p.nationality ? `<br><span style="color: #666; font-size: 13px;">Nacionalidad: ${p.nationality}</span>` : "";
                    
                    const formatRestrictions = (restrictions: Record<string, any> | null | undefined): string => {
                      if (!restrictions) return "";
                      const parts: string[] = [];
                      
                      // Restricciones alimentarias (foodRestrictions)
                      if (restrictions.foodRestrictions) {
                        const foodRestrictions = restrictions.foodRestrictions;
                        const foodParts: string[] = [];
                        if (foodRestrictions.vegetariano) foodParts.push("Vegetariano");
                        if (foodRestrictions.vegano) foodParts.push("Vegano");
                        if (foodRestrictions.celiaco) foodParts.push("Celiaco");
                        if (foodRestrictions.alergias) {
                          foodParts.push(`Alergias${foodRestrictions.alergiasDetalle ? `: ${foodRestrictions.alergiasDetalle}` : ""}`);
                        }
                        if (foodParts.length > 0) {
                          parts.push(`Restricciones alimentarias: ${foodParts.join(", ")}`);
                        }
                      }
                      
                      // Embarazo
                      if (restrictions.pregnant) {
                        parts.push("Embarazada");
                      }
                      
                      // Problemas de salud/columna
                      if (restrictions.healthIssues) {
                        parts.push("Problemas de columna/salud");
                      }
                      
                      // Compatibilidad con formato antiguo (por si acaso)
                      if (restrictions.dietary) parts.push(`Dietarias: ${restrictions.dietary}`);
                      if (restrictions.medical) parts.push(`Médicas: ${restrictions.medical}`);
                      if (restrictions.mobility) parts.push(`Movilidad: ${restrictions.mobility}`);
                      if (restrictions.other) parts.push(`Otras: ${restrictions.other}`);
                      
                      return parts.length > 0 ? parts.join("; ") : "";
                    };
                    
                    const restrictionsText = formatRestrictions(p.restrictions);
                    
                    return `
                    <div style="padding: 10px 0; border-bottom: ${index < data.passengers.length - 1 ? '1px solid #e0e0e0' : 'none'};">
                      <strong style="color: #2c5f7c;">${index + 1}.</strong> ${p.firstName} ${p.lastName} (${typeLabel}${ageText})
                      ${documentText}
                      ${nationalityText}
                      ${p.email ? `<br><span style="color: #666; font-size: 13px;">Email: ${p.email}</span>` : ""}
                      ${p.phone ? `<br><span style="color: #666; font-size: 13px;">Teléfono: ${p.phone}</span>` : ""}
                      ${restrictionsText ? `<br><span style="color: #d32f2f; font-size: 13px;"><strong>Restricciones:</strong> ${restrictionsText}</span>` : ""}
                    </div>
                    `;
                  }).join("")}
                </div>
              </div>
              ` : ""}
              
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                Tu reserva está confirmada y lista. Te esperamos en la fecha y hora indicadas.
              </p>
              
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                Si tienes alguna pregunta o necesitas modificar tu reserva, no dudes en contactarnos.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="color: #666666; font-size: 12px; margin: 0 0 10px 0;">
                <a href="${siteUrl}" style="color: #2c5f7c; text-decoration: none;">${siteUrl}</a>
              </p>
              <p style="color: #999999; font-size: 12px; margin: 0;">
                Este es un email automático, por favor no respondas directamente.
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

export function generatePaymentConfirmationEmailText(data: PaymentConfirmationEmailData): string {
  const formattedAmount = data.totalAmount.toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const currencySymbol = data.currency === "USD" ? "$" : "$";
  const paymentMethodName = data.paymentMethod === "PAYPAL" ? "PayPal" : data.paymentMethod === "PAYWAY" ? "Payway" : "Transferencia Bancaria";

  return `
Pago Confirmado - ${data.orderCode}

Hola ${data.customerName},

¡Excelente noticia! Hemos recibido tu pago y tu reserva ha sido confirmada.

Detalles de tu Reserva:
- Código de Orden: ${data.orderCode}
- Excursión: ${data.tourName}
- Fecha: ${data.departureDate}
- Hora: ${data.startTime}
- Pasajeros: ${data.numAdults} adultos, ${data.numChildren} menores
- Método de Pago: ${paymentMethodName}
${data.transactionId ? `- ID de Transacción: ${data.transactionId}` : ""}
- Total Pagado: ${currencySymbol} ${formattedAmount} ${data.currency}

${data.passengers.length > 0 ? `Pasajeros:\n${data.passengers.map((p, i) => {
  const calculateAge = (birthDate: string | null | undefined): number | null => {
    if (!birthDate) return null;
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };
  
  const age = calculateAge(p.birthDate);
  const typeLabel = p.type === "ADULT" ? "Adulto" : p.type === "CHILD" ? "Niño" : "Infante";
  const ageText = age !== null ? `, ${age} años` : "";
  const documentText = p.documentType && p.documentNumber ? `\n   Documento: ${p.documentType} ${p.documentNumber}` : "";
  const nationalityText = p.nationality ? `\n   Nacionalidad: ${p.nationality}` : "";
  
  const formatRestrictions = (restrictions: Record<string, any> | null | undefined): string => {
    if (!restrictions) return "";
    const parts: string[] = [];
    
    // Restricciones alimentarias (foodRestrictions)
    if (restrictions.foodRestrictions) {
      const foodRestrictions = restrictions.foodRestrictions;
      const foodParts: string[] = [];
      if (foodRestrictions.vegetariano) foodParts.push("Vegetariano");
      if (foodRestrictions.vegano) foodParts.push("Vegano");
      if (foodRestrictions.celiaco) foodParts.push("Celiaco");
      if (foodRestrictions.alergias) {
        foodParts.push(`Alergias${foodRestrictions.alergiasDetalle ? `: ${foodRestrictions.alergiasDetalle}` : ""}`);
      }
      if (foodParts.length > 0) {
        parts.push(`Restricciones alimentarias: ${foodParts.join(", ")}`);
      }
    }
    
    // Embarazo
    if (restrictions.pregnant) {
      parts.push("Embarazada");
    }
    
    // Problemas de salud/columna
    if (restrictions.healthIssues) {
      parts.push("Problemas de columna/salud");
    }
    
    // Compatibilidad con formato antiguo (por si acaso)
    if (restrictions.dietary) parts.push(`Dietarias: ${restrictions.dietary}`);
    if (restrictions.medical) parts.push(`Médicas: ${restrictions.medical}`);
    if (restrictions.mobility) parts.push(`Movilidad: ${restrictions.mobility}`);
    if (restrictions.other) parts.push(`Otras: ${restrictions.other}`);
    
    return parts.length > 0 ? parts.join("; ") : "";
  };
  
  const restrictionsText = formatRestrictions(p.restrictions);
  let passengerInfo = `${i + 1}. ${p.firstName} ${p.lastName} (${typeLabel}${ageText})`;
  if (documentText) passengerInfo += documentText;
  if (nationalityText) passengerInfo += nationalityText;
  if (p.email) passengerInfo += `\n   Email: ${p.email}`;
  if (p.phone) passengerInfo += `\n   Teléfono: ${p.phone}`;
  if (restrictionsText) passengerInfo += `\n   Restricciones: ${restrictionsText}`;
  return passengerInfo;
}).join("\n\n")}\n` : ""}

Tu reserva está confirmada y lista. Te esperamos en la fecha y hora indicadas.

Si tienes alguna pregunta o necesitas modificar tu reserva, no dudes en contactarnos.

---
${process.env.NEXT_PUBLIC_SITE_URL || "https://antartur.tur.ar"}
Este es un email automático, por favor no respondas directamente.
  `.trim();
}

