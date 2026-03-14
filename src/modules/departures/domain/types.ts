/**
 * Tipos de dominio para Departures
 */

export interface Departure {
  id: string;
  tourId: string;
  departureDate: Date;
  seatsTotal: number;
  seatsHeld: number;
  seatsConfirmed: number;
  isActive: boolean;
}

export interface CreateDepartureInput {
  tourId: string;
  departureDate: Date;
  seatsTotal: number;
  isActive?: boolean;
}

export interface UpdateDepartureInput extends Partial<CreateDepartureInput> {}

export interface DepartureAvailability {
  availableSeats: number;
  seatsTotal: number;
  seatsHeld: number;
  seatsConfirmed: number;
}

