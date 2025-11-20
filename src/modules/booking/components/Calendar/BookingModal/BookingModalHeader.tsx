import React from "react";
import { Icon } from "@/components/icons/Icon";
import styles from "../Calendar.module.scss";

interface BookingModalHeaderProps {
  tourTitle: string;
  date: string;
  timeSlot: string;
}

/**
 * Componente BookingModalHeader para mostrar el encabezado del modal de reserva
 */
export const BookingModalHeader: React.FC<BookingModalHeaderProps> = ({
  tourTitle,
  date,
  timeSlot,
}) => {
  return (
    <div className={styles.modalReservationInfo}>
      <p className={styles.modalActivity}>{tourTitle}</p>
      <p className={styles.modalDateTime}>
        <Icon name="calendar-days" size={20} className={styles.modalIcon} />
        {date} a {timeSlot}
      </p>
    </div>
  );
};

