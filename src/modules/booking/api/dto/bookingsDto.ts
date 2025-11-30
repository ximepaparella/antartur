/**
 * Data Transfer Objects (DTOs) para Bookings
 * Re-exporta desde ordersDto para mantener consistencia
 */

export {
  toBookingResponse,
  type BookingResponse,
  toPassengerResponse,
  type PassengerResponse,
} from "../../../orders/api/dto/ordersDto";

