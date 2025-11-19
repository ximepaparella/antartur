"use client";

import React from "react";
import { Button } from "@/components/common/Button/Button";
import { Message } from "@/components/common/Message";
import { Modal } from "@/components/common/Modal";
import type { Pricing } from "@/lib/types/order";
import { calculateOrderTotal } from "@/lib/utils/pricing";
import { BookingModalHeader } from "./BookingModalHeader";
import { PassengerInputs } from "./PassengerInputs";
import { BookingSummary } from "./BookingSummary";
import styles from "../Calendar.module.scss";

interface BookingModalProps {
  tourTitle: string;
  date: string;
  timeSlot: string;
  pricing: Pricing;
  adults: number;
  childrenCount: number;
  onAdultsChange: (value: number) => void;
  onChildrenChange: (value: number) => void;
  onClose: () => void;
  onBooking: () => void;
  exceedsAvailability: boolean;
  isClosing?: boolean;
}

/**
 * Componente BookingModal para el modal de reserva
 */
export const BookingModal: React.FC<BookingModalProps> = ({
  tourTitle,
  date,
  timeSlot,
  pricing,
  adults,
  childrenCount,
  onAdultsChange,
  onChildrenChange,
  onClose,
  onBooking,
  exceedsAvailability,
  isClosing = false,
}) => {
  const subtotal = calculateOrderTotal(adults, childrenCount, pricing);

  return (
    <Modal
      isOpen={true}
      isClosing={isClosing}
      title="REALIZAR UNA RESERVA"
      size="medium"
      onClose={onClose}
    >
      <BookingModalHeader
        tourTitle={tourTitle}
        date={date}
        timeSlot={timeSlot}
      />

      <PassengerInputs
        adults={adults}
        childrenCount={childrenCount}
        onAdultsChange={onAdultsChange}
        onChildrenChange={onChildrenChange}
      />

      <BookingSummary
        subtotal={subtotal}
        exceedsAvailability={exceedsAvailability}
      />

      <div className={styles.modalActions}>
        <Button
          variant="primary"
          onClick={onBooking}
        >
          Realizar una reserva
        </Button>
        <Button
          variant="outline"
          onClick={onClose}
        >
          Cancelar Reserva
        </Button>
      </div>
    </Modal>
  );
};

