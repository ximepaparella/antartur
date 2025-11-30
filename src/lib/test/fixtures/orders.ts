/**
 * Fixtures de datos de prueba para Orders
 */

import type { ReservationInput } from "@/modules/orders/domain/types";

export const mockReservationData: ReservationInput = {
  tourId: "test-tour-id",
  departureId: "test-departure-id",
  numAdults: 2,
  numChildren: 1,
  currency: "ARS",
  customerName: "John Doe",
  customerEmail: "john@example.com",
  customerPhone: "+5491112345678",
  passengers: [
    {
      type: "ADULT",
      firstName: "John",
      lastName: "Doe",
      birthDate: new Date("1990-01-01"),
      documentType: "DNI",
      documentNumber: "12345678",
      nationality: "Argentine",
      email: "john@example.com",
      phone: "+5491112345678",
    },
    {
      type: "ADULT",
      firstName: "Jane",
      lastName: "Doe",
      birthDate: new Date("1992-05-15"),
      documentType: "DNI",
      documentNumber: "87654321",
      nationality: "Argentine",
      email: "jane@example.com",
      phone: "+5491198765432",
    },
    {
      type: "CHILD",
      firstName: "Baby",
      lastName: "Doe",
      birthDate: new Date("2020-03-20"),
      documentType: "DNI",
      documentNumber: "11223344",
      nationality: "Argentine",
    },
  ],
  notes: "Test reservation",
};

