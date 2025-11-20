"use client";

import React from "react";
import { Icon, IconName } from "@/components/icons/Icon";
import { Calendar } from "@/modules/booking/components/Calendar";
import { useCurrency } from "@/contexts/CurrencyContext";
import type { Pricing } from "@/lib/types/order";
import { getPriceByCurrency, ensurePricingWithCurrency } from "@/lib/utils/pricingHelpers";
import styles from "./BannerBooking.module.scss";

interface BookingStep {
  id: string;
  icon: IconName;
  text: string;
}

interface AvailabilityDate {
  date: string;
  available: number;
  timeSlot: {
    start: string;
    end: string;
  };
}

interface BannerBookingProps {
  /** Pasos del proceso de reserva */
  steps?: BookingStep[];
  /** ID del tour */
  tourId?: string;
  /** Título del tour */
  tourTitle?: string;
  /** Fechas con disponibilidad */
  availability?: AvailabilityDate[];
  /** Precios del tour (legacy - sin currency) */
  pricing?: {
    priceAdult: number;
    priceChild: number;
  };
  /** Precios por moneda (nuevo formato) */
  prices?: {
    ARS?: { adult: number; child: number };
    USD?: { adult: number; child: number };
  };
}

const defaultSteps: BookingStep[] = [
  {
    id: "date",
    icon: "calendar-days",
    text: "Seleccioná la fecha",
  },
  {
    id: "passengers",
    icon: "users",
    text: "Seleccioná la cantidad de pasajeros (Adultos y niños)",
  },
  {
    id: "details",
    icon: "info",
    text: "Completá los datos de la reserva",
  },
  {
    id: "payment",
    icon: "credit-card",
    text: "Aboná online con múltiples medios de pago",
  },
];

/**
 * Componente BannerBooking para mostrar el proceso de reserva
 * 
 * Muestra un título y una lista de pasos del proceso de reserva con iconos,
 * junto con un componente de calendario (placeholder por ahora).
 * 
 * @example
 * ```tsx
 * <BannerBooking />
 * ```
 */
export const BannerBooking: React.FC<BannerBookingProps> = ({
  steps = defaultSteps,
  tourId,
  tourTitle,
  availability,
  pricing,
  prices,
}) => {
  const { currency } = useCurrency();
  
  // Obtener precio según la moneda seleccionada
  const currentPricing: Pricing | null = React.useMemo(() => {
    if (prices) {
      return getPriceByCurrency(prices, currency);
    }
    if (pricing) {
      return ensurePricingWithCurrency(pricing, currency);
    }
    return null;
  }, [prices, pricing, currency]);

  return (
    <div className={styles.bookingContainer}>
      <div className={styles.leftColumn}>
        <h2 className={styles.title}>¡Hacé tu reserva!</h2>
        <ul className={styles.stepsList}>
          {steps.map((step) => (
            <li key={step.id} className={styles.stepItem}>
              <Icon name={step.icon} size={24} className={styles.stepIcon} />
              <span className={styles.stepText}>{step.text}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className={styles.rightColumn}>
        {tourId && tourTitle && availability && currentPricing ? (
          <Calendar
            tourId={tourId}
            tourTitle={tourTitle}
            availability={availability}
            pricing={currentPricing}
          />
        ) : (
          <h2 className={styles.calendarTitle}>Calendario</h2>
        )}
      </div>
    </div>
  );
};

