import { formatArDate } from "@/lib/utils/dateTimeAr";

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

/**
 * Genera un link de WhatsApp con mensaje personalizado
 * @param message Mensaje a enviar
 * @param phoneNumber Número de teléfono (formato internacional sin +)
 * @returns URL de WhatsApp
 */
export function generateWhatsAppLinkWithMessage(message: string, phoneNumber: string = "5492901487838"): string {
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
}

/**
 * Interfaz para los datos de una orden para generar extracto de WhatsApp
 */
export interface OrderWhatsAppData {
  code: string;
  tourTitle: string;
  date: string;
  timeSlot: {
    start: string;
    end: string;
  };
  adults: number;
  children: number;
  totalAmount: number;
  currency: string;
  customerName: string;
  customerPhone?: string;
  passengers: Array<{
    nombreCompleto: string;
    esAdulto: boolean;
  }>;
}

/**
 * Genera un extracto completo de la orden para enviar por WhatsApp
 * @param orderData Datos de la orden
 * @returns Mensaje formateado para WhatsApp
 */
export function generateOrderWhatsAppMessage(orderData: OrderWhatsAppData): string {
  // Formatear fecha
  const formattedDate = formatArDate(orderData.date, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Formatear hora
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    return `${hours}:${minutes}`;
  };

  // Formatear precio
  const formatPrice = (amount: number, currency: string) => {
    const symbol = currency === "USD" ? "USD $" : "$";
    return `${symbol} ${amount.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const totalPassengers = orderData.adults + orderData.children;
  
  // Construir mensaje base
  let message = `🚨 *Error al procesar reserva*\n\n`;
  
  if (orderData.code && orderData.code !== "PENDIENTE") {
    message += `*Código de orden:* ${orderData.code}\n`;
  }
  
  if (orderData.customerName) {
    message += `*Cliente:* ${orderData.customerName}\n`;
  }
  
  if (orderData.customerPhone) {
    message += `*Teléfono:* ${orderData.customerPhone}\n`;
  }
  
  message += `\n*Detalle de la Reserva:*\n` +
    `• Excursión: ${orderData.tourTitle}\n` +
    `• Fecha: ${formattedDate}\n` +
    `• Horario: ${formatTime(orderData.timeSlot.start)} – ${formatTime(orderData.timeSlot.end)}\n` +
    `• Pasajeros: ${totalPassengers} (${orderData.adults} ${orderData.adults === 1 ? "adulto" : "adultos"}, ${orderData.children} ${orderData.children === 1 ? "menor" : "menores"})\n` +
    `• Total: ${formatPrice(orderData.totalAmount, orderData.currency)}\n`;
  
  // Agregar lista de pasajeros solo si está disponible
  if (orderData.passengers && orderData.passengers.length > 0) {
    const passengersList = orderData.passengers
      .map((p, index) => `${index + 1}. ${p.nombreCompleto} (${p.esAdulto ? "Adulto" : "Menor"})`)
      .join("\n");
    message += `\n*Lista de Pasajeros:*\n${passengersList}`;
  }
  
  message += `\n\nNecesito ayuda para resolver este problema.`;

  return message;
}

/**
 * Genera un link de WhatsApp con extracto completo de la orden
 * @param orderData Datos de la orden
 * @param phoneNumber Número de teléfono (formato internacional sin +)
 * @returns URL de WhatsApp
 */
export function generateOrderWhatsAppLink(
  orderData: OrderWhatsAppData,
  phoneNumber: string = "5492901487838"
): string {
  const message = generateOrderWhatsAppMessage(orderData);
  return generateWhatsAppLinkWithMessage(message, phoneNumber);
}

