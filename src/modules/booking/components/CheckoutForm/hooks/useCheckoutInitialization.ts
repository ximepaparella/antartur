/**
 * Hook para manejar la inicialización del checkout
 * Carga datos desde localStorage y prepara el estado inicial
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Passenger, BillingInfo, Pricing } from "@/lib/types/order";
import { getPendingBooking } from "@/lib/utils/orderStorage";

export interface BookingData {
  tourId: string;
  tourTitle: string;
  date: string;
  adults: number;
  children: number;
  pricing: Pricing;
  timeSlot: { start: string; end: string };
  exceedsAvailability: boolean;
  additionals?: Array<{
    additionalId: string;
    name: string;
    priceAdult: number;
    priceChild: number;
    currency: string;
  }>;
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

      // Función helper para generar ID único
      const generatePassengerId = () => {
        return `passenger-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
      };

      // Crear pasajeros adultos
      for (let i = 0; i < pending.adults; i++) {
        passengers.push({
          id: generatePassengerId(),
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
          id: generatePassengerId(),
          nombreCompleto: "",
          fechaNacimiento: "",
          documento: "",
          direccion: "",
          telefono: "",
          tieneRestriccionesAlimentarias: false,
          esAdulto: false,
        });
      }

      // Crear pasajeros infantes
      const infants = pending.infants || 0;
      for (let i = 0; i < infants; i++) {
        passengers.push({
          id: generatePassengerId(),
          nombreCompleto: "",
          fechaNacimiento: "",
          documento: "",
          direccion: "",
          telefono: "",
          tieneRestriccionesAlimentarias: false,
          esAdulto: false,
          esInfante: true,
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

