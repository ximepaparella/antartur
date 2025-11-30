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
                <h3 style="color: #2c5f7c; font-size: 16px; margin: 0 0 10px 0;">Pasajeros:</h3>
                <ul style="color: #333333; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                  ${data.passengers.map(p => `<li>${p.firstName} ${p.lastName} (${p.type})</li>`).join("")}
                </ul>
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

${data.passengers.length > 0 ? `Pasajeros:\n${data.passengers.map(p => `- ${p.firstName} ${p.lastName} (${p.type})`).join("\n")}\n` : ""}

Tu reserva está confirmada y lista. Te esperamos en la fecha y hora indicadas.

Si tienes alguna pregunta o necesitas modificar tu reserva, no dudes en contactarnos.

---
${process.env.NEXT_PUBLIC_SITE_URL || "https://antartur.tur.ar"}
Este es un email automático, por favor no respondas directamente.
  `.trim();
}

