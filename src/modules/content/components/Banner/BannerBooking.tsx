import React from "react";
import { Icon, IconName } from "@/components/icons/Icon";
import styles from "./BannerBooking.module.scss";

interface BookingStep {
  id: string;
  icon: IconName;
  text: string;
}

interface BannerBookingProps {
  /** Pasos del proceso de reserva */
  steps?: BookingStep[];
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
}) => {
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
        <h2 className={styles.calendarTitle}>Calendario</h2>
      </div>
    </div>
  );
};

