/**
 * Tipos e interfaces para el sistema de órdenes/reservas
 */

export interface Pricing {
  currencyCode: string;
  priceAdult: number;
  priceChild: number;
  // Nuevos campos para sistema de rangos de edad
  priceInfantFree?: boolean;
  childAgeRange?: string | null;
  childPriceType?: "FULL_CHILD_PRICE" | "HALF_ADULT_PRICE" | "ADULT_PRICE";
  infantMaxAge?: number;
}

export interface TourAdditional {
  id: string;
  name: string;
  description: string | null;
  prices: {
    ARS?: { adult: number; child: number };
    USD?: { adult: number; child: number };
  };
}

export interface SelectedAdditional {
  additionalId: string;
  name: string;
  priceAdult: number;
  priceChild: number;
  currency: string;
  // Precios en ambas monedas para permitir cambio de moneda sin necesidad de consultar la API
  // Opcional para compatibilidad con datos antiguos guardados antes de este cambio
  prices?: {
    ARS?: { adult: number; child: number };
    USD?: { adult: number; child: number };
  };
}

export interface TimeSlot {
  start: string; // HH:mm format
  end: string; // HH:mm format
}

export interface Passenger {
  /** ID único del pasajero (para identificación estable en React) */
  id?: string;
  /** Nombre completo del pasajero */
  nombreCompleto: string;
  /** Fecha de nacimiento en formato YYYY-MM-DD */
  fechaNacimiento: string;
  /** Documento o pasaporte */
  documento: string;
  /** Dirección */
  direccion: string;
  /** Teléfono */
  telefono: string;
  /** Si tiene restricciones alimentarias */
  tieneRestriccionesAlimentarias: boolean;
  /** Tipo de restricción alimentaria */
  restriccionesAlimentarias?: {
    vegetariano?: boolean;
    vegano?: boolean;
    celiaco?: boolean;
    alergias?: boolean;
    alergiasDetalle?: string; // Si alergias es true, detalle de las alergias
  };
  /** Si es adulto */
  esAdulto: boolean;
  /** Si es infante (0-3 años) */
  esInfante?: boolean;
  /** Si está embarazada (solo adultos) */
  embarazada?: boolean;
  /** Si tiene problemas de columna o salud (solo adultos) */
  problemasColumnaSalud?: boolean;
}

export interface BillingInfo {
  /** Nombre completo */
  nombreCompleto: string;
  /** Apellidos */
  apellidos: string;
  /** Email */
  email: string;
  /** Teléfono */
  telefono: string;
  /** Dirección */
  direccion: string;
  /** Ciudad */
  ciudad: string;
  /** Provincia/Región */
  provincia: string;
  /** Código postal */
  codigoPostal: string;
  /** País */
  pais: string;
  /** DNI/CUIT/CUIL */
  documento: string;
  /** Notas adicionales del pedido (opcional) */
  notasPedido?: string;
}

export type PaymentMethod = "transferencia" | "paypal" | "payway";

export type OrderType = "reserva" | "consulta";

export interface Order {
  /** ID único de la orden */
  orderId: string;
  /** ID del tour */
  tourId: string;
  /** Título del tour */
  tourTitle: string;
  /** Fecha de la reserva en formato YYYY-MM-DD */
  date: string;
  /** Cantidad de adultos */
  adults: number;
  /** Cantidad de niños */
  children: number;
  /** Cantidad de infantes */
  infants?: number;
  /** Precios del tour */
  pricing: Pricing;
  /** Horario del tour */
  timeSlot: TimeSlot;
  /** Additionals seleccionados */
  additionals?: SelectedAdditional[];
  /** Información de los pasajeros */
  passengers: Passenger[];
  /** Información de facturación */
  billingInfo: BillingInfo;
  /** Método de pago seleccionado */
  paymentMethod?: PaymentMethod;
  /** Tipo de orden: reserva o consulta */
  orderType: OrderType;
  /** Si excede la disponibilidad */
  exceedsAvailability: boolean;
  /** Fecha de creación de la orden */
  createdAt: string;
}

