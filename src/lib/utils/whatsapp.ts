/**
 * Utilidades para generar links de WhatsApp
 */

/**
 * Genera un link de WhatsApp con mensaje predefinido
 * @param tourName Nombre del tour para incluir en el mensaje
 * @param phoneNumber Número de teléfono (formato internacional sin +)
 * @returns URL de WhatsApp
 */
export function generateWhatsAppLink(tourName: string, phoneNumber: string = "5492901487838"): string {
  const message = `Quiero realizar una consulta sobre ${tourName}`;
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
}

