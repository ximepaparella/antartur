/**
 * Hook para manejar la inicialización del checkout
 * Carga datos desde localStorage y prepara el estado inicial
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Passenger, BillingInfo } from "@/lib/types/order";
import { getPendingBooking } from "@/lib/utils/orderStorage";

export interface BookingData {
  tourId: string;
  tourTitle: string;
  date: string;
  adults: number;
  children: number;
  pricing: { priceAdult: number; priceChild: number };
  timeSlot: { start: string; end: string };
  exceedsAvailability: boolean;
}

interface UseCheckoutInitializationReturn {
  bookingData: BookingData | null;
  initialPassengers: Passenger[];
  initialBillingInfo: BillingInfo;
  isLoading: boolean;
}

/**
 * Hook para inicializar el checkout desde localStorage
 */
export function useCheckoutInitialization(): UseCheckoutInitializationReturn {
  const router = useRouter();
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [initialPassengers, setInitialPassengers] = useState<Passenger[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const initialBillingInfo: BillingInfo = {
    nombreCompleto: "",
    apellidos: "",
    email: "",
    telefono: "",
    direccion: "",
    ciudad: "",
    provincia: "",
    codigoPostal: "",
    pais: "Argentina",
    documento: "",
    notasPedido: "",
  };

  // Cargar datos del localStorage al montar
  useEffect(() => {
    const pending = getPendingBooking();
    if (pending) {
      setBookingData(pending);

      // Inicializar pasajeros
      const passengers: Passenger[] = [];

      // Crear pasajeros adultos
      for (let i = 0; i < pending.adults; i++) {
        passengers.push({
          nombreCompleto: "",
          fechaNacimiento: "",
          documento: "",
          direccion: "",
          telefono: "",
          tieneRestriccionesAlimentarias: false,
          esAdulto: true,
          embarazada: undefined,
          problemasColumnaSalud: undefined,
        });
      }

      // Crear pasajeros niños
      for (let i = 0; i < pending.children; i++) {
        passengers.push({
          nombreCompleto: "",
          fechaNacimiento: "",
          documento: "",
          direccion: "",
          telefono: "",
          tieneRestriccionesAlimentarias: false,
          esAdulto: false,
        });
      }

      setInitialPassengers(passengers);
      setIsLoading(false);
    } else {
      // Si no hay datos, redirigir al inicio
      router.push("/");
    }
  }, [router]);

  return {
    bookingData,
    initialPassengers,
    initialBillingInfo,
    isLoading,
  };
}

