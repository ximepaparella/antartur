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
  const normalizedPhone = phoneNumber.replace(/\D/g, "") || "5492901487838";
  return `https://wa.me/${normalizedPhone}?text=${encodedMessage}`;
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

export interface EnquiryWhatsAppData extends OrderWhatsAppData {
  customerEmail?: string;
  notes?: string;
  additionals?: Array<{ name: string }>;
  passengers: Array<OrderWhatsAppData["passengers"][number] & {
    fechaNacimiento?: string;
  }>;
}

/**
 * Genera el mensaje para continuar por WhatsApp una consulta registrada.
 */
export function generateEnquiryWhatsAppMessage(data: EnquiryWhatsAppData): string {
  const formattedDate = formatArDate(data.date, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const currencyPrefix = data.currency === "USD" ? "USD $" : "$";
  const totalPassengers = data.adults + data.children;
  const passengerList = data.passengers
    .map((passenger, index) => {
      const birthDate = passenger.fechaNacimiento
        ? `, nacimiento: ${passenger.fechaNacimiento}`
        : "";
      return `${index + 1}. ${passenger.nombreCompleto} (${passenger.esAdulto ? "Adulto" : "Menor"}${birthDate})`;
    })
    .join("\n");

  let message =
    `*Consulta de reserva ${data.code}*\n\n` +
    `*Cliente:* ${data.customerName}\n` +
    `${data.customerEmail ? `*Email:* ${data.customerEmail}\n` : ""}` +
    `${data.customerPhone ? `*Teléfono:* ${data.customerPhone}\n` : ""}` +
    `\n*Detalle de la consulta:*\n` +
    `• Excursión: ${data.tourTitle}\n` +
    `• Fecha: ${formattedDate}\n` +
    `• Horario: ${data.timeSlot.start} – ${data.timeSlot.end}\n` +
    `• Pasajeros: ${totalPassengers} (${data.adults} adultos, ${data.children} menores)\n` +
    `• Total estimado: ${currencyPrefix} ${data.totalAmount.toLocaleString("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}\n`;

  if (data.additionals?.length) {
    message += `• Adicionales: ${data.additionals.map((additional) => additional.name).join(", ")}\n`;
  }
  if (passengerList) {
    message += `\n*Pasajeros:*\n${passengerList}\n`;
  }
  if (data.notes) {
    message += `\n*Comentarios:* ${data.notes}\n`;
  }

  message += "\nQuiero continuar esta consulta con un asesor.";
  return message;
}

export function generateEnquiryWhatsAppLink(
  data: EnquiryWhatsAppData,
  phoneNumber?: string | null
): string {
  return generateWhatsAppLinkWithMessage(
    generateEnquiryWhatsAppMessage(data),
    phoneNumber || "5492901487838"
  );
}

